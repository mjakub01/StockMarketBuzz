
import React, { useState } from 'react';
import SourceList from './SourceList';
import { scanMarketHeatmaps } from '../services/geminiService';
import { HeatmapResult, ScanStatus, SearchSource } from '../types';
import { parsePercentage } from '../utils';
import { useNavigation } from '../contexts/NavigationContext';

const HeatmapScanner: React.FC = () => {
  const [data, setData] = useState<HeatmapResult | null>(null);
  const [status, setStatus] = useState<ScanStatus>(ScanStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const { goToStockAnalysis } = useNavigation();

  const handleScan = async () => {
    setStatus(ScanStatus.SCANNING);
    setError(null);
    try {
      const result = await scanMarketHeatmaps();
      setData(result);
      setStatus(ScanStatus.COMPLETE);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Failed to generate heatmaps.";
      setError(msg);
      setStatus(ScanStatus.ERROR);
    }
  };

  const getPercentColor = (percentStr: string) => {
    const val = parsePercentage(percentStr);
    if (val >= 2) return 'bg-green-600 text-white';
    if (val > 0) return 'bg-green-800 text-green-100';
    if (val === 0) return 'bg-gray-700 text-gray-300';
    if (val <= -2) return 'bg-red-600 text-white';
    return 'bg-red-900 text-red-100';
  };

  const getVolColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'extreme': return 'bg-red-600 text-white animate-pulse';
      case 'high': return 'bg-orange-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      default: return 'bg-blue-600 text-white';
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span className="text-4xl">🗺️</span>
              <span>Market <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Heatmaps</span></span>
            </h1>
            <p className="text-gray-400 mt-2 max-w-xl">
              Visualizing sector flows, volatility pockets, options activity, and volume momentum in real-time.
            </p>
          </div>
          
          <button
            onClick={status === ScanStatus.SCANNING ? undefined : handleScan}
            disabled={status === ScanStatus.SCANNING}
            className={`
              relative overflow-hidden px-8 py-3 rounded-lg font-bold text-white shadow-lg transform transition-all duration-200 text-sm
              ${status === ScanStatus.SCANNING 
                ? 'bg-gray-700 cursor-not-allowed opacity-75' 
                : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 hover:scale-105 active:scale-95 shadow-teal-900/50'
              }
            `}
          >
            {status === ScanStatus.SCANNING ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating Maps...</span>
              </div>
            ) : (
              <span>Refresh Heatmaps</span>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-lg flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm">{error}</span>
        </div>
      )}

      {status === ScanStatus.COMPLETE && data && (
        <div className="space-y-8">
          {/* Summary */}
          <div className="bg-gray-900 border-l-4 border-teal-500 p-5 rounded-r-lg shadow-md">
            <h2 className="text-lg font-bold text-white mb-2">Market Flow Overview</h2>
            <p className="text-gray-300 leading-relaxed text-sm md:text-base">{data.marketSummary}</p>
          </div>

          {/* 1. Sector Heatmap */}
          <div>
             <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">Sector Performance</h3>
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.sectors.map((sector, idx) => (
                   <div key={idx} className={`p-4 rounded-xl border border-white/10 shadow-lg ${getPercentColor(sector.changePercent)} transition-transform hover:scale-[1.02]`}>
                      <div className="flex justify-between items-center mb-2">
                         <h4 className="font-bold text-lg truncate">{sector.name}</h4>
                         <span className="font-mono font-bold bg-black/20 px-2 py-0.5 rounded text-sm">{sector.changePercent}</span>
                      </div>
                      <div className="text-xs space-y-1 opacity-90">
                         <div className="flex justify-between">
                            <span>Vol Strength:</span>
                            <span className="font-semibold">{sector.volumeStrength}</span>
                         </div>
                         <div className="flex justify-between">
                            <span>Sentiment:</span>
                            <span className="font-semibold">{sector.sentiment}/10</span>
                         </div>
                         <div className="mt-2 pt-2 border-t border-white/20">
                            <span className="block opacity-75 mb-0.5">Leaders:</span>
                            <div className="flex gap-1 flex-wrap">
                               {sector.leaders.map(l => (
                                 <button key={l} onClick={() => goToStockAnalysis(l)} className="bg-black/20 px-1.5 rounded text-[10px] font-mono hover:bg-black/40 transition-colors">{l}</button>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 2. Volatility Heatmap */}
            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
               <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                 <span className="text-orange-500">⚡</span> Volatility Zones
               </h3>
               <div className="space-y-3">
                 {data.volatility.map((vol, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => vol.type === 'Ticker' ? goToStockAnalysis(vol.symbol) : null}
                      className={`flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-800 ${vol.type === 'Ticker' ? 'cursor-pointer hover:border-blue-500' : ''}`}
                    >
                       <div className="flex items-center gap-3">
                          <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold text-gray-400 border border-gray-700`}>{vol.type}</span>
                          <span className="font-bold text-white text-lg">{vol.symbol}</span>
                       </div>
                       <div className="text-right flex items-center gap-3">
                          <span className="text-xs text-gray-500">{vol.atrChange}</span>
                          <span className={`px-3 py-1 rounded font-bold text-xs uppercase ${getVolColor(vol.volatilityLevel)}`}>
                             {vol.volatilityLevel}
                          </span>
                       </div>
                    </div>
                 ))}
               </div>
            </div>

            {/* 3. Options Flow */}
            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
               <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                 <span className="text-purple-400">🌊</span> Options Flow
               </h3>
               <div className="space-y-3">
                 {data.options.map((opt, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => goToStockAnalysis(opt.ticker)}
                      className="p-3 bg-gray-900 rounded-lg border border-gray-800 relative overflow-hidden group cursor-pointer hover:border-purple-500"
                    >
                       <div className={`absolute left-0 top-0 bottom-0 w-1 ${opt.direction === 'Bullish' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                       <div className="flex justify-between items-start pl-3">
                          <div>
                             <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-white">{opt.ticker}</span>
                                <span className={`text-[10px] px-1.5 rounded uppercase ${opt.type === 'Call' ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>{opt.type}</span>
                             </div>
                             <p className="text-xs text-gray-400 italic max-w-[200px]">{opt.notes}</p>
                          </div>
                          <div className="text-right">
                             <span className={`block text-xs font-bold uppercase ${opt.direction === 'Bullish' ? 'text-green-400' : 'text-red-400'}`}>{opt.direction}</span>
                             <span className="text-[10px] text-gray-500">Flow: {opt.flowStrength}</span>
                          </div>
                       </div>
                    </div>
                 ))}
               </div>
            </div>
          </div>

          {/* 4. Volume Heatmap */}
          <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
             <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
               <span className="text-blue-400">📊</span> Volume Spikes (RVOL)
             </h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {data.volume.map((vol, idx) => (
                   <div 
                     key={idx} 
                     onClick={() => goToStockAnalysis(vol.ticker)}
                     className="p-4 bg-gray-900 rounded-lg border border-gray-800 flex flex-col justify-between h-full cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all"
                   >
                      <div className="flex justify-between items-start mb-2">
                         <span className="font-bold text-xl text-white">{vol.ticker}</span>
                         <span className={`px-2 py-0.5 rounded text-sm font-bold ${vol.trend === 'Up' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                           {vol.trend === 'Up' ? '↑' : '↓'} RVOL {vol.rvol}
                         </span>
                      </div>
                      <p className="text-sm text-gray-400">{vol.description}</p>
                   </div>
                ))}
             </div>
          </div>
          
          <SourceList sources={data.sources} />
        </div>
      )}

      {status === ScanStatus.IDLE && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-600">
            <div className="w-24 h-24 mb-6 rounded-full bg-gray-900 flex items-center justify-center shadow-inner relative group">
              <span className="text-4xl filter grayscale group-hover:grayscale-0 transition-all duration-300">🗺️</span>
            </div>
            <p className="text-xl font-medium text-gray-400">Visualize Market Action</p>
            <p className="text-sm mt-2 max-w-md text-center">Click "Refresh Heatmaps" to generate sector, volatility, and volume visualizations.</p>
          </div>
      )}
    </div>
  );
};

export default HeatmapScanner;
