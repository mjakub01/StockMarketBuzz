
export interface StockCandidate {
  symbol: string;
  companyName: string;
  price: string;
  gapPercent: string;
  volume: string;
  relativeVolume: string;
  float: string;
  sector: string;
  catalyst: string;
  summary: string;
  preMarketPrice?: string;
  preMarketChange?: string;
  afterHoursPrice?: string;
  afterHoursChange?: string;
}

export interface MarketMover {
  ticker: string;
  companyName: string;
  currentPrice: string;
  priceMovement: string;
  volumeChange: string; // Used for RVOL
  marketSentiment: number; // 1-10
  keyCatalyst: string;
  technicalMomentum: 'Bullish' | 'Neutral' | 'Bearish';
  whyItsHot: string;
  volume?: string; // Raw volume
  float?: string;
  marketCap?: string;
}

export interface MarketMoversFilters {
  mode: 'ALL' | 'GAINERS' | 'LOSERS';
  cap: 'ALL' | 'SMALL' | 'MID' | 'LARGE';
}

export interface OversoldCandidate {
  ticker: string;
  companyName: string;
  currentPrice: string;
  dropFromHigh: string;
  recentCatalyst: string;
  marketReaction: 'Bullish' | 'Mixed' | 'Neutral';
  reversalProbability: number; // 1-10
  whyItMatters: string;
}

export interface SearchSource {
  uri: string;
  title: string;
}

export interface ScanResult {
  stocks: StockCandidate[];
  marketSummary: string;
  sources: SearchSource[];
}

export interface MoversResult {
  movers: MarketMover[];
  marketSummary: string;
  sources: SearchSource[];
}

export interface OversoldResult {
  candidates: OversoldCandidate[];
  marketSummary: string;
  sources: SearchSource[];
}

export interface SectorData {
  name: string;
  changePercent: string;
  volumeStrength: 'Low' | 'Medium' | 'High';
  sentiment: number;
  leaders: string[];
  laggards: string[];
}

export interface VolatilityData {
  symbol: string;
  type: 'Index' | 'Sector' | 'Ticker';
  volatilityLevel: 'Low' | 'Medium' | 'High' | 'Extreme';
  atrChange: string;
}

export interface OptionsFlowData {
  ticker: string;
  type: 'Call' | 'Put';
  direction: 'Bullish' | 'Bearish';
  flowStrength: 'High' | 'Medium' | 'Low';
  notes: string;
}

export interface VolumeHeatmapData {
  ticker: string;
  rvol: string;
  trend: 'Up' | 'Down';
  description: string;
}

export interface HeatmapResult {
  sectors: SectorData[];
  volatility: VolatilityData[];
  options: OptionsFlowData[];
  volume: VolumeHeatmapData[];
  marketSummary: string;
  sources: SearchSource[];
}

export interface InsiderTransaction {
  insiderName: string;
  role: string;
  transactionType: 'Buy' | 'Sell';
  amount: string; 
  shares: string;
  price: string;
  date: string;
  rating: 'Bullish' | 'Bearish' | 'Neutral';
  interpretation: string; 
  tags: string[];
}

export interface InsiderStockSummary {
  ticker: string;
  companyName: string;
  currentPrice: string;
  totalBuys: number; 
  totalSells: number; 
  netActivity: 'Bullish' | 'Bearish' | 'Neutral';
  dollarImbalance: string; 
  aiSummary: string;
  transactions: InsiderTransaction[];
}

export interface InsiderScanResult {
  stocks: InsiderStockSummary[];
  marketSummary: string;
  sources: SearchSource[];
}

export interface Watchlist {
  id: string;
  name: string;
  tickers: string[];
}

export interface WatchlistItem {
  symbol: string;
  companyName?: string; 
  price: string;
  changePercent: string;
  trendLabel?: string;
  relativeVolume: string; 
  miniChart: 'Uptrend' | 'Downtrend' | 'Sideways';
  insight: 'Bullish' | 'Bearish' | 'Neutral' | 'Volatile';
  volatilityType: 'Low' | 'Medium' | 'High';
  newsStatus: 'Positive' | 'Negative' | 'Neutral' | 'None';
  srStatus: 'Resistance' | 'Support' | 'None';
}

export interface ScreenshotAnalysisResult {
  foundTickers: string[];
  confidence: 'High' | 'Medium' | 'Low';
  summary: string;
  suggestions?: string;
}

// --- NEW SMART CHART TYPES ---
export interface OHLC {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  rsi?: number;
  macd?: number;
  macdSignal?: number;
  macdHist?: number;
}

export interface ChartOverlay {
  type: 'SMA' | 'EMA' | 'Support' | 'Resistance' | 'Pattern' | 'Breakout' | 'Breakdown' | 'Zone';
  label: string;
  color: string;
  points?: { index: number; price: number }[]; // For lines/patterns
  yValue?: number; // For horizontal levels
  strength?: 'Major' | 'Minor';
  testCount?: number;
  method?: string; // "Swing High", "Volume Profile", "Gap Fill", "Psychological", "Fibonacci"
  confidenceScore?: number; // 0-100
  lastTested?: string;
  description?: string;
}

export interface StockAnalysisFull {
    symbol: string;
    companyName: string;
    price: number;
    change: number;
    changePercent: number;
    candles: OHLC[];
    overlays: ChartOverlay[];
    fundamentals: {
        marketCap: string;
        float: string;
        peRatio: string;
        avgVolume: string;
    };
    technicals: {
        rsi: number;
        macd: string;
        summary: string;
        trend: 'Bullish' | 'Bearish' | 'Neutral';
    };
    news: { headline: string; source: string; time: string; sentiment: 'Positive' | 'Negative' | 'Neutral' }[];
}

export type NewsCategory = 'Breaking' | 'Watchlist' | 'Macro' | 'Trending' | 'Earnings' | 'Analyst' | 'Company';

export interface NewsItem {
  headline: string;
  tickers?: string[];
  sentimentScore: number; 
  impactLevel: 'High' | 'Medium' | 'Low';
  summary: string;
  whyItMatters: string; 
  tags: string[]; 
  url?: string;
  source?: string;
  epsResult?: string;
  revenueResult?: string;
  priceTargetChange?: string; 
  analystAction?: 'Upgrade' | 'Downgrade' | 'Initiate';
  riskLevel?: 'Low' | 'Medium' | 'High';
}

export interface NewsFeedResult {
  breakingNews: NewsItem[];
  watchlistNews: NewsItem[];
  marketNews: NewsItem[];
  trendingNews: NewsItem[];
  earningsNews: NewsItem[];
  analystNews: NewsItem[];
  companyNews: NewsItem[];
  sources: SearchSource[];
}

export interface MarketIndex {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
}

export interface EconomicEvent {
  time: string;
  event: string;
  impact: 'High' | 'Medium' | 'Low';
  actual?: string;
  forecast?: string;
  previous?: string;
  country?: string; 
  category?: string;
  description?: string;
  relatedAssets?: string[];
}

export interface EarningsCalendarEvent {
  symbol: string;
  companyName: string;
  time: 'BMO' | 'AMC' | 'During';
  epsEstimate: string;
  date: string;
}

export type CalendarDateRange = 'Yesterday' | 'Today' | 'Tomorrow' | 'This Week' | 'Next Week';

export interface CryptoCandidate {
  symbol: string;
  name: string;
  price: string;
  change24h: string;
  volume: string;
}

export interface DailyMarketSummary {
  sentiment: 'Bullish' | 'Bearish' | 'Neutral' | 'Mixed';
  summary: string;
  keyPoints: string[];
}

export interface GainersLosersResult {
  gainers: StockCandidate[];
  losers: StockCandidate[];
}

export enum ScanStatus {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}

export type ThemeMode = 'light' | 'dark' | 'amoled' | 'auto';
export type UI_Density = 'compact' | 'comfort' | 'expanded';
export type CornerStyle = 'rounded' | 'extra-rounded' | 'sharp' | 'glass';
export type AnimationSpeed = 'smooth' | 'fast' | 'reduced';
export type FontFamily = 'Inter' | 'SF Pro' | 'Poppins' | 'Roboto';

export interface ThemeSettings {
  mode: ThemeMode;
  accentColor: string;
  density: UI_Density;
  fontFamily: FontFamily;
  fontSize: 'small' | 'medium' | 'large' | 'xl';
  cornerStyle: CornerStyle;
  animationSpeed: AnimationSpeed;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface FeatureFlags {
  enableMomentum: boolean;
  enableEarnings: boolean;
  enableMovers: boolean;
  enableOversold: boolean;
  enableInsider: boolean;
  enableHeatmaps: boolean;
  enableNews: boolean;
  enableGlobalRefresh: boolean;
  enableCrypto: boolean;
}

export interface ScannerFilters {
  projVolume: boolean; // Volume > 25M (Projected)
  morningActive: boolean; // Active 7-11 AM
  breakout: boolean; // Above HOD
  highVolatility: boolean; // High Range
  excludeDerivatives: boolean; // No ETFs/SPACs
  lowFloatRetail: boolean; // Inst Own < 30%
  enableRoss: boolean; // Ross Cameron 5-Step System
}

export interface EarningsFilters {
  epsBeat: boolean;
  revBeat: boolean;
  move5Percent: boolean;
  vol5M: boolean;
  rvol2x: boolean;
  priceRange: boolean; // $2-$100
  session: 'ALL' | 'PRE' | 'POST';
  sector: string; // 'ALL' or specific
}

// --- AI CHAT TYPES ---
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

// --- API CONNECTION TYPES ---
export type ApiProviderId = 'gemini' | 'polygon' | 'alphaVantage' | 'finnhub' | 'iex';

export interface ApiProviderConfig {
  id: ApiProviderId;
  name: string;
  description: string;
  icon: string;
  website: string;
}

export interface ApiKeyConfig {
  providerId: ApiProviderId;
  apiKey: string;
  isEnabled: boolean;
  status: 'valid' | 'invalid' | 'checking' | 'unknown';
  lastTested?: string;
}