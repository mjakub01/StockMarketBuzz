
import React, { useState, useEffect, useRef } from 'react';
import ScannerHeader from './ScannerHeader';
import StockCard from './StockCard';
import SourceList from './SourceList';
import UniversalSortControl from './UniversalSortControl';
import { scanMarket, refreshStockQuotes } from '../services/geminiService';
import { StockCandidate, ScanStatus, SearchSource } from '../types';
import { useGlobalRefresh } from '../contexts/GlobalRefreshContext';
import { useSorter, SortConfig } from '../hooks/useSorter';

type ViewMode = 'live' | 'pre' | 'post';

const MomentumScanner: React.FC = () => {
  const [stocks, setStocks] = useState<StockCandidate[]>([]);
  const [marketSummary, setMarketSummary] = useState<string>("");
  const [sources, setSources] = useState<SearchSource[]>([]);
  const [status, setStatus] = useState<ScanStatus>(ScanStatus.IDLE);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('live');

  // Drag State (simplified for compatibility with new sort)
  const [draggedSymbol, setDraggedSymbol] = useState<string | null>(null);

  // Global Refresh Context
  const { refreshTrigger, isAutoRefresh } = useGlobalRefresh();

  // Sorting Config
  const sortConfig: SortConfig<StockCandidate>[] = [
    { key: 'gapPercent', label: 'Gap %', type: 'percentage', getValue: (s) => viewMode === 'pre' ? (s.preMarketChange || '0') : viewMode === 'post' ? (s.afterHoursChange || '0') : s.gapPercent },
    { key: 'relativeVolume', label: 'Relative Volume', type: 'volume' },
    { key: 'volume', label: 'Volume', type: 'volume' },
    { key: 'price', label: 'Price', type: 'price', getValue: (s) => viewMode === 'pre' ? (s.preMarketPrice || '0') : viewMode === 'post' ? (s.afterHoursPrice || '0') : s.price },
    { key: 'symbol', label: 'Symbol (A-Z)', type: 'string' },
    { key: 'sector', label: 'Sector', type: 'string' }
  ];

  const { sortedData, activeKey, direction, handleSort } = useSorter({
    data: stocks,
    config: sortConfig,
    defaultKey: 'gapPercent'
  });

  const stocksRef = useRef(stocks);
  useEffect(() => { stocksRef.current = stocks; }, [stocks]);

  const handleScan = async () => {
    setStatus(ScanStatus.SCANNING);
    setError(null);
    setIsLive(false); 
    try {
      const result = await scanMarket();
      setStocks(result.stocks);
      setMarketSummary(result.marketSummary);
      setSources(result.sources);
      setLastUpdated(new Date());
      setStatus(ScanStatus.COMPLETE);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Failed to fetch market data.";
      setError(msg);
      setStatus(ScanStatus.ERROR);
    }
  };

  useEffect(() => {
    if (refreshTrigger > 0) {
      if (status === ScanStatus.COMPLETE && stocksRef.current.length > 0) {
        refreshStockQuotes(stocksRef.current).then(updated => {
          setStocks(updated);
          setLastUpdated(new Date());
        });
      } else {
        handleScan();
      }
    }
  }, [refreshTrigger]);

  // Handle Drop (Manual Reordering)
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetSymbol: string) => {
    e.preventDefault();
    if (!draggedSymbol || draggedSymbol === targetSymbol) return;
    const idxDrag = stocks.findIndex(s => s.symbol === draggedSymbol);
    const idxDrop = stocks.findIndex(s => s.symbol === targetSymbol);
    if(idxDrag > -1 && idxDrop > -1) {
       const newStocks = [...stocks];
       const [moved] = newStocks.splice(idxDrag, 1);
       newStocks.splice(idxDrop, 0, moved);
       setStocks(newStocks);
    }
    setDraggedSymbol(null);
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-20">
      <ScannerHeader 
        onScan={handleScan} 
        status={status} 
        lastUpdated={lastUpdated}
        isLive={isLive || isAutoRefresh}
        onToggleLive={setIsLive}
      />

      {error && (
        <div className="mb-6 bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-lg flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {status === ScanStatus.COMPLETE && (
        <>
          <div className="mb-6 bg-gray-900 border-l-4 border-blue-500 p-4 rounded-r-lg shadow-md flex flex-col md:flex-row justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white mb-2">Market Sentiment</h2>
              <p className="text-gray-300 leading-relaxed">{marketSummary}</p>
            </div>
          </div>

          <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="bg-gray-800 p-1 rounded-lg inline-flex shadow-inner">
               {(['live', 'pre', 'post'] as ViewMode[]).map(mode => (
                 <button 
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${viewMode === mode ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                 >
                   {mode === 'live' ? 'Live' : mode === 'pre' ? 'Pre-Market' : 'After-Hours'}
                 </button>
               ))}
            </div>

            <UniversalSortControl 
               activeKey={activeKey}
               direction={direction}
               options={sortConfig}
               onSort={handleSort}
            />
          </div>

          {sortedData.length === 0 ? (
              <div className="text-center py-20 bg-gray-900/50 rounded-xl border border-gray-800 border-dashed">
                <p className="text-gray-500 text-lg">No stocks found matching criteria.</p>
              </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedData.map((stock) => (
                <StockCard 
                  key={`${stock.symbol}`} 
                  stock={stock} 
                  viewMode={viewMode}
                  draggable={true}
                  onDragStart={(e) => setDraggedSymbol(stock.symbol)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, stock.symbol)}
                />
              ))}
            </div>
          )}
          
          <SourceList sources={sources} />
        </>
      )}

      {status === ScanStatus.IDLE && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-600">
            <div className="w-24 h-24 mb-6 rounded-full bg-gray-900 flex items-center justify-center shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-xl font-medium">Ready to scan the market</p>
          </div>
      )}
    </div>
  );
};

export default MomentumScanner;
