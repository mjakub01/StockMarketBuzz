
import { GoogleGenAI } from "@google/genai";
import { StockCandidate, ScanResult, SearchSource, MoversResult, MarketMover, OversoldResult, WatchlistItem, StockTechnicalAnalysis, HeatmapResult, NewsFeedResult, InsiderScanResult, ScreenshotAnalysisResult, MarketIndex, EconomicEvent, CryptoCandidate, DailyMarketSummary, GainersLosersResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

const modelId = "gemini-2.5-flash"; 

// --- REQUEST QUEUE FOR RATE LIMITING ---
class RequestQueue {
  private queue: (() => Promise<any>)[] = [];
  private isProcessing = false;
  // Increased delay to 6000ms (1 request every 6 seconds) = 10 RPM. 
  // Free tier limit is 15 RPM. This provides a safe buffer.
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
        // Wait before next request to enforce rate limit
        await new Promise(resolve => setTimeout(resolve, this.delayMs));
      }
    }

    this.isProcessing = false;
  }
}

const globalRequestQueue = new RequestQueue();

// Helper to extract JSON robustly from AI response
const extractJson = (text: string | undefined | null): any => {
  if (!text) return {};

  let jsonString = "";

  // 1. Try finding markdown code block with or without language tag
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    jsonString = codeBlockMatch[1];
  } else {
    // 2. Fallback: Find the outer-most JSON structure (Object or Array)
    const firstBrace = text.indexOf('{');
    const firstBracket = text.indexOf('[');
    
    // Determine start index (earliest of { or [)
    let startIdx = -1;
    if (firstBrace !== -1 && firstBracket !== -1) {
        startIdx = Math.min(firstBrace, firstBracket);
    } else if (firstBrace !== -1) {
        startIdx = firstBrace;
    } else if (firstBracket !== -1) {
        startIdx = firstBracket;
    }

    if (startIdx === -1) throw new Error("No JSON structure found in response text.");

    // Determine end index (latest of } or ])
    const lastBrace = text.lastIndexOf('}');
    const lastBracket = text.lastIndexOf(']');
    const endIdx = Math.max(lastBrace, lastBracket);

    if (endIdx <= startIdx) throw new Error("No JSON end structure found.");
    
    jsonString = text.substring(startIdx, endIdx + 1);
  }

  // Pre-process to fix common AI JSON errors
  try {
    // Remove comments: Match string literals OR comments. If comment (group 1), replace with empty.
    jsonString = jsonString.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g1) => g1 ? "" : m);
    
    // Remove trailing commas before closing braces/brackets
    jsonString = jsonString.replace(/,\s*([\]}])/g, '$1');

    return JSON.parse(jsonString);
  } catch (e) {
      console.error("Failed to parse extracted JSON string:", jsonString);
      throw new Error(`Failed to parse extracted JSON: ${e instanceof Error ? e.message : String(e)}`);
  }
};

// --- RETRY WRAPPER FOR RATE LIMITING ---
const generateContentWithRetry = async (params: any, retries = 10) => {
  return globalRequestQueue.add(async () => {
    let attempt = 0;
    while (attempt < retries) {
      try {
        return await ai.models.generateContent(params);
      } catch (error: any) {
        // Check for 429 / Quota Exceeded / Resource Exhausted
        const isRateLimit = 
          error?.code === 429 || 
          error?.status === 429 || 
          error?.error?.code === 429 || 
          error?.error?.status === 'RESOURCE_EXHAUSTED' ||
          error?.message?.includes('429') || 
          error?.message?.toLowerCase().includes('quota') || 
          error?.message?.toLowerCase().includes('resource_exhausted') ||
          (error?.error?.message && error.error.message.toLowerCase().includes('quota'));

        if (isRateLimit) {
          attempt++;
          if (attempt >= retries) {
            throw new Error("API Quota Exceeded. Please check your plan or try again in a few moments.");
          }
          // Exponential backoff starting at 5s: 5s, 10s, 20s...
          // We cap it at 60s max wait per retry
          const backoff = 5000 * Math.pow(2, attempt - 1);
          const delay = Math.min(backoff, 60000); 
          
          console.warn(`Rate limit hit. Retrying in ${delay/1000}s... (Attempt ${attempt}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
  });
};

// Helper function to extract sources
const getSources = (response: any): SearchSource[] => {
  const sources: SearchSource[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  chunks.forEach((chunk: any) => {
    if (chunk.web?.uri && chunk.web?.title) {
      sources.push({
        uri: chunk.web.uri,
        title: chunk.web.title
      });
    }
  });
  return sources;
};

export const scanMarket = async (): Promise<ScanResult> => {
  const systemInstruction = `You are a professional day trader assistant specializing in Momentum Trading strategies, specifically Ross Cameron's 5-step system. 
  Your goal is to find real-time or near real-time stock market opportunities from today's market session (pre-market or intraday).`;

  const prompt = `
    Find U.S. listed stocks that meet the following criteria based on Ross Cameron’s 5-step system:

    1. **Relative Volume (RV)**: At least 5× or higher compared to the 50-day average volume.
    2. **Daily Volume**: Currently trading with potential to exceed 25 million shares by end of day.
    3. **Gap-Up %**: Stock is gapping up ≥ 2% in pre-market.
    4. **Price Range**: Stock price between $2 and $20 USD.
    5. **Float**: Under 10 million shares.
    6. **Catalyst**: There is recent breaking news.
    7. **Sector bias**: Biotech, small-cap tech, or AI sectors.
    
    Time Filter: Focus on stocks active between 7 a.m. and 11 a.m. ET.
    
    Return a JSON object:
    \`\`\`json
    {
      "marketSummary": "Brief market summary.",
      "stocks": [
        {
          "symbol": "TICKER",
          "companyName": "Name",
          "price": "$Price",
          "gapPercent": "+XX%",
          "volume": "Vol",
          "relativeVolume": "RV",
          "float": "Float",
          "sector": "Sector",
          "catalyst": "News",
          "summary": "Reasoning",
          "preMarketPrice": "$X.XX",
          "preMarketChange": "+X.X%",
          "afterHoursPrice": "$X.XX",
          "afterHoursChange": "+X.X%"
        }
      ]
    }
    \`\`\`
  `;

  try {
    const response: any = await generateContentWithRetry({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.1,
      },
    });

    const parsedData = extractJson(response?.text || "");
    const sources = getSources(response);
    
    return {
      stocks: parsedData.stocks || [],
      marketSummary: parsedData.marketSummary || "Analysis complete.",
      sources: sources
    };

  } catch (error) {
    console.error("Gemini Scan Error:", error);
    throw error;
  }
};

export const scanEarningsGappers = async (): Promise<ScanResult> => {
  const systemInstruction = `You are a professional swing trader assistant specializing in Earnings Breakouts.`;
  const prompt = `
    Find U.S. listed stocks that moved significantly yesterday due to earnings releases.
    Return JSON:
    \`\`\`json
    {
      "marketSummary": "Summary",
      "stocks": [ { "symbol": "...", "companyName": "...", "price": "...", "gapPercent": "...", "volume": "...", "relativeVolume": "...", "float": "...", "sector": "...", "catalyst": "...", "summary": "..." } ]
    }
    \`\`\`
  `;

  try {
    const response: any = await generateContentWithRetry({
      model: modelId,
      contents: prompt,
      config: { systemInstruction, tools: [{ googleSearch: {} }], temperature: 0.1 },
    });

    const parsedData = extractJson(response?.text || "");
    const sources = getSources(response);

    return {
      stocks: parsedData.stocks || [],
      marketSummary: parsedData.marketSummary || "Analysis complete.",
      sources: sources
    };
  } catch (error) {
    console.error("Earnings Scan Error:", error);
    throw error;
  }
};

export const scanMarketMovers = async (): Promise<MoversResult> => {
  const systemInstruction = `You are a market intelligence analyst providing a 'Market Movers' overview.`;
  const prompt = `
    Create a Market Movers – Hot Stocks Overview using live market data for today.
    Return JSON:
    \`\`\`json
    {
      "marketSummary": "Summary",
      "movers": [ { "ticker": "...", "companyName": "...", "currentPrice": "...", "priceMovement": "...", "volumeChange": "...", "marketSentiment": 8, "keyCatalyst": "...", "technicalMomentum": "Bullish", "whyItsHot": "..." } ]
    }
    \`\`\`
  `;

  try {
    const response: any = await generateContentWithRetry({
      model: modelId,
      contents: prompt,
      config: { systemInstruction, tools: [{ googleSearch: {} }], temperature: 0.2 },
    });

    const parsedData = extractJson(response?.text || "");
    const sources = getSources(response);

    return {
      movers: parsedData.movers || [],
      marketSummary: parsedData.marketSummary || "Analysis complete.",
      sources: sources
    };
  } catch (error) {
    console.error("Movers Scan Error:", error);
    throw error;
  }
};

export const scanOversoldRebounds = async (): Promise<OversoldResult> => {
  const systemInstruction = `You are a contrarian trader assistant looking for Trend Reversals.`;
  const prompt = `
    Identify stocks that have dropped 50% or more from recent highs but have fresh positive news.
    Return JSON:
    \`\`\`json
    {
      "marketSummary": "Summary",
      "candidates": [ { "ticker": "...", "companyName": "...", "currentPrice": "...", "dropFromHigh": "...", "recentCatalyst": "...", "marketReaction": "Bullish", "reversalProbability": 8, "whyItMatters": "..." } ]
    }
    \`\`\`
  `;

  try {
    const response: any = await generateContentWithRetry({
      model: modelId,
      contents: prompt,
      config: { systemInstruction, tools: [{ googleSearch: {} }], temperature: 0.2 },
    });

    const parsedData = extractJson(response?.text || "");
    const sources = getSources(response);

    return {
      candidates: parsedData.candidates || [],
      marketSummary: parsedData.marketSummary || "Analysis complete.",
      sources: sources
    };
  } catch (error) {
    console.error("Oversold Scan Error:", error);
    throw error;
  }
};

export const scanInsiderTrading = async (): Promise<InsiderScanResult> => {
  const systemInstruction = `You are an expert Insider Trading Tracker.`;
  const prompt = `
    Search for stocks with recent significant insider buying/selling activity (Form 4).
    Return JSON:
    \`\`\`json
    {
      "marketSummary": "Summary",
      "stocks": [
        {
          "ticker": "...", "companyName": "...", "currentPrice": "...", "totalBuys": 1, "totalSells": 0, "netActivity": "Bullish", "dollarImbalance": "...", "aiSummary": "...",
          "transactions": [ { "insiderName": "...", "role": "...", "transactionType": "Buy", "amount": "...", "shares": "...", "price": "...", "date": "...", "rating": "Bullish", "interpretation": "...", "tags": ["..."] } ]
        }
      ]
    }
    \`\`\`
  `;

  try {
    const response: any = await generateContentWithRetry({
      model: modelId,
      contents: prompt,
      config: { systemInstruction, tools: [{ googleSearch: {} }], temperature: 0.1 },
    });

    const parsed = extractJson(response?.text || "");
    const sources = getSources(response);
    
    return {
      stocks: parsed.stocks || [],
      marketSummary: parsed.marketSummary || "Analysis complete.",
      sources: sources
    };
  } catch (error) {
    console.error("Insider Scan Error:", error);
    throw error;
  }
};

export const scanMarketHeatmaps = async (): Promise<HeatmapResult> => {
  const systemInstruction = `You are a professional market data visualizer.`;
  const prompt = `
    Generate Market Heatmaps (Sector, Volatility, Options, Volume) for today.
    Return JSON:
    \`\`\`json
    {
      "marketSummary": "...",
      "sectors": [ { "name": "...", "changePercent": "...", "volumeStrength": "High", "sentiment": 8, "leaders": [], "laggards": [] } ],
      "volatility": [ { "symbol": "...", "type": "Index", "volatilityLevel": "Low", "atrChange": "..." } ],
      "options": [ { "ticker": "...", "type": "Call", "direction": "Bullish", "flowStrength": "High", "notes": "..." } ],
      "volume": [ { "ticker": "...", "rvol": "...", "trend": "Up", "description": "..." } ]
    }
    \`\`\`
  `;

  try {
    const response: any = await generateContentWithRetry({
      model: modelId,
      contents: prompt,
      config: { systemInstruction, tools: [{ googleSearch: {} }], temperature: 0.2 },
    });

    const parsed = extractJson(response?.text || "");
    const sources = getSources(response);
    
    return {
      sectors: parsed.sectors || [],
      volatility: parsed.volatility || [],
      options: parsed.options || [],
      volume: parsed.volume || [],
      marketSummary: parsed.marketSummary || "",
      sources: sources
    };
  } catch (error) {
    console.error("Heatmap Scan Error:", error);
    throw error;
  }
};

export const fetchMarketNews = async (watchlist: string[]): Promise<NewsFeedResult> => {
  const systemInstruction = `You are a dedicated News Aggregator for active day traders.`;
  const watchlistStr = watchlist.length > 0 ? watchlist.join(", ") : "general top movers";
  const prompt = `
    Generate Real-Time Market News Feed. Priority Watchlist: ${watchlistStr}.
    Return JSON with fields: headline, url, source, tickers, sentimentScore, impactLevel, summary, whyItMatters, tags.
    Categories: breakingNews, watchlistNews, marketNews, trendingNews, earningsNews, analystNews, companyNews.
  `;

  try {
    const response: any = await generateContentWithRetry({
      model: modelId,
      contents: prompt,
      config: { systemInstruction, tools: [{ googleSearch: {} }], temperature: 0.2 },
    });

    const parsed = extractJson(response?.text || "");
    const sources = getSources(response);
    
    return {
      breakingNews: parsed.breakingNews || [],
      watchlistNews: parsed.watchlistNews || [],
      marketNews: parsed.marketNews || [],
      trendingNews: parsed.trendingNews || [],
      earningsNews: parsed.earningsNews || [],
      analystNews: parsed.analystNews || [],
      companyNews: parsed.companyNews || [],
      sources: sources
    };
  } catch (error) {
    console.error("News Feed Error:", error);
    throw error;
  }
};

export const fetchMarketIndices = async (): Promise<MarketIndex[]> => {
  const prompt = `Fetch real-time data for SPY, QQQ, DIA, IWM. Return JSON array of objects with symbol, name, price, change, changePercent, sentiment.`;
  try {
    const response: any = await generateContentWithRetry({
        model: modelId,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }], temperature: 0.1 }
    });
    return extractJson(response?.text || "");
  } catch(e) { console.error(e); return []; }
};

export const fetchEconomicCalendar = async (range: 'Yesterday' | 'Today' | 'Tomorrow' | 'This Week' | 'Next Week' = 'Today'): Promise<EconomicEvent[]> => {
  const prompt = `Fetch important US stock market economic events for **${range}**. Return JSON array with time, country, event, impact, actual, forecast, previous, category.`;
  try {
    const response: any = await generateContentWithRetry({
        model: modelId,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }], temperature: 0.1 }
    });
    return extractJson(response?.text || "");
  } catch(e) { console.error(e); return []; }
};

export const fetchCryptoMovers = async (): Promise<CryptoCandidate[]> => {
  const prompt = `Fetch top moving cryptocurrencies (BTC, ETH, SOL + top gainers). Return JSON array with symbol, name, price, change24h, volume.`;
  try {
    const response: any = await generateContentWithRetry({
        model: modelId,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }], temperature: 0.1 }
    });
    return extractJson(response?.text || "");
  } catch(e) { console.error(e); return []; }
};

export const fetchTopGainersLosers = async (): Promise<GainersLosersResult> => {
  const prompt = `Find today's top 5 gainers and losers. Return JSON object with 'gainers' and 'losers' arrays.`;
  try {
    const response: any = await generateContentWithRetry({
        model: modelId,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }], temperature: 0.1 }
    });
    return extractJson(response?.text || "");
  } catch(e) { console.error(e); return { gainers: [], losers: [] }; }
};

export const fetchDailyMarketSummary = async (): Promise<DailyMarketSummary> => {
  const prompt = `Provide a comprehensive AI summary of today's market. Return JSON with sentiment, summary, keyPoints.`;
  try {
    const response: any = await generateContentWithRetry({
        model: modelId,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }], temperature: 0.2 }
    });
    return extractJson(response?.text || "");
  } catch(e) { console.error(e); return { sentiment: 'Neutral', summary: 'Unavailable', keyPoints: [] }; }
};

export const refreshStockQuotes = async (currentStocks: StockCandidate[]): Promise<StockCandidate[]> => {
  if (currentStocks.length === 0) return [];
  const symbols = currentStocks.map(s => s.symbol).join(", ");
  const prompt = `Fetch latest real-time data for: ${symbols}. Return JSON array of objects with updated price, volume, gapPercent, preMarketPrice, etc.`;

  try {
    const response: any = await generateContentWithRetry({
      model: modelId,
      contents: prompt,
      config: { tools: [{ googleSearch: {} }], temperature: 0.1 },
    });
    const updates = extractJson(response?.text || "");
    if (!Array.isArray(updates)) return currentStocks;

    return currentStocks.map(stock => {
      const update = updates.find((u: any) => u.symbol === stock.symbol);
      return update ? { ...stock, ...update } : stock;
    });
  } catch (error) {
    console.error("Refresh Quotes Error:", error);
    return currentStocks;
  }
};

export const fetchWatchlistQuotes = async (symbols: string[]): Promise<WatchlistItem[]> => {
  if (symbols.length === 0) return [];
  const symbolStr = symbols.join(", ");
  const prompt = `
    Fetch advanced data for tickers: ${symbolStr}.
    Return JSON array of objects with: symbol, companyName, price, changePercent, relativeVolume, miniChart, insight, volatilityType, newsStatus, srStatus.
  `;

  try {
    const response: any = await generateContentWithRetry({
      model: modelId,
      contents: prompt,
      config: { tools: [{ googleSearch: {} }], temperature: 0.1 },
    });
    const parsed = extractJson(response?.text || "");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Watchlist Fetch Error:", error);
    return [];
  }
};

export const extractTickersFromImage = async (base64Image: string): Promise<ScreenshotAnalysisResult> => {
    const systemInstruction = `You are an AI assistant specialized in analyzing stock trading screenshots.`;
    const prompt = `Analyze screenshot. Detect VALID US stock tickers. Return JSON with foundTickers, confidence, summary, suggestions.`;

    try {
        const imagePart = { inlineData: { data: base64Image, mimeType: 'image/jpeg' } };
        const response: any = await generateContentWithRetry({
            model: modelId,
            contents: { role: 'user', parts: [imagePart, { text: prompt }] },
            config: { systemInstruction, temperature: 0.1 }
        });
        return extractJson(response?.text || "");
    } catch (error) {
        console.error("Screenshot Extraction Error:", error);
        throw error;
    }
};

export const analyzeStockTechnical = async (symbol: string): Promise<StockTechnicalAnalysis> => {
  const systemInstruction = `You are a Technical Analyst.`;
  const prompt = `
    Perform technical analysis on ${symbol}.
    Return JSON with symbol, currentPrice, trendStrength, volatilityLevel, supportLevels, resistanceLevels, heatZones, supplyZones, demandZones, fibonacciLevels, volumeProfile, patterns, autoTrendlines, recentCatalyst, summary.
  `;

  try {
    const response: any = await generateContentWithRetry({
      model: modelId,
      contents: prompt,
      config: { systemInstruction, tools: [{ googleSearch: {} }], temperature: 0.2 },
    });
    return extractJson(response?.text || "");
  } catch (error) {
    console.error("Technical Analysis Error:", error);
    throw error;
  }
};
