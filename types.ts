
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
  volumeChange: string;
  marketSentiment: number; // 1-10
  keyCatalyst: string;
  technicalMomentum: 'Bullish' | 'Neutral' | 'Bearish';
  whyItsHot: string;
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

export interface SupportResistanceLevel {
  price: string;
  type: 'Major Support' | 'Minor Support' | 'Major Resistance' | 'Minor Resistance';
  description: string; 
}

export interface Zone {
  range: string;
  strength: number; 
}

export interface Trendline {
  start: string;
  end: string;
  description: string;
}

export interface ChartPattern {
  name: string;
  confirmationLevel: string;
  breakoutPrice: string;
  strength: number; 
  volumeBehavior: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  explanation: string;
}

export interface TrendlineDetail {
  start: string;
  end: string;
  touches: number;
  strength: number; 
  notes: string;
}

export interface BreakRetest {
  type: string;
  confirmation: string;
  volumeBehavior: string;
  note: string;
}

export interface AutoTrendlineAnalysis {
  uptrends: TrendlineDetail[];
  downtrends: TrendlineDetail[];
  breaks: BreakRetest[];
  summary: string;
}

export interface StockTechnicalAnalysis {
  symbol: string;
  currentPrice: string;
  trendStrength: 'Strong Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Strong Bearish';
  volatilityLevel: 'Low' | 'Medium' | 'High';
  supportLevels: SupportResistanceLevel[];
  resistanceLevels: SupportResistanceLevel[];
  recentCatalyst: string;
  summary: string;
  heatZones?: { zone: string; description: string }[];
  supplyZones?: Zone[];
  demandZones?: Zone[];
  trendlines?: { uptrend?: string; downtrend?: string; recentBreak?: boolean }; 
  fibonacciLevels?: { level38: string; level50: string; level61: string; confluence: string };
  volumeProfile?: { poc: string; hvn: string; lvn: string; gap: string };
  patterns?: ChartPattern[];
  autoTrendlines?: AutoTrendlineAnalysis;
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
}

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
