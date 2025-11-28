
import React, { useState, useEffect } from 'react';
import { fetchWatchlistQuotes } from '../services/geminiService';
import { WatchlistItem } from '../types';
import StockDetailView from './StockDetailView';
import { useStockAnalysis } from '../contexts/StockAnalysisContext';

interface WatchlistViewProps {
  currentTicker: string | null;
  onTickerChange: (ticker: string) => void;
}

// Reusable Stand-Alone Tooltip Component
const TooltipIcon: React.FC<{ icon: React.ReactNode; tooltip: string; colorClass?: string }> = ({ icon, tooltip, colorClass = "" }) => {
  return (
    <div className="group relative flex items-center justify-center">
      <div className={`text-lg md:text-xl transition-colors cursor-help ${colorClass}`}>
        {icon}
      </div>
      <div className="fixed opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[9999] bg-gray-900 text-white text-sm font-medium rounded-xl shadow-2xl border border-gray-600 px-4 py-2 min-w-max bottom-auto top-auto transform -translate-x-1/2 mt-2 ml-4 md:ml-0" style={{ marginTop: '20px' }}>
         <div className="absolute -top-2 left-1/2 -translate-x-1/2 border-8 border-transparent border-b-gray-900"></div>
         {tooltip}
      </div>
    </div>
  );
};

const WatchlistView: React.FC<WatchlistViewProps> = ({ currentTicker, onTickerChange }) => {
  const [tickerInput, setTickerInput] = useState('');
  const [heroData, setHeroData] = useState<WatchlistItem | null>(null);
  const [loadingHero, setLoadingHero] = useState(false);
  const { loadStock } = useStockAnalysis();

  // Fetch Hero Data when ticker changes
  const loadHeroData = async (ticker: string) => {
    if (!ticker) return;
    setLoadingHero(true);
    try {
      // Trigger global context load
      loadStock(ticker);
      
      // Fetch local hero stats
      const data = await fetchWatchlistQuotes([ticker]);
      if (data && data.length > 0) {
        setHeroData(data[0]);
      } else {
        setHeroData(null);
      }
    } catch (e) {
      console.error("Failed to load hero data", e);
    } finally {
      setLoadingHero(false);
    }
  };

  useEffect(() => {
    if (currentTicker) {
      loadHeroData(currentTicker);
    }
  }, [currentTicker]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tickerInput.trim().toUpperCase();
    if (clean) {
      onTickerChange(clean);
      setTickerInput('');
    }
  };

  // Helper Mappers
  const getInsightIcon = (insight?: string) => {
    switch(insight?.toLowerCase()) {
      case 'bullish': return { icon: '🟢', tooltip: 'Uptrend intact — bullish structure' };
      case 'bearish': return { icon: '🔴', tooltip: 'Downtrend break — bearish structure' };
      case 'neutral': return { icon: '🟡', tooltip: 'Trendline retest — neutral zone' };
      case 'volatile': return { icon: '🟣', tooltip: 'High volatility — expect fast moves' };
      default: return { icon: '⚪', tooltip: 'Analyzing structure...' };
    }
  };

  const getChartIcon = (chart?: string) => {
    switch(chart?.toLowerCase()) {
      case 'uptrend': return { icon: '📈', tooltip: 'Mini chart: short-term uptrend' };
      case 'downtrend': return { icon: '📉', tooltip: 'Mini chart: short-term downtrend' };
      default: return { icon: '📊', tooltip: 'Mini chart: sideways consolidation' };
    }
  };

  const getVolIcon = (vol?: string) => {
    switch(vol?.toLowerCase()) {
      case 'low': return { icon: '⚪', tooltip: 'Low volatility — stable movement' };
      case 'medium': return { icon: '🔵', tooltip: 'Medium volatility — moderate swings' };
      case 'high': return { icon: '🟣', tooltip: 'High volatility — increased risk' };
      default: return { icon: '⚪', tooltip: 'Volatility unknown' };
    }
  };

  const getNewsIcon = (status?: string) => {
    switch(status?.toLowerCase()) {
      case 'positive': return { icon: '🔥', tooltip: 'Positive news / strong catalyst detected' };
      case 'negative': return { icon: '⚠️', tooltip: 'Negative or risky news event' };
      case 'neutral': return { icon: '📰', tooltip: 'Official press release available' };
      default: return { icon: <span className="opacity-20">📰</span>, tooltip: 'No recent news' };
    }
  };

  const getSRIndicator = (status?: string) => {
    if (status?.toLowerCase() === 'resistance') return { text: 'RS↑', tooltip: 'Price approaching resistance', color: 'text-red-400 border-red-500/30' };
    if (status?.toLowerCase() === 'support') return { text: 'RS↓', tooltip: 'Price approaching support', color: 'text-green-400 border-green-500/30' };
    return { text: '---', tooltip: 'Not near key levels', color: 'text-gray-600 border-gray-700' };
  };

  // --- Render ---

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20">
      
      {/* Header & Search */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
           Stock <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Analysis</span>
        </h1>
        <p className="text-gray-400 mb-6">Deep dive technicals, trend analysis, and institutional flow for a single ticker.</p>
        
        <form onSubmit={handleSearch} className="max-w-md mx-auto relative">
          <input 
            type="text" 
            value={tickerInput}
            onChange={(e) => setTickerInput(e.target.value)}
            placeholder="Enter Ticker (e.g. AAPL)"
            className="w-full bg-gray-900 border border-gray-700 text-white pl-5 pr-12 py-4 rounded-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-900 shadow-xl text-lg font-mono uppercase"
          />
          <button 
            type="submit" 
            className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full w-10 flex items-center justify-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>

      {/* Content Area */}
      {!currentTicker ? (
         <div className="flex flex-col items-center justify-center py-20 text-gray-600 bg-gray-900/30 rounded-3xl border border-gray-800 border-dashed">
            <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4">
               <span className="text-4xl opacity-50">🔍</span>
            </div>
            <p className="text-xl font-medium">Search a ticker to begin analysis</p>
         </div>
      ) : (
         <div className="space-y-8 animate-fade-in-up">
            
            {/* Hero Data Card */}
            {heroData && (
               <div className="bg-gray-900 border border-gray-700 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none"></div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                     <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white p-2 flex items-center justify-center shadow-lg">
                           <img 
                              src={`https://assets.parqet.com/logos/symbol/${heroData.symbol}?format=png`} 
                              alt={heroData.symbol} 
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                 e.currentTarget.style.display = 'none';
                                 e.currentTarget.parentElement!.style.backgroundColor = '#1f2937';
                                 const safeSymbol = heroData.symbol || '?';
                                 e.currentTarget.parentElement!.innerHTML = `<span class="text-2xl font-bold text-white">${safeSymbol[0]}</span>`
                              }}
                           />
                        </div>
                        <div>
                           <h2 className="text-4xl font-bold text-white font-mono tracking-tight">{heroData.symbol}</h2>
                           <p className="text-gray-400 text-sm font-medium">{heroData.companyName || 'US Stock'}</p>
                        </div>
                     </div>

                     <div className="text-right">
                        <div className="text-4xl font-mono font-bold text-white">{heroData.price}</div>
                        <div className={`text-lg font-bold ${String(heroData.changePercent).includes('-') ? 'text-red-400' : 'text-green-400'}`}>
                           {heroData.changePercent}
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-8 pt-6 border-t border-gray-800">
                     <div className="text-center">
                        <span className="block text-gray-500 text-xs uppercase mb-1">RVOL</span>
                        <span className="text-white font-mono font-bold text-lg">{heroData.relativeVolume && heroData.relativeVolume !== 'x' ? `${heroData.relativeVolume}x` : 'N/A'}</span>
                     </div>
                     <div className="text-center flex flex-col items-center">
                        <span className="block text-gray-500 text-xs uppercase mb-1">Trend</span>
                        <TooltipIcon {...getChartIcon(heroData.miniChart)} colorClass="text-blue-400" />
                     </div>
                     <div className="text-center flex flex-col items-center">
                        <span className="block text-gray-500 text-xs uppercase mb-1">Structure</span>
                        <TooltipIcon {...getInsightIcon(heroData.insight)} />
                     </div>
                     <div className="text-center flex flex-col items-center">
                        <span className="block text-gray-500 text-xs uppercase mb-1">Volatility</span>
                        <TooltipIcon {...getVolIcon(heroData.volatilityType)} />
                     </div>
                     <div className="text-center flex flex-col items-center">
                        <span className="block text-gray-500 text-xs uppercase mb-1">News</span>
                        <TooltipIcon {...getNewsIcon(heroData.newsStatus)} />
                     </div>
                     <div className="text-center">
                        <span className="block text-gray-500 text-xs uppercase mb-1">Key Level</span>
                        <div className={`text-sm font-bold px-2 py-1 rounded inline-block border ${getSRIndicator(heroData.srStatus).color} bg-gray-800`}>
                           {getSRIndicator(heroData.srStatus).text}
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* Loading Hero State */}
            {loadingHero && !heroData && (
               <div className="h-48 bg-gray-900 rounded-3xl animate-pulse"></div>
            )}

            {/* Embedded Analysis View */}
            <div className="mt-8">
               <StockDetailView ticker={currentTicker} isEmbedded={true} />
            </div>

         </div>
      )}
    </div>
  );
};

export default WatchlistView;
