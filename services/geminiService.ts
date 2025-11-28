
import { GoogleGenAI } from "@google/genai";
import { StockCandidate, ScanResult, SearchSource, MoversResult, MarketMover, OversoldResult, WatchlistItem, StockAnalysisFull, HeatmapResult, NewsFeedResult, InsiderScanResult, ScreenshotAnalysisResult, MarketIndex, EconomicEvent, CryptoCandidate, DailyMarketSummary, GainersLosersResult, ScannerFilters, EarningsFilters, MarketMoversFilters } from "../types";
import { getActiveKey } from './apiManager';

// Dynamic Key Resolver: Check Settings first, then Env
const getGeminiKey = () => {
  const userKey = getActiveKey('gemini');
  return userKey || process.env.API_KEY || "";
};

// Re-initialize AI client function to allow updates
const getAiClient = () => new GoogleGenAI({ apiKey: getGeminiKey() });

const modelId = "gemini-2.5-flash"; 

// --- CACHE SYSTEM ---
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL_MS = 60 * 1000; // 1 Minute Cache for "Real-time" feel without lag
const DATA_CACHE = new Map<string, CacheEntry<any>>();

const getCached = <T>(key: string): T | null => {
  const entry = DATA_CACHE.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    DATA_CACHE.delete(key);
    return null;
  }
  return entry.data;
};

const setCache = <T>(key: string, data: T) => {
  DATA_CACHE.set(key, { data, timestamp: Date.now() });
};

export const clearCache = (keyPattern?: string) => {
  if (!keyPattern) {
    DATA_CACHE.clear();
  } else {
    for (const key of DATA_CACHE.keys()) {
      if (key.includes(keyPattern)) DATA_CACHE.delete(key);
    }
  }
};

// --- REQUEST QUEUE ---
class RequestQueue {
  private queue: (() => Promise<any>)[] = [];
  private isProcessing = false;
  // Reduced delay to 2s to feel faster, relying on cache to prevent hitting limits
  private delayMs = 6000; 

  add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        await task();
        // Allow a small "burst" but wait between subsequent heavy calls
        if (this.queue.length > 0) {
           await new Promise(resolve => setTimeout(resolve, this.delayMs));
        }
      }
    }

    this.isProcessing = false;
  }
}

const globalRequestQueue = new RequestQueue();

// Helper to extract JSON robustly
const extractJson = (text: string | undefined | null): any => {
  if (!text) return {};

  let jsonString = "";
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    jsonString = codeBlockMatch[1];
  } else {
    const firstBrace = text.indexOf('{');
    const firstBracket = text.indexOf('[');
    let startIdx = -1;
    if (firstBrace !== -1 && firstBracket !== -1) {
        startIdx = Math.min(firstBrace, firstBracket);
    } else if (firstBrace !== -1) {
        startIdx = firstBrace;
    } else if (firstBracket !== -1) {
        startIdx = firstBracket;
    }

    // Instead of throwing, return empty object to prevent crash
    if (startIdx === -1) {
        console.warn("Gemini Non-JSON Response (Start):", text.substring(0, 100));
        return {}; 
    }
    
    const lastBrace = text.lastIndexOf('}');
    const lastBracket = text.lastIndexOf(']');
    const endIdx = Math.max(lastBrace, lastBracket);
    
    if (endIdx <= startIdx) {
        console.warn("Gemini Non-JSON Response (End):", text.substring(0, 100));
        return {};
    }
    
    jsonString = text.substring(startIdx, endIdx + 1);
  }

  try {
    jsonString = jsonString.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g1) => g1 ? "" : m);
    jsonString = jsonString.replace(/,\s*([\]}])/g, '$1');
    return JSON.parse(jsonString);
  } catch (e) {
      console.error("Failed to parse extracted JSON string:", jsonString.substring(0, 100));
      return {}; // Return empty object on parse error
  }
};

const generateContentWithRetry = async (params: any, retries = 10) => {
  // Check request-based cache (optional, but good for identical prompts)
  const cacheKey = `req_${JSON.stringify(params.contents).substring(0, 50)}`;
  
  return globalRequestQueue.add(async () => {
    let attempt = 0;
    while (attempt < retries) {
      try {
        // ALWAYS Get a fresh client to ensure latest API key is used
        const ai = getAiClient();
        return await ai.models.generateContent(params);
      } catch (error: any) {
        const isRateLimit = 
          error?.code === 429 || 
          error?.status === 429 || 
          error?.error?.code === 429 || 
          error?.error?.status === 'RESOURCE_EXHAUSTED' ||
          error?.message?.includes('429');

        if (isRateLimit) {
          attempt++;
          if (attempt >= retries) {
            throw new Error("API Quota Exceeded. Please try again in a moment.");
          }
          const backoff = 5000 * Math.pow(1.5, attempt - 1);
          console.warn(`Rate limit hit. Retrying in ${backoff/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, backoff));
          continue;
        }
        throw error;
      }
    }
  });
};

const getSources = (response: any): SearchSource[] => {
  const sources: SearchSource[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  chunks.forEach((chunk: any) => {
    if (chunk.web?.uri && chunk.web?.title) {
      sources.push({ uri: chunk.web.uri, title: chunk.web.title });
    }
  });
  return sources;
};

// Helper: Sanitize Market Summary to prevent Object-as-Child errors
const sanitizeDailyMarketSummary = (raw: any): DailyMarketSummary => {
  let summaryText = "";
  
  // Handle complex structured response (like the one causing errors)
  if (raw?.overallTrend || raw?.outlook) {
     const trend = typeof raw.overallTrend === 'string' ? raw.overallTrend : '';
     const outlook = typeof raw.outlook === 'string' ? raw.outlook : '';
     summaryText = [trend, outlook].filter(Boolean).join(" ");
  } 
  else if (typeof raw?.summary === 'string') {
    summaryText = raw.summary;
  } else if (raw?.summary && typeof raw.summary === 'object') {
    // Flatten object summary if AI returns structure
    summaryText = raw.summary.overview || raw.summary.text || JSON.stringify(raw.summary);
  } else if (typeof raw?.marketOverview === 'string') {
    summaryText = raw.marketOverview;
  }

  // Ensure keyPoints are strings
  let points: string[] = [];
  // Add 'keyDrivers' to check list as it's common in structured AI responses
  const rawPoints = raw?.keyPoints || raw?.highlights || raw?.keyDrivers || []; 
  if (Array.isArray(rawPoints)) {
    points = rawPoints.map((p: any) => {
      if (typeof p === 'string') return p;
      return p.title || p.text || p.driver || JSON.stringify(p);
    });
  }

  // Determine sentiment safely
  let sentiment: 'Bullish' | 'Bearish' | 'Neutral' | 'Mixed' = 'Neutral';
  if (typeof raw?.sentiment === 'string') {
      sentiment = raw.sentiment;
  } else if (typeof raw?.overallTrend === 'string') {
      const trendLower = raw.overallTrend.toLowerCase();
      if (trendLower.includes('bullish')) sentiment = 'Bullish';
      else if (trendLower.includes('bearish')) sentiment = 'Bearish';
      else if (trendLower.includes('mixed')) sentiment = 'Mixed';
  }

  return {
    sentiment,
    summary: summaryText || "Market summary unavailable.",
    keyPoints: points
  };
};

// --- SCANNERS (Cached) ---

export const scanMarket = async (forceRefresh = false, filters?: ScannerFilters): Promise<ScanResult> => {
    // Cache key depends on filters if they exist
    const filterKey = filters ? JSON.stringify(filters) : 'default';
    const cacheKey = `scan_market_${filterKey}`;

    if (!forceRefresh) {
        const cached = getCached<ScanResult>(cacheKey);
        if (cached) return cached;
    }
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    // Construct dynamic criteria based on filters
    let filterPrompt = "";
    if (filters) {
        if (filters.enableRoss) {
            filterPrompt += `
            STRICT ROSS CAMERON 5-STEP CRITERIA ACTIVE:
            1. Relative Volume (RVOL) MUST be >= 5x.
            2. Price MUST be between $2 and $20.
            3. Float MUST be under 10 Million shares.
            4. Gap Up MUST be >= 2%.
            5. Projected Daily Volume > 25M.
            6. Catalyst Required (News/Earnings).
            7. Exclude ETFs/Warrants.
            `;
        } else {
            if (filters.projVolume) filterPrompt += "- Projected EOD Volume > 25M (Extremely high relative volume today)\n";
            if (filters.morningActive) filterPrompt += "- Strong activity/movement specifically in the 7am - 11am ET window (Morning Gappers)\n";
            if (filters.breakout) filterPrompt += "- Price MUST be above Pre-Market Highs or Previous Day Highs (Breakout)\n";
            if (filters.highVolatility) filterPrompt += "- High Intraday Volatility (Range > 5%)\n";
            if (filters.excludeDerivatives) filterPrompt += "- EXCLUDE: ETFs, SPACs, Warrants, Rights, and Buyouts. Common stock only.\n";
            if (filters.lowFloatRetail) filterPrompt += "- Institutional Ownership < 30% (Retail driven momentum)\n";
        }
    }

    const prompt = `
      Perform a LIVE market scan for today, ${today}.
      Using Google Search, identify 8-10 U.S. listed stocks that are currently top gainers or showing strong momentum.
      
      BASE CRITERIA:
      1. Gap Up > 3%
      2. High Relative Volume (RVOL > 1.5)
      3. Active news catalyst (Earnings, FDA, Contracts, Analyst Upgrade) if available.
      4. Do NOT show data for future dates/times. Only data available right now.

      ADDITIONAL FILTERS (Strictly Apply These):
      ${filterPrompt}
      
      STRICT JSON OUTPUT ONLY. No markdown.
      Return a JSON object matching this structure EXACTLY:
      {
        "marketSummary": "Brief overview of today's market momentum...",
        "stocks": [
          {
            "symbol": "TICKER",
            "companyName": "Company Inc",
            "price": "$12.34",
            "gapPercent": "+15.4%",
            "volume": "5.2M",
            "relativeVolume": "3.5x",
            "float": "15M",
            "sector": "Tech/Biotech",
            "catalyst": "FDA Approval / Earnings / Contract",
            "summary": "Short explanation of the move"
          }
        ]
      }
    `;
    try {
        const response: any = await generateContentWithRetry({
            model: modelId, contents: prompt, config: { tools: [{ googleSearch: {} }], temperature: 0.1 }
        });
        const parsed = extractJson(response?.text);
        const stocks = Array.isArray(parsed?.stocks) ? parsed.stocks : [];
        const result = { stocks, marketSummary: parsed.marketSummary || "Market data available.", sources: getSources(response) };
        setCache(cacheKey, result);
        return result;
    } catch (e) { throw e; }
};

export const scanEarningsGappers = async (forceRefresh = false, filters?: EarningsFilters): Promise<ScanResult> => {
    const filterKey = filters ? JSON.stringify(filters) : 'default';
    const cacheKey = `scan_earnings_${filterKey}`;

    if (!forceRefresh) {
        const cached = getCached<ScanResult>(cacheKey);
        if (cached) return cached;
    }

    // Construct filter prompt
    let filterInstructions = "";
    if (filters) {
        if (filters.epsBeat) filterInstructions += "- MUST have beaten EPS estimates (Actual > Est).\n";
        if (filters.revBeat) filterInstructions += "- MUST have beaten Revenue estimates.\n";
        if (filters.move5Percent) filterInstructions += "- Price change MUST be >= +5% OR <= -5%.\n";
        if (filters.vol5M) filterInstructions += "- Volume MUST be > 5,000,000 shares.\n";
        if (filters.rvol2x) filterInstructions += "- Relative Volume (RVOL) MUST be > 2.0x.\n";
        if (filters.priceRange) filterInstructions += "- Price MUST be between $2 and $100.\n";
        if (filters.session !== 'ALL') filterInstructions += `- Show ONLY stocks moving in the ${filters.session} market session.\n`;
        if (filters.sector && filters.sector !== 'ALL') filterInstructions += `- Filter for stocks in the ${filters.sector} sector.\n`;
    }

    const prompt = `
      Find major stock movers driven by RECENT earnings reports (Last 24-48 hours).
      
      STRICT FILTERS TO APPLY:
      ${filterInstructions}

      Return the TOP 20 results matching these criteria to ensure we can select the best 15.
      
      STRICT JSON OUTPUT ONLY.
      Return: { 
        "stocks": [
           { 
             "symbol": "TICKER", 
             "companyName": "Name", 
             "price": "$25.00", 
             "gapPercent": "+12%", 
             "volume": "10M", 
             "relativeVolume": "3x", 
             "catalyst": "Earnings Beat: EPS $0.50 vs $0.40", 
             "summary": "Revenue beat by 10%, strong guidance." 
           } 
        ], 
        "marketSummary": "Overview of earnings reactions..." 
      }
    `;
    try {
        const response: any = await generateContentWithRetry({
            model: modelId, contents: prompt, config: { tools: [{ googleSearch: {} }], temperature: 0.1 }
        });
        const parsed = extractJson(response?.text);
        const stocks = Array.isArray(parsed?.stocks) ? parsed.stocks : [];
        const result = { stocks, marketSummary: parsed.marketSummary || "", sources: getSources(response) };
        setCache(cacheKey, result);
        return result;
    } catch (e) { throw e; }
};

export const scanMarketMovers = async (forceRefresh = false, filters?: MarketMoversFilters): Promise<MoversResult> => {
    const filterKey = filters ? JSON.stringify(filters) : 'default';
    const cacheKey = `scan_movers_${filterKey}`;

    if (!forceRefresh) {
        const cached = getCached<MoversResult>(cacheKey);
        if (cached) return cached;
    }

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    let filterPrompt = "";
    if (filters) {
        if (filters.mode === 'GAINERS') filterPrompt += "- SHOW ONLY TOP GAINERS (Positive % Change).\n";
        else if (filters.mode === 'LOSERS') filterPrompt += "- SHOW ONLY TOP LOSERS (Negative % Change).\n";
        
        if (filters.cap === 'SMALL') filterPrompt += "- Market Cap: Small Cap (< $2B).\n";
        else if (filters.cap === 'MID') filterPrompt += "- Market Cap: Mid Cap ($2B - $10B).\n";
        else if (filters.cap === 'LARGE') filterPrompt += "- Market Cap: Large Cap (> $10B).\n";
    }

    const prompt = `
        Perform a LIVE market scan for today, ${today}.
        Identify the hottest, most active market movers right now.
        
        STRICT CRITERIA:
        1. Price Change >= 5% (Up or Down)
        2. Current Volume > 1,000,000 shares
        3. Relative Volume (RVOL) > 2.0x (Unusual Volume)
        4. Exclude ETFs, Funds, and Warrants. Common Stock Only.
        
        ADDITIONAL FILTERS:
        ${filterPrompt}

        Rank by highest % movement first.

        STRICT JSON OUTPUT ONLY.
        Return: {
            "marketSummary": "Brief summary of what sectors are moving...",
            "movers": [
                {
                    "ticker": "SYM",
                    "companyName": "Name",
                    "currentPrice": "$12.50",
                    "priceMovement": "+15.2%",
                    "volumeChange": "4.5x",
                    "volume": "12M",
                    "marketSentiment": 9,
                    "keyCatalyst": "News headline or reason",
                    "technicalMomentum": "Bullish",
                    "whyItsHot": "Breaking news + volume spike above resistance.",
                    "marketCap": "Small"
                }
            ]
        }
    `;
    try {
        const response: any = await generateContentWithRetry({
            model: modelId, contents: prompt, config: { tools: [{ googleSearch: {} }], temperature: 0.1 }
        });
        const parsed = extractJson(response?.text);
        const movers = Array.isArray(parsed?.movers) ? parsed.movers : [];
        const result = { movers, marketSummary: parsed.marketSummary || "", sources: getSources(response) };
        setCache(cacheKey, result);
        return result;
    } catch (e) { throw e; }
};

export const scanOversoldRebounds = async (forceRefresh = false): Promise<OversoldResult> => {
    if (!forceRefresh) {
        const cached = getCached<OversoldResult>('scan_oversold');
        if (cached) return cached;
    }
    const prompt = `Find oversold rebound stocks. STRICT JSON OUTPUT ONLY. Return { "candidates": [...], "marketSummary": "..." }`;
    try {
        const response: any = await generateContentWithRetry({
            model: modelId, contents: prompt, config: { tools: [{ googleSearch: {} }], temperature: 0.1 }
        });
        const parsed = extractJson(response?.text);
        const candidates = Array.isArray(parsed?.candidates) ? parsed.candidates : [];
        const result = { candidates, marketSummary: parsed.marketSummary || "", sources: getSources(response) };
        setCache('scan_oversold', result);
        return result;
    } catch (e) { throw e; }
};

export const scanInsiderTrading = async (forceRefresh = false): Promise<InsiderScanResult> => {
    if (!forceRefresh) {
        const cached = getCached<InsiderScanResult>('scan_insider');
        if (cached) return cached;
    }
    const prompt = `Find insider trading activity. STRICT JSON OUTPUT ONLY. Return { "stocks": [...], "marketSummary": "..." }`;
    try {
        const response: any = await generateContentWithRetry({
            model: modelId, contents: prompt, config: { tools: [{ googleSearch: {} }], temperature: 0.1 }
        });
        const parsed = extractJson(response?.text);
        const stocks = Array.isArray(parsed?.stocks) ? parsed.stocks : [];
        const result = { stocks, marketSummary: parsed.marketSummary || "", sources: getSources(response) };
        setCache('scan_insider', result);
        return result;
    } catch (e) { throw e; }
};

export const scanMarketHeatmaps = async (forceRefresh = false): Promise<HeatmapResult> => {
    if (!forceRefresh) {
        const cached = getCached<HeatmapResult>('scan_heatmaps');
        if (cached) return cached;
    }
    const prompt = `Generate market heatmaps (sector, vol, options, volume). STRICT JSON OUTPUT ONLY. Return { "sectors": [], "volatility": [], "options": [], "volume": [] }`;
    try {
        const response: any = await generateContentWithRetry({
            model: modelId, contents: prompt, config: { tools: [{ googleSearch: {} }], temperature: 0.1 }
        });
        const parsed = extractJson(response?.text);
        // Ensure arrays are valid
        const result = { 
            sectors: Array.isArray(parsed.sectors) ? parsed.sectors : [],
            volatility: Array.isArray(parsed.volatility) ? parsed.volatility : [],
            options: Array.isArray(parsed.options) ? parsed.options : [],
            volume: Array.isArray(parsed.volume) ? parsed.volume : [],
            marketSummary: parsed.marketSummary || "",
            sources: getSources(response) 
        };
        setCache('scan_heatmaps', result);
        return result;
    } catch (e) { throw e; }
};

export const fetchMarketNews = async (watchlist: string[], forceRefresh = false): Promise<NewsFeedResult> => {
    const key = `news_${watchlist.join('_') || 'all'}`;
    if (!forceRefresh) {
        const cached = getCached<NewsFeedResult>(key);
        if (cached) return cached;
    }
    const prompt = `Fetch news for ${watchlist.join(',') || 'market'}. STRICT JSON OUTPUT ONLY. Return { "breakingNews": [], ... }`;
    try {
        const response: any = await generateContentWithRetry({
            model: modelId, contents: prompt, config: { tools: [{ googleSearch: {} }], temperature: 0.1 }
        });
        const parsed = extractJson(response?.text);
        // Ensure lists are arrays
        const safeParsed = {
            breakingNews: Array.isArray(parsed?.breakingNews) ? parsed.breakingNews : [],
            watchlistNews: Array.isArray(parsed?.watchlistNews) ? parsed.watchlistNews : [],
            marketNews: Array.isArray(parsed?.marketNews) ? parsed.marketNews : [],
            trendingNews: Array.isArray(parsed?.trendingNews) ? parsed.trendingNews : [],
            earningsNews: Array.isArray(parsed?.earningsNews) ? parsed.earningsNews : [],
            analystNews: Array.isArray(parsed?.analystNews) ? parsed.analystNews : [],
            companyNews: Array.isArray(parsed?.companyNews) ? parsed.companyNews : [],
            sources: getSources(response)
        };
        setCache(key, safeParsed);
        return safeParsed;
    } catch (e) { throw e; }
};

export const fetchMarketIndices = async (forceRefresh = false): Promise<MarketIndex[]> => {
    if (!forceRefresh) {
        const cached = getCached<MarketIndex[]>('market_indices');
        if (cached) return cached;
    }
    const prompt = `Fetch SPY, QQQ, DIA, IWM. STRICT JSON OUTPUT ONLY. Return array of objects.`;
    try {
        const response: any = await generateContentWithRetry({
            model: modelId, contents: prompt, config: { tools: [{ googleSearch: {} }], temperature: 0.1 }
        });
        const raw = extractJson(response?.text);
        
        let result: any[] = [];
        if (Array.isArray(raw)) result = raw;
        else if (raw && Array.isArray(raw.indices)) result = raw.indices;
        else if (raw && Array.isArray(raw.marketIndices)) result = raw.marketIndices;
        
        // Sanitize to ensure no objects are passed as strings
        const cleanResult: MarketIndex[] = result.map(item => {
            if (typeof item !== 'object' || !item) return null;
            // Filter out nested summary objects if they appeared in array
            if ('overallTrend' in item || 'date' in item) return null; 

            return {
                symbol: typeof item.symbol === 'object' ? 'UNK' : String(item.symbol || 'UNK'),
                name: typeof item.name === 'object' ? '' : String(item.name || ''),
                price: typeof item.price === 'object' ? '-' : String(item.price || '-'),
                change: typeof item.change === 'object' ? '0.00' : String(item.change || '0.00'),
                changePercent: typeof item.changePercent === 'object' ? '0.00%' : String(item.changePercent || '0.00%'),
                sentiment: typeof item.sentiment === 'string' ? item.sentiment : 'Neutral'
            };
        }).filter(Boolean) as MarketIndex[];

        setCache('market_indices', cleanResult);
        return cleanResult;
    } catch (e) { return []; }
};

export const fetchEconomicCalendar = async (range: string = 'Today', forceRefresh = false): Promise<EconomicEvent[]> => {
    const key = `calendar_${range}`;
    if (!forceRefresh) {
        const cached = getCached<EconomicEvent[]>(key);
        if (cached) return cached;
    }
    const prompt = `Fetch economic events for ${range}. STRICT JSON OUTPUT ONLY. Return array of objects.`;
    try {
        const response: any = await generateContentWithRetry({
            model: modelId, contents: prompt, config: { tools: [{ googleSearch: {} }], temperature: 0.1 }
        });
        const raw = extractJson(response?.text);
        let result: EconomicEvent[] = [];
        if (Array.isArray(raw)) result = raw;
        else if (raw && Array.isArray(raw.events)) result = raw.events;

        setCache(key, result);
        return result;
    } catch (e) { return []; }
};

export const fetchTopGainersLosers = async (forceRefresh = false): Promise<GainersLosersResult> => {
    if (!forceRefresh) {
        const cached = getCached<GainersLosersResult>('gainers_losers');
        if (cached) return cached;
    }
    const prompt = `Fetch top gainers/losers. STRICT JSON OUTPUT ONLY. Return { "gainers": [], "losers": [] }`;
    try {
        const response: any = await generateContentWithRetry({
            model: modelId, contents: prompt, config: { tools: [{ googleSearch: {} }], temperature: 0.1 }
        });
        const raw = extractJson(response?.text);
        
        // Helper to sanitize stock list
        const sanitizeStocks = (list: any[]) => {
            if (!Array.isArray(list)) return [];
            return list.map(s => ({
                ...s,
                symbol: typeof s.symbol === 'object' ? 'UNK' : String(s.symbol || ''),
                price: typeof s.price === 'object' ? '0' : String(s.price || '0'),
                gapPercent: typeof s.gapPercent === 'object' ? '0%' : String(s.gapPercent || '0%')
            }));
        };

        const result = {
            gainers: sanitizeStocks(raw?.gainers),
            losers: sanitizeStocks(raw?.losers)
        };
        setCache('gainers_losers', result);
        return result;
    } catch (e) { return { gainers: [], losers: [] }; }
};

export const fetchDailyMarketSummary = async (forceRefresh = false): Promise<DailyMarketSummary> => {
    if (!forceRefresh) {
        const cached = getCached<DailyMarketSummary>('market_summary');
        if (cached) return cached;
    }
    const prompt = `Fetch market summary. STRICT JSON OUTPUT ONLY. Return { "sentiment": "...", "summary": "...", "keyPoints": [] }`;
    try {
        const response: any = await generateContentWithRetry({
            model: modelId, contents: prompt, config: { tools: [{ googleSearch: {} }], temperature: 0.2 }
        });
        const raw = extractJson(response?.text);
        const result = sanitizeDailyMarketSummary(raw);
        setCache('market_summary', result);
        return result;
    } catch (e) { return { sentiment: 'Neutral', summary: 'Failed to fetch summary', keyPoints: [] }; }
};

export const refreshStockQuotes = async (stocks: StockCandidate[]): Promise<StockCandidate[]> => {
    return stocks; // Simplified for now
};

export const fetchWatchlistQuotes = async (symbols: string[], forceRefresh = false): Promise<WatchlistItem[]> => {
    const key = `quotes_${symbols.join('_')}`;
    if (!forceRefresh) {
        const cached = getCached<WatchlistItem[]>(key);
        if (cached) return cached;
    }
    const prompt = `
      Analyze the following stock tickers: ${symbols.join(',')}.
      STRICT JSON OUTPUT ONLY.
      For each stock, return a JSON object with:
      - symbol, companyName, price, changePercent
      - relativeVolume (e.g. "1.5")
      - miniChart ("Uptrend", "Downtrend", "Sideways")
      - insight ("Bullish", "Bearish", "Neutral")
      - volatilityType ("Low", "Medium", "High")
      - newsStatus ("Positive", "Negative", "Neutral")
      - srStatus ("Resistance", "Support", "None")
      Return a JSON array.
    `;
    try {
        const response: any = await generateContentWithRetry({
            model: modelId, contents: prompt, config: { tools: [{ googleSearch: {} }], temperature: 0.1 }
        });
        const data = extractJson(response?.text);
        const result = Array.isArray(data) ? data : [];
        setCache(key, result);
        return result;
    } catch (e) { return []; }
};

export const extractTickersFromImage = async (base64: string): Promise<ScreenshotAnalysisResult> => {
    // No caching for images typically
    const prompt = `Extract tickers. STRICT JSON OUTPUT ONLY. Return { "foundTickers": [...] }`;
    try {
        const imagePart = { inlineData: { data: base64, mimeType: 'image/jpeg' } };
        const response: any = await generateContentWithRetry({
            model: modelId, contents: { role: 'user', parts: [imagePart, { text: prompt }] }
        });
        const parsed = extractJson(response?.text);
        return {
            foundTickers: Array.isArray(parsed?.foundTickers) ? parsed.foundTickers : [],
            confidence: parsed?.confidence || 'Low',
            summary: parsed?.summary || 'Analysis complete.',
            suggestions: parsed?.suggestions
        };
    } catch (e) { throw e; }
};

export const analyzeStockFull = async (symbol: string, forceRefresh = false): Promise<StockAnalysisFull> => {
  const key = `analysis_${symbol}`;
  if (!forceRefresh) {
      const cached = getCached<StockAnalysisFull>(key);
      if (cached) return cached;
  }

  const prompt = `
    Analyze stock: ${symbol}. Use real-time data if possible via tools.
    STRICT JSON OUTPUT ONLY.
    CRITICAL: All timestamps (candles, news) must be in the PAST relative to now (${new Date().toLocaleTimeString()}). 
    Do not generate data for future times (e.g. if it is 10:00 AM, do not show 2:00 PM candles).
    
    REQUIRED: Return a JSON object strictly matching this structure (use numbers for prices/values):
    {
      "symbol": "${symbol}",
      "companyName": "Company Name",
      "price": 125.50,
      "change": 1.25,
      "changePercent": 1.01,
      "currency": "USD",
      "candles": [
         { "time": "09:30", "open": 100, "high": 105, "low": 99, "close": 102, "volume": 1000, "rsi": 55, "macd": 0.5, "macdSignal": 0.4, "macdHist": 0.1 },
         ... (30-50 SIMULATED 1-min candles. Include rsi/macd values)
      ],
      "overlays": [
         { "type": "Support", "label": "Major Support", "yValue": 98.50, "color": "#10B981", "strength": "Major", "testCount": 4, "method": "Volume Node" },
         { "type": "Resistance", "label": "Key Resistance", "yValue": 108.00, "color": "#EF4444", "strength": "Minor", "testCount": 2, "method": "Swing High" }
      ],
      "fundamentals": { 
         "marketCap": "10.5B", "float": "50M", "peRatio": "22.5", "avgVolume": "1.2M" 
      },
      "technicals": {
         "rsi": 55, "macd": "Bullish Crossover", "summary": "Strong uptrend with volume support.", "trend": "Bullish"
      },
      "news": [
         { "headline": "Earnings Beat Expectations", "source": "FinanceNews", "time": "08:30 AM", "sentiment": "Positive" }
      ]
    }
  `;

  try {
      const response: any = await generateContentWithRetry({
          model: modelId, contents: prompt, config: { tools: [{ googleSearch: {} }], temperature: 0.1 }
      });
      const parsed = extractJson(response?.text);
      
      // Safety checks
      const safeData: StockAnalysisFull = {
          symbol: parsed.symbol || symbol,
          companyName: parsed.companyName || symbol,
          price: Number(parsed.price) || 0,
          change: Number(parsed.change) || 0,
          changePercent: Number(parsed.changePercent) || 0,
          candles: Array.isArray(parsed.candles) ? parsed.candles : [],
          overlays: Array.isArray(parsed.overlays) ? parsed.overlays : [],
          fundamentals: parsed.fundamentals || {},
          technicals: parsed.technicals || {},
          news: Array.isArray(parsed.news) ? parsed.news : []
      };

      setCache(key, safeData);
      return safeData;
  } catch (e) { throw e; }
};

export const chatWithAnalyst = async (userMessage: string, contextData: any): Promise<string> => {
  const prompt = `
    You are a professional Wall Street Market Analyst AI.
    
    Context Data (Current Stock/Market View):
    ${JSON.stringify(contextData || {}, null, 2)}

    User Question: "${userMessage}"

    Answer the user concisely and professionally using the context data provided. 
    If specific stock data is present, quote numbers (price, RSI, support levels).
    If no context is relevant, answer based on general market knowledge.
    Keep it under 3-4 sentences unless detailed analysis is asked.
  `;
  
  try {
      const response: any = await generateContentWithRetry({
          model: modelId, contents: prompt, config: { temperature: 0.7 }
      });
      return response?.text || "I couldn't generate a response.";
  } catch (e) {
      console.error(e);
      return "Service unavailable.";
  }
};
