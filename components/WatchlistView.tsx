
import React, { useState, useEffect } from 'react';
import { fetchWatchlistQuotes } from '../services/geminiService';
import { Watchlist, WatchlistItem } from '../types';
import StockDetailView from './StockDetailView';
import ScreenshotImporter from './ScreenshotImporter';
import { useGlobalRefresh } from '../contexts/GlobalRefreshContext';

interface WatchlistViewProps {
  watchlists: Watchlist[];
  activeWatchlistId: string;
  setActiveWatchlistId: (id: string) => void;
  setWatchlists: (lists: Watchlist[]) => void;
}

// Reusable Stand-Alone Tooltip Component with Portal-like positioning (fixed) to escape overflow
const TooltipIcon: React.FC<{ icon: React.ReactNode; tooltip: string; colorClass?: string }> = ({ icon, tooltip, colorClass = "" }) => {
  return (
    <div className="group relative flex items-center justify-center">
      <div className={`text-lg md:text-xl transition-colors cursor-help ${colorClass}`}>
        {icon}
      </div>
      
      {/* Fixed position tooltip to avoid clipping in overflow containers */}
      <div className="fixed opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[9999] bg-gray-900 text-white text-sm font-medium rounded-xl shadow-2xl border border-gray-600 px-4 py-2 min-w-max bottom-auto top-auto transform -translate-x-1/2 mt-2 ml-4 md:ml-0" style={{ marginTop: '20px' }}>
         <div className="absolute -top-2 left-1/2 -translate-x-1/2 border-8 border-transparent border-b-gray-900"></div>
         {tooltip}
      </div>
    </div>
  );
};

const WatchlistView: React.FC<WatchlistViewProps> = ({ watchlists, activeWatchlistId, setActiveWatchlistId, setWatchlists }) => {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [tickerInput, setTickerInput] = useState('');
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const { refreshTrigger } = useGlobalRefresh();
  
  const [showImporter, setShowImporter] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');

  const activeWatchlist = watchlists.find(w => w.id === activeWatchlistId) || watchlists[0];

  const updateQuotes = async (tickers: string[]) => {
    if (!tickers || tickers.length === 0) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchWatchlistQuotes(tickers);
      setItems(data || []);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeWatchlist && activeWatchlist.tickers.length > 0) {
      updateQuotes(activeWatchlist.tickers);
    } else {
      setItems([]);
    }
  }, [activeWatchlistId, watchlists]); 

  useEffect(() => {
     if (refreshTrigger > 0 && activeWatchlist && activeWatchlist.tickers.length > 0) {
        updateQuotes(activeWatchlist.tickers);
     }
  }, [refreshTrigger]);

  const handleAddTicker = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTicker = tickerInput.trim().toUpperCase();
    if (!cleanTicker) return;
    
    if (activeWatchlist.tickers.includes(cleanTicker)) {
      setTickerInput('');
      return;
    }

    const updatedList = { ...activeWatchlist, tickers: [...activeWatchlist.tickers, cleanTicker] };
    const updatedWatchlists = watchlists.map(w => w.id === activeWatchlistId ? updatedList : w);
    
    setWatchlists(updatedWatchlists);
    setTickerInput('');
    await updateQuotes(updatedList.tickers);
  };

  const handleRemoveTicker = (e: React.MouseEvent, ticker: string) => {
    e.stopPropagation();
    const updatedTickers = activeWatchlist.tickers.filter(t => t !== ticker);
    const updatedList = { ...activeWatchlist, tickers: updatedTickers };
    const updatedWatchlists = watchlists.map(w => w.id === activeWatchlistId ? updatedList : w);
    
    setWatchlists(updatedWatchlists);
    setItems(prev => prev.filter(i => i.symbol !== ticker));
  };

  const createNewWatchlist = () => {
    const newId = Date.now().toString();
    const newList: Watchlist = { id: newId, name: 'New Watchlist', tickers: [] };
    setWatchlists([...watchlists, newList]);
    setActiveWatchlistId(newId);
  };

  const deleteActiveWatchlist = () => {
    if (watchlists.length <= 1) {
      alert("You must keep at least one watchlist.");
      return;
    }
    if (confirm(`Are you sure you want to delete "${activeWatchlist.name}"?`)) {
       const remaining = watchlists.filter(w => w.id !== activeWatchlistId);
       setWatchlists(remaining);
       setActiveWatchlistId(remaining[0].id);
    }
  };

  const startRename = () => {
    setEditNameValue(activeWatchlist.name);
    setIsEditingName(true);
  };

  const saveRename = () => {
    if (editNameValue.trim()) {
      const updatedList = { ...activeWatchlist, name: editNameValue.trim() };
      const updatedWatchlists = watchlists.map(w => w.id === activeWatchlistId ? updatedList : w);
      setWatchlists(updatedWatchlists);
    }
    setIsEditingName(false);
  };

  const handleImport = (tickers: string[], listName: string) => {
    const newId = Date.now().toString();
    const newList: Watchlist = { id: newId, name: listName, tickers: tickers };
    setWatchlists([...watchlists, newList]);
    setActiveWatchlistId(newId);
    setShowImporter(false);
  };

  // Helper Mappers with safeguards
  const getInsightIcon = (insight?: string) => {
    switch(insight?.toLowerCase()) {
      case 'bullish': return { icon: '🟢', text: 'Uptrend intact — bullish structure' };
      case 'bearish': return { icon: '🔴', text: 'Downtrend break — bearish structure' };
      case 'neutral': return { icon: '🟡', text: 'Trendline retest — neutral zone' };
      case 'volatile': return { icon: '🟣', text: 'High volatility — expect fast moves' };
      default: return { icon: '⚪', text: 'Analyzing structure...' };
    }
  };

  const getChartIcon = (chart?: string) => {
    switch(chart?.toLowerCase()) {
      case 'uptrend': return { icon: '📈', text: 'Mini chart: short-term uptrend' };
      case 'downtrend': return { icon: '📉', text: 'Mini chart: short-term downtrend' };
      default: return { icon: '📊', text: 'Mini chart: sideways consolidation' };
    }
  };

  const getVolIcon = (vol?: string) => {
    switch(vol?.toLowerCase()) {
      case 'low': return { icon: '⚪', text: 'Low volatility — stable movement' };
      case 'medium': return { icon: '🔵', text: 'Medium volatility — moderate swings' };
      case 'high': return { icon: '🟣', text: 'High volatility — increased risk' };
      default: return { icon: '⚪', text: 'Volatility unknown' };
    }
  };

  const getNewsIcon = (status?: string) => {
    switch(status?.toLowerCase()) {
      case 'positive': return { icon: '🔥', text: 'Positive news / strong catalyst detected' };
      case 'negative': return { icon: '⚠️', text: 'Negative or risky news event' };
      case 'neutral': return { icon: '📰', text: 'Official press release available' };
      default: return { icon: <span className="opacity-20">📰</span>, text: 'No recent news' };
    }
  };

  const getSRIndicator = (status?: string) => {
    if (status?.toLowerCase() === 'resistance') return { text: 'RS↑', tooltip: 'Price approaching resistance', color: 'text-red-400' };
    if (status?.toLowerCase() === 'support') return { text: 'RS↓', tooltip: 'Price approaching support', color: 'text-green-400' };
    return { text: '---', tooltip: 'Not near key levels', color: 'text-gray-600' };
  };

  return (
    <div className="max-w-full mx-auto animate-fade-in relative min-h-[80vh] px-4 md:px-8 pb-20"> 
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
             Multi-Watchlist <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Manager</span>
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Organize your portfolio. Import tickers directly from platform screenshots.
          </p>
        </div>
        
        <button 
          onClick={() => setShowImporter(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-5 py-2 rounded-lg font-bold shadow-lg shadow-blue-900/30 transition-all transform hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Import from Screenshot
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 bg-gray-900/50 p-2 rounded-xl border border-gray-800">
         <div className="flex flex-1 gap-2 overflow-x-auto scrollbar-hide">
            {watchlists.map(list => (
               <button
                 key={list.id}
                 onClick={() => setActiveWatchlistId(list.id)}
                 className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeWatchlistId === list.id 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                 }`}
               >
                 {list.name}
               </button>
            ))}
            <button 
              onClick={createNewWatchlist}
              className="px-3 py-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              title="Create New List"
            >
              +
            </button>
         </div>
      </div>

      {/* List Controls */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-6">
         <div className="flex items-center gap-3 w-full md:w-auto">
            {isEditingName ? (
              <div className="flex gap-2">
                 <input 
                   type="text" 
                   value={editNameValue} 
                   onChange={(e) => setEditNameValue(e.target.value)}
                   className="bg-gray-800 border border-gray-700 text-white px-3 py-1 rounded focus:outline-none focus:border-blue-500"
                   autoFocus
                 />
                 <button onClick={saveRename} className="text-green-400 hover:text-green-300">Save</button>
                 <button onClick={() => setIsEditingName(false)} className="text-gray-500 hover:text-gray-300">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                 <h2 className="text-xl font-bold text-white">{activeWatchlist?.name}</h2>
                 <button onClick={startRename} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-blue-400 p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                       <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                 </button>
              </div>
            )}
            
            <div className="w-px h-6 bg-gray-700 mx-2"></div>
            
            <button 
              onClick={deleteActiveWatchlist}
              className="text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20 px-2 py-1 rounded transition-colors"
            >
              Delete List
            </button>
         </div>

         <form onSubmit={handleAddTicker} className="flex gap-2 w-full md:w-auto">
          <input 
            type="text" 
            value={tickerInput}
            onChange={(e) => setTickerInput(e.target.value)}
            placeholder="ADD TICKER" 
            className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 w-full md:w-48 uppercase font-mono text-sm"
          />
          <button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
          >
            + ADD
          </button>
        </form>
      </div>

      {loading && items.length === 0 && (
         <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
         </div>
      )}

      {!loading && items.length === 0 && activeWatchlist?.tickers.length === 0 && (
        <div className="text-center py-20 bg-gray-900/50 rounded-xl border border-gray-800 border-dashed">
           <p className="text-gray-400">This watchlist is empty.</p>
           <p className="text-sm text-gray-600 mt-1">Add a ticker manually or import a screenshot.</p>
        </div>
      )}

      <div className="space-y-2 overflow-x-auto pb-20">
        <div className="min-w-[900px] border-t border-gray-800">
            {/* Table Header */}
            {items.length > 0 && (
               <div className="flex items-center justify-between bg-gray-900/90 border-b border-gray-800 py-3 px-4 text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider select-none sticky top-0 backdrop-blur-sm z-20">
                   <div className="w-40 shrink-0">Symbol</div>
                   <div className="w-36 shrink-0 px-2">Price</div>
                   <div className="w-24 shrink-0 text-center px-2">Volume</div>
                   <div className="w-16 shrink-0 text-center">Trend</div>
                   <div className="w-16 shrink-0 text-center">Tech</div>
                   <div className="w-16 shrink-0 text-center">Vol</div>
                   <div className="w-16 shrink-0 text-center">News</div>
                   <div className="w-20 shrink-0 text-center">Levels</div>
                   <div className="ml-auto pl-4 w-9"></div>
               </div>
            )}

            {items.map((item) => {
            const isPos = item.changePercent?.includes('-') === false;
            const logoUrl = `https://assets.parqet.com/logos/symbol/${item.symbol}?format=png`;
            
            const insight = getInsightIcon(item.insight);
            const chart = getChartIcon(item.miniChart);
            const vol = getVolIcon(item.volatilityType);
            const news = getNewsIcon(item.newsStatus);
            const sr = getSRIndicator(item.srStatus);

            return (
                <div 
                  key={item.symbol} 
                  onClick={() => setSelectedTicker(item.symbol)}
                  className="group/row flex items-center justify-between bg-gray-900/40 hover:bg-gray-800 border-b border-gray-800 hover:border-blue-500/30 py-4 px-4 cursor-pointer transition-all duration-200"
                >
                    {/* Logo & Ticker */}
                    <div className="flex items-center gap-3 w-40 shrink-0 group/logo relative">
                        <div className="w-8 h-8 rounded-full bg-white flex-shrink-0 overflow-hidden flex items-center justify-center p-0.5 shadow-sm">
                            <img 
                                src={logoUrl} 
                                alt={item.symbol}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.parentElement!.style.backgroundColor = '#374151'; 
                                  e.currentTarget.parentElement!.innerHTML = `<span class="text-[10px] font-bold text-white">${item.symbol[0]}</span>`;
                                }}
                            />
                        </div>
                        <span className="text-lg font-bold text-white tracking-wide font-mono">{item.symbol}</span>
                    </div>

                    <div className="flex items-center gap-2 w-36 shrink-0 justify-start px-2">
                        <span className="text-white font-mono font-medium">{item.price || '---'}</span>
                        <span className={`font-mono font-bold text-sm ${isPos ? 'text-green-400' : 'text-red-400'}`}>
                            {item.changePercent || '---'}
                        </span>
                    </div>

                    <div className="w-24 shrink-0 text-center px-2">
                         <span className="block text-gray-300 font-mono text-sm">{item.relativeVolume || '-'}x</span>
                    </div>

                    <div className="w-16 shrink-0 text-center">
                        <TooltipIcon icon={chart.icon} tooltip={chart.text} colorClass="text-blue-300" />
                    </div>

                    <div className="w-16 shrink-0 text-center">
                        <TooltipIcon icon={insight.icon} tooltip={insight.text} />
                    </div>

                    <div className="w-16 shrink-0 text-center">
                        <TooltipIcon icon={vol.icon} tooltip={vol.text} />
                    </div>

                    <div className="w-16 shrink-0 text-center">
                        <TooltipIcon icon={news.icon} tooltip={news.text} />
                    </div>

                    <div className="w-20 shrink-0 text-center flex justify-center">
                        <div className={`text-xs font-bold px-2 py-1 rounded border border-gray-700 bg-gray-800 ${sr.color}`} title={sr.tooltip}>
                            {sr.text}
                        </div>
                    </div>

                    <div className="ml-auto pl-4 w-9 flex justify-center opacity-0 group-hover/row:opacity-100 transition-opacity">
                         <button 
                            onClick={(e) => handleRemoveTicker(e, item.symbol)}
                            className="text-gray-600 hover:text-red-500 hover:bg-red-900/20 p-1.5 rounded-full transition-all"
                         >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                         </button>
                    </div>
                </div>
              );
            })}
        </div>
      </div>

      {selectedTicker && (
         <StockDetailView ticker={selectedTicker} onClose={() => setSelectedTicker(null)} />
      )}

      {showImporter && (
         <ScreenshotImporter 
            onImport={handleImport} 
            onCancel={() => setShowImporter(false)} 
         />
      )}
    </div>
  );
};

export default WatchlistView;
