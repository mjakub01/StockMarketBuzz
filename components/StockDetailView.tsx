

import React, { useEffect, useState } from 'react';
import { StockTechnicalAnalysis } from '../types';
import { analyzeStockTechnical } from '../services/geminiService';

interface StockDetailViewProps {
  ticker: string;
  onClose: () => void;
}

const StockDetailView: React.FC<StockDetailViewProps> = ({ ticker, onClose }) => {
  const [data, setData] = useState<StockTechnicalAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await analyzeStockTechnical(ticker);
        setData(result);
      } catch (err) {
        setError("Failed to load technical analysis. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (ticker) fetchData();
  }, [ticker]);

  const getTrendColor = (trend: string) => {
    if (trend.includes('Bullish')) return 'text-green-400 border-green-500 bg-green-900/20';
    if (trend.includes('Bearish')) return 'text-red-400 border-red-500 bg-red-900/20';
    return 'text-yellow-400 border-yellow-500 bg-yellow-900/20';
  };

  const getVolColor = (vol: string) => {
    if (vol === 'High') return 'bg-red-500';
    if (vol === 'Medium') return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'text-green-400 bg-green-900/30';
      case 'medium': return 'text-yellow-400 bg-yellow-900/30';
      case 'high': return 'text-red-400 bg-red-900/30';
      default: return 'text-gray-400 bg-gray-800';
    }
  };

  if (!ticker) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">{ticker}</h2>
            <p className="text-sm text-gray-400 mt-1">Technical Analysis & Key Levels</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
               <p>Analyzing price action, trend lines, and chart patterns...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-400">
              <p>{error}</p>
              <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 text-white">Close</button>
            </div>
          ) : data ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column: Stats */}
              <div className="space-y-6">
                
                {/* Price & Trend */}
                <div className="flex items-end gap-4 mb-4">
                   <span className="text-4xl font-mono font-bold text-white">{data.currentPrice}</span>
                   <span className={`px-3 py-1 rounded-lg text-sm font-bold border ${getTrendColor(data.trendStrength)}`}>
                     {data.trendStrength}
                   </span>
                </div>

                {/* Volatility Meter */}
                <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700">
                   <h3 className="text-gray-400 text-xs uppercase font-bold mb-3">Volatility Level</h3>
                   <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getVolColor(data.volatilityLevel)} transition-all duration-500`} 
                          style={{ width: data.volatilityLevel === 'High' ? '90%' : data.volatilityLevel === 'Medium' ? '60%' : '30%' }}
                        ></div>
                      </div>
                      <span className="text-white font-medium">{data.volatilityLevel}</span>
                   </div>
                   <p className="text-xs text-gray-500 mt-2">
                     {data.volatilityLevel === 'High' ? 'Expect large price swings.' : 'Price action is relatively stable.'}
                   </p>
                </div>

                {/* Catalyst */}
                <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700">
                   <h3 className="text-indigo-400 text-xs uppercase font-bold mb-2 flex items-center gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                     </svg>
                     Latest Catalyst
                   </h3>
                   <p className="text-gray-200 text-sm leading-relaxed">{data.recentCatalyst}</p>
                </div>

                {/* Summary */}
                <div className="bg-blue-900/20 p-5 rounded-xl border border-blue-500/20">
                   <h3 className="text-blue-400 text-xs uppercase font-bold mb-2">Technical Summary</h3>
                   <p className="text-gray-300 text-sm italic">"{data.summary}"</p>
                </div>

              </div>

              {/* Right Column: S/R Levels */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Support & Resistance
                </h3>

                <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                  {/* Resistance Section */}
                  <div className="bg-red-900/10 border-b border-gray-700 p-2">
                    <h4 className="text-red-400 text-xs font-bold uppercase text-center tracking-wider">Resistance Zones (Sell/Trim)</h4>
                  </div>
                  <div className="divide-y divide-gray-700">
                    {data.resistanceLevels.map((level, i) => (
                      <div key={i} className="flex justify-between items-center p-4 hover:bg-gray-700/30 transition-colors">
                        <div>
                          <p className="text-white font-mono font-bold text-lg">{level.price}</p>
                          <p className="text-xs text-red-300">{level.type}</p>
                        </div>
                        <div className="text-right max-w-[50%]">
                           <span className="text-gray-400 text-xs">{level.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Current Price Divider */}
                  <div className="bg-gray-900 py-3 flex items-center justify-center border-t border-b border-gray-700">
                     <span className="text-gray-500 text-xs uppercase tracking-widest">Current Price Action</span>
                  </div>

                  {/* Support Section */}
                  <div className="divide-y divide-gray-700">
                    {data.supportLevels.map((level, i) => (
                      <div key={i} className="flex justify-between items-center p-4 hover:bg-gray-700/30 transition-colors">
                        <div>
                          <p className="text-white font-mono font-bold text-lg">{level.price}</p>
                          <p className="text-xs text-green-300">{level.type}</p>
                        </div>
                        <div className="text-right max-w-[50%]">
                           <span className="text-gray-400 text-xs">{level.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-green-900/10 border-t border-gray-700 p-2">
                    <h4 className="text-green-400 text-xs font-bold uppercase text-center tracking-wider">Support Zones (Buy/Dip)</h4>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-800 text-xs text-gray-500">
                  <p>Levels calculated based on recent highs/lows, moving averages, and volume clusters from the last 30-90 days.</p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Auto Trendline Analysis Section */}
          {data && data.autoTrendlines && (
            <div className="mt-8 pt-8 border-t border-gray-800">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-3xl">📐</span> Auto Trendline Analysis
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                 {/* Uptrends */}
                 <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-5">
                   <h4 className="text-green-400 font-bold mb-4 flex items-center gap-2 uppercase text-sm tracking-wider">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                     </svg>
                     Bullish Uptrends
                   </h4>
                   {data.autoTrendlines.uptrends.length > 0 ? (
                     <div className="space-y-4">
                       {data.autoTrendlines.uptrends.map((trend, i) => (
                         <div key={i} className="bg-gray-900 p-3 rounded-lg border border-gray-800">
                           <div className="flex justify-between items-center mb-1">
                             <div className="text-sm font-mono text-white">
                               {trend.start} <span className="text-gray-500 mx-1">→</span> {trend.end}
                             </div>
                             <span className="bg-green-900/40 text-green-400 text-xs px-2 py-0.5 rounded font-bold">{trend.strength}/10</span>
                           </div>
                           <div className="flex justify-between items-end text-xs text-gray-500">
                             <span>Touches: {trend.touches}</span>
                             <span className="italic">{trend.notes}</span>
                           </div>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <p className="text-gray-500 text-sm italic">No significant uptrend lines detected.</p>
                   )}
                 </div>

                 {/* Downtrends */}
                 <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-5">
                   <h4 className="text-red-400 font-bold mb-4 flex items-center gap-2 uppercase text-sm tracking-wider">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                     </svg>
                     Bearish Downtrends
                   </h4>
                   {data.autoTrendlines.downtrends.length > 0 ? (
                     <div className="space-y-4">
                       {data.autoTrendlines.downtrends.map((trend, i) => (
                         <div key={i} className="bg-gray-900 p-3 rounded-lg border border-gray-800">
                           <div className="flex justify-between items-center mb-1">
                             <div className="text-sm font-mono text-white">
                               {trend.start} <span className="text-gray-500 mx-1">→</span> {trend.end}
                             </div>
                             <span className="bg-red-900/40 text-red-400 text-xs px-2 py-0.5 rounded font-bold">{trend.strength}/10</span>
                           </div>
                           <div className="flex justify-between items-end text-xs text-gray-500">
                             <span>Touches: {trend.touches}</span>
                             <span className="italic">{trend.notes}</span>
                           </div>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <p className="text-gray-500 text-sm italic">No significant downtrend lines detected.</p>
                   )}
                 </div>
              </div>

              {/* Breaks */}
              {data.autoTrendlines.breaks.length > 0 && (
                <div className="mb-6 grid gap-4">
                  {data.autoTrendlines.breaks.map((brk, i) => (
                    <div key={i} className={`p-4 rounded-lg border flex flex-col md:flex-row justify-between gap-4 items-start ${brk.type.toLowerCase().includes('bull') ? 'bg-green-900/10 border-green-500/30' : brk.type.toLowerCase().includes('bear') ? 'bg-red-900/10 border-red-500/30' : 'bg-yellow-900/10 border-yellow-500/30'}`}>
                      <div>
                        <h5 className={`font-bold ${brk.type.toLowerCase().includes('bull') ? 'text-green-400' : brk.type.toLowerCase().includes('bear') ? 'text-red-400' : 'text-yellow-400'}`}>
                          {brk.type} Detected
                        </h5>
                        <p className="text-sm text-gray-300 mt-1">{brk.note}</p>
                      </div>
                      <div className="text-right text-xs space-y-1">
                        <p className="text-gray-400"><span className="font-semibold text-gray-300">Confirmation:</span> {brk.confirmation}</p>
                        <p className="text-gray-400"><span className="font-semibold text-gray-300">Volume:</span> {brk.volumeBehavior}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Summary */}
              <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-indigo-500">
                <p className="text-gray-300 text-sm leading-relaxed"><span className="text-indigo-400 font-bold">Trend Summary:</span> {data.autoTrendlines.summary}</p>
              </div>

            </div>
          )}

          {/* Pattern Recognition AI Section */}
          {data && (
             <div className="mt-8 pt-8 border-t border-gray-800">
               <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                 <span className="text-3xl">📈</span> Pattern Recognition AI
               </h3>

               {data.patterns && data.patterns.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {data.patterns.map((pattern, idx) => (
                     <div key={idx} className="bg-gradient-to-br from-gray-800 to-gray-900 border border-indigo-500/30 rounded-xl p-6 shadow-lg relative overflow-hidden group">
                       {/* Decoration */}
                       <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 blur-3xl rounded-full group-hover:bg-indigo-500/20 transition-all"></div>

                       <div className="flex justify-between items-start mb-4 relative z-10">
                         <div>
                           <h4 className="text-xl font-bold text-white">{pattern.name}</h4>
                           <span className="text-xs text-indigo-300 font-mono">Confidence: {pattern.strength}/10</span>
                         </div>
                         <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getRiskColor(pattern.riskLevel)}`}>
                           {pattern.riskLevel} Risk
                         </span>
                       </div>

                       <div className="space-y-3 mb-4 relative z-10">
                         <div className="flex justify-between text-sm border-b border-gray-700/50 pb-2">
                            <span className="text-gray-500">Confirmation</span>
                            <span className="text-white font-mono">{pattern.confirmationLevel}</span>
                         </div>
                         <div className="flex justify-between text-sm border-b border-gray-700/50 pb-2">
                            <span className="text-gray-500">Breakout/Down</span>
                            <span className="text-yellow-400 font-mono font-bold">{pattern.breakoutPrice}</span>
                         </div>
                         <div className="text-sm">
                            <span className="text-gray-500 block text-xs mb-1">Volume Behavior</span>
                            <span className="text-gray-300">{pattern.volumeBehavior}</span>
                         </div>
                       </div>

                       <div className="bg-black/20 p-3 rounded-lg text-sm text-gray-400 italic">
                         "{pattern.explanation}"
                       </div>
                       
                       {/* Strength Bar */}
                       <div className="mt-4 h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 transition-all duration-1000" 
                            style={{ width: `${pattern.strength * 10}%` }}
                          ></div>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="bg-gray-800/50 border border-gray-700 border-dashed rounded-xl p-8 text-center">
                    <p className="text-gray-400 text-lg">No reliable chart patterns detected at this time.</p>
                    <p className="text-gray-600 text-sm mt-2">The AI scans for confirmed setups (Flags, Cup & Handle, H&S) to avoid false positives.</p>
                 </div>
               )}
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default StockDetailView;