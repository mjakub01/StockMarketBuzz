
import React, { useMemo, useState } from 'react';
import { useStockAnalysis } from '../contexts/StockAnalysisContext';
import { StockAnalysisFull, ChartOverlay } from '../types';
import { useDraggableLayout } from '../hooks/useDraggableLayout';
import { useAuth } from '../contexts/AuthContext';
import SmartChart from './SmartChart';

// --- SUB-COMPONENTS (With Drag Handles) ---

const DragHandle = () => (
  <div className="cursor-grab active:cursor-grabbing p-1.5 mr-2 text-gray-600 hover:text-gray-300 transition-colors opacity-0 group-hover:opacity-100">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </div>
);

const DetailHeader = React.memo(({ data, onRefresh, lastUpdated, onResetLayout }: { data: StockAnalysisFull, onRefresh: () => void, lastUpdated: Date | null, onResetLayout: () => void }) => (
  <div className="flex flex-col md:flex-row justify-between items-end gap-4 pb-6 border-b border-gray-800">
     <div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
           {data.symbol}
           <span className="text-lg font-medium text-gray-400 px-3 py-1 bg-gray-800 rounded-full">{data.companyName}</span>
        </h1>
        <div className="flex items-center gap-4 mt-2">
           <button onClick={onRefresh} className="text-xs font-bold text-blue-400 hover:text-white flex items-center gap-1 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              REFRESH DATA
           </button>
           <button onClick={onResetLayout} className="text-xs font-bold text-gray-500 hover:text-white flex items-center gap-1 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              RESET LAYOUT
           </button>
           {lastUpdated && <span className="text-xs text-gray-600">Updated: {lastUpdated.toLocaleTimeString()}</span>}
        </div>
     </div>
     <div className="text-right">
        <div className="text-4xl font-mono font-bold text-white">${data.price.toFixed(2)}</div>
        <div className={`text-lg font-bold ${data.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
           {data.change > 0 ? '+' : ''}{data.change} ({data.changePercent}%)
        </div>
     </div>
  </div>
));

const PriceActionCard = React.memo(({ candles, currentPrice }: { candles: any[], currentPrice: number }) => {
   const dayHigh = candles.length > 0 ? Math.max(...candles.map(c => c.high)) : currentPrice;
   const dayLow = candles.length > 0 ? Math.min(...candles.map(c => c.low)) : currentPrice;
   const openPrice = candles.length > 0 ? candles[0].open : currentPrice;
   
   return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg h-full group hover:border-gray-700 transition-colors">
         <div className="flex items-center mb-4">
            <DragHandle />
            <h3 className="font-bold text-gray-400 text-sm uppercase tracking-wider flex items-center gap-2">
               <span className="text-blue-500">📉</span> Price Action
            </h3>
         </div>
         <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
               <span className="text-gray-500 text-sm">Last Price</span>
               <span className="text-2xl font-mono font-bold text-white">${currentPrice.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <span className="text-xs text-gray-500 block uppercase">Day High</span>
                  <span className="text-green-400 font-mono font-bold">${dayHigh.toFixed(2)}</span>
               </div>
               <div>
                  <span className="text-xs text-gray-500 block uppercase">Day Low</span>
                  <span className="text-red-400 font-mono font-bold">${dayLow.toFixed(2)}</span>
               </div>
               <div>
                  <span className="text-xs text-gray-500 block uppercase">Open</span>
                  <span className="text-gray-300 font-mono">${openPrice.toFixed(2)}</span>
               </div>
               <div>
                  <span className="text-xs text-gray-500 block uppercase">Range</span>
                  <span className="text-gray-300 font-mono">${(dayHigh - dayLow).toFixed(2)}</span>
               </div>
            </div>
         </div>
      </div>
   );
});

const VolumeLiquidityCard = React.memo(({ fundamentals }: { fundamentals: any }) => (
   <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg h-full group hover:border-gray-700 transition-colors">
      <div className="flex items-center mb-4">
         <DragHandle />
         <h3 className="font-bold text-gray-400 text-sm uppercase tracking-wider flex items-center gap-2">
            <span className="text-purple-500">📊</span> Volume & Liquidity
         </h3>
      </div>
      <div className="space-y-4">
         <div className="flex justify-between items-center border-b border-gray-800 pb-2">
            <span className="text-gray-500 text-sm">Avg Volume (50D)</span>
            <span className="text-white font-mono font-bold">{fundamentals.avgVolume}</span>
         </div>
         <div className="flex justify-between items-center border-b border-gray-800 pb-2">
            <span className="text-gray-500 text-sm">Float</span>
            <span className="text-white font-mono font-bold">{fundamentals.float}</span>
         </div>
         <div className="flex justify-between items-center border-b border-gray-800 pb-2">
            <span className="text-gray-500 text-sm">Market Cap</span>
            <span className="text-white font-mono font-bold">{fundamentals.marketCap}</span>
         </div>
         <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">P/E Ratio</span>
            <span className="text-white font-mono">{fundamentals.peRatio}</span>
         </div>
      </div>
   </div>
));

const TechnicalHealthCard = React.memo(({ technicals }: { technicals: any }) => {
   const rsi = technicals.rsi || 50;
   const rsiStatus = rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral';
   const rsiColor = rsi > 70 ? 'text-red-400' : rsi < 30 ? 'text-green-400' : 'text-gray-400';

   return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg h-full group hover:border-gray-700 transition-colors">
         <div className="flex items-center mb-4">
            <DragHandle />
            <h3 className="font-bold text-gray-400 text-sm uppercase tracking-wider flex items-center gap-2">
               <span className="text-orange-500">⚡</span> Technical Health
            </h3>
         </div>
         <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
               <span className="text-gray-500 text-sm">RSI (14)</span>
               <div className="text-right">
                  <span className={`font-mono font-bold text-lg ${rsiColor}`}>{rsi}</span>
                  <span className="text-xs block text-gray-500 uppercase">{rsiStatus}</span>
               </div>
            </div>
            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
               <span className="text-gray-500 text-sm">Trend Structure</span>
               <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${technicals.trend === 'Bullish' ? 'bg-green-900/30 text-green-400 border-green-500/30' : 'bg-red-900/30 text-red-400 border-red-500/30'}`}>
                  {technicals.trend}
               </span>
            </div>
            <div className="flex justify-between items-center pt-1">
               <span className="text-gray-500 text-sm">MACD</span>
               <span className="text-gray-300 text-sm font-medium">{technicals.macd || 'Neutral'}</span>
            </div>
         </div>
      </div>
   );
});

const SRLevelsPanel = React.memo(({ overlays }: { overlays: ChartOverlay[] }) => {
  const levels = overlays.filter(o => o.type === 'Support' || o.type === 'Resistance' || o.type === 'Zone');
  
  if (levels.length === 0) return (
     <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg h-full group">
        <div className="flex items-center mb-2">
           <DragHandle />
           <h3 className="font-bold text-gray-400 text-sm uppercase">Key Levels</h3>
        </div>
        <p className="text-gray-500 text-sm italic">No major levels detected.</p>
     </div>
  );

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg h-full group hover:border-gray-700 transition-colors">
       <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
             <DragHandle />
             <h3 className="font-bold text-white flex items-center gap-2">
                <span className="text-blue-400">🎯</span> Support & Resistance Analysis
             </h3>
          </div>
          <span className="text-xs text-gray-500 font-mono">{levels.length} Levels Found</span>
       </div>
       
       <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
             <thead className="text-xs text-gray-500 uppercase font-bold border-b border-gray-800">
                <tr>
                   <th className="pb-3 pl-2">Price Level</th>
                   <th className="pb-3">Type</th>
                   <th className="pb-3">Confidence</th>
                   <th className="pb-3">Tested</th>
                   <th className="pb-3 text-right pr-2">Method</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-800">
                {levels.map((lvl, i) => (
                   <tr key={i} className="hover:bg-gray-800/50 transition-colors">
                      <td className="py-3 pl-2 font-mono font-bold text-white text-base">
                         ${lvl.yValue?.toFixed(2)}
                         <div className="text-[10px] text-gray-500 font-normal mt-0.5">{lvl.label}</div>
                      </td>
                      <td className="py-3">
                         <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${lvl.type === 'Support' ? 'bg-green-500/10 text-green-400 border-green-500/20' : lvl.type === 'Resistance' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'}`}>
                            {lvl.type}
                         </span>
                      </td>
                      <td className="py-3">
                         <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${lvl.confidenceScore && lvl.confidenceScore > 80 ? 'text-green-400' : 'text-gray-400'}`}>
                                   {lvl.confidenceScore || 50}%
                                </span>
                                <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                   <div className={`h-full rounded-full ${lvl.strength === 'Major' ? 'bg-blue-500' : 'bg-gray-600'}`} style={{ width: `${lvl.confidenceScore || 50}%` }}></div>
                                </div>
                            </div>
                            <span className="text-[10px] text-gray-500 uppercase">{lvl.strength || 'Minor'}</span>
                         </div>
                      </td>
                      <td className="py-3">
                         <div className="text-xs text-gray-300">
                            {lvl.testCount ? `${lvl.testCount} Touches` : 'Untested'}
                         </div>
                         <div className="text-[10px] text-gray-500">{lvl.lastTested || 'Unknown'}</div>
                      </td>
                      <td className="py-3 text-right pr-2">
                         <span className="text-gray-400 text-xs font-medium px-2 py-0.5 bg-gray-800 rounded border border-gray-700/50">
                            {lvl.method || 'Pivot'}
                         </span>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
       
       <div className="mt-4 pt-3 border-t border-gray-800 text-xs text-gray-500 italic flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
             <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Highest confidence levels are derived from multi-touch pivots and volume nodes.
       </div>
    </div>
  );
});

const NewsListPanel = React.memo(({ news }: { news: any[] }) => (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 h-full shadow-lg group hover:border-gray-700 transition-colors">
       <div className="flex items-center mb-4">
          <DragHandle />
          <h3 className="font-bold text-white flex items-center gap-2">
             Latest Headlines
             <span className="bg-blue-600 text-white text-[10px] px-1.5 rounded">LIVE</span>
          </h3>
       </div>
       <div className="space-y-4">
          {news.length === 0 ? <p className="text-gray-500 text-sm">No recent news found.</p> : news.slice(0, 5).map((n, i) => (
             <div key={i} className="group cursor-pointer border-b border-gray-800 pb-3 last:border-0 last:pb-0">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                   <span className="uppercase font-bold">{n.source}</span>
                   <span>{n.time}</span>
                </div>
                <p className="text-sm text-gray-200 group-hover:text-blue-400 transition-colors font-medium leading-snug">
                   {n.headline}
                </p>
                {n.sentiment && n.sentiment !== 'Neutral' && (
                   <span className={`text-[10px] mt-1 inline-block px-1.5 rounded border ${n.sentiment === 'Positive' ? 'text-green-400 border-green-900' : 'text-red-400 border-red-900'}`}>
                      {n.sentiment}
                   </span>
                )}
             </div>
          ))}
       </div>
    </div>
));

const AnalystSummaryPanel = React.memo(({ summary }: { summary: string }) => (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 h-full group hover:border-gray-600 transition-colors">
       <div className="flex items-center mb-2">
          <DragHandle />
          <h4 className="text-sm font-bold text-gray-400 uppercase">Analyst Summary</h4>
       </div>
       <p className="text-gray-200 leading-relaxed font-light">{summary}</p>
    </div>
));

// --- MAIN COMPONENT ---

type WidgetId = 'chart' | 'price' | 'volume' | 'technicals' | 'sr' | 'news' | 'summary';

const defaultLayout: WidgetId[] = ['chart', 'price', 'volume', 'technicals', 'sr', 'news', 'summary'];

interface StockDetailViewProps {
  ticker: string | null;
  isEmbedded?: boolean;
}

const StockDetailView: React.FC<StockDetailViewProps> = ({ ticker, isEmbedded = false }) => {
  const { user } = useAuth();
  const { analysisData: data, isLoading: loading, loadStock, lastUpdated } = useStockAnalysis();
  
  const layoutKey = `stock_view_layout_${user?.id}_${ticker || 'default'}`;
  const { layout, moveItem, resetLayout, setIsDragging } = useDraggableLayout<WidgetId>(layoutKey, defaultLayout);
  const [draggedId, setDraggedId] = useState<WidgetId | null>(null);

  if (!ticker) return <div className="text-center py-10 text-gray-500">Select a stock to begin analysis</div>;

  const handleRefresh = () => {
    if (ticker) loadStock(ticker, true);
  };

  const handleDragStart = (e: React.DragEvent, id: WidgetId, index: number) => {
    setDraggedId(id);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"));
    if (!isNaN(sourceIndex) && sourceIndex !== targetIndex) {
      moveItem(sourceIndex, targetIndex);
    }
    setDraggedId(null);
    setIsDragging(false);
  };

  if (loading && !data) return (
      <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400 animate-pulse">Running full technical analysis on {ticker}...</p>
      </div>
  );

  if (!data || (data.symbol !== ticker && !loading)) return (
      <div className="p-8 text-center text-gray-400 bg-gray-900/30 border border-gray-800 rounded-xl">
          No analysis data loaded.
      </div>
  );

  const technicals = data.technicals || { summary: "Analysis unavailable", rsi: 50, trend: "Neutral", macd: "" };
  const fundamentals = data.fundamentals || { marketCap: "N/A", float: "N/A", peRatio: "N/A", avgVolume: "N/A" };
  const overlays = data.overlays || [];
  const candles = data.candles || [];

  const renderWidget = (id: WidgetId) => {
    switch(id) {
      case 'chart': return <SmartChart candles={candles} overlays={overlays} height={400} />;
      case 'price': return <PriceActionCard candles={candles} currentPrice={data.price} />;
      case 'volume': return <VolumeLiquidityCard fundamentals={fundamentals} />;
      case 'technicals': return <TechnicalHealthCard technicals={technicals} />;
      case 'sr': return <SRLevelsPanel overlays={overlays} />;
      case 'news': return <NewsListPanel news={data.news || []} />;
      case 'summary': return <AnalystSummaryPanel summary={technicals.summary} />;
      default: return null;
    }
  };

  const getWidgetClass = (id: WidgetId) => {
    switch(id) {
      case 'chart': return 'col-span-1 md:col-span-2 lg:col-span-3 min-h-[450px]';
      case 'sr': return 'col-span-1 lg:col-span-2';
      case 'news': return 'col-span-1 lg:col-span-1';
      case 'summary': return 'col-span-1 md:col-span-2 lg:col-span-3';
      default: return 'col-span-1';
    }
  };

  return (
    <div className="animate-fade-in w-full max-w-7xl mx-auto space-y-6">
      <DetailHeader data={data} onRefresh={handleRefresh} lastUpdated={lastUpdated} onResetLayout={resetLayout} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {layout.map((id, index) => (
            <div 
              key={id} 
              draggable
              onDragStart={(e) => handleDragStart(e, id, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={`${getWidgetClass(id)} transition-all duration-200 ${draggedId === id ? 'opacity-50 scale-95 border-2 border-dashed border-blue-500 rounded-xl' : ''}`}
            >
               {renderWidget(id)}
            </div>
         ))}
      </div>
    </div>
  );
};

export default StockDetailView;
