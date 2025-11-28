
import React, { useState } from 'react';
import MoverCard from './MoverCard';
import SourceList from './SourceList';
import UniversalSortControl from './UniversalSortControl';
import { scanMarketMovers } from '../services/geminiService';
import { MarketMover, ScanStatus, SearchSource, MarketMoversFilters } from '../types';
import { useSorter, SortConfig } from '../hooks/useSorter';

const MarketMoversScanner: React.FC = () => {
  const [movers, setMovers] = useState<MarketMover[]>([]);
  const [marketSummary, setMarketSummary] = useState<string>("");
  const [sources, setSources] = useState<SearchSource[]>([]);
  const [status, setStatus] = useState<ScanStatus>(ScanStatus.IDLE);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [filters, setFilters] = useState<MarketMoversFilters>({
    mode: 'ALL',
    cap: 'ALL'
  });

  const sortConfig: SortConfig<MarketMover>[] = [
    { key: 'priceMovement', label: 'Movement %', type: 'percentage' },
    { key: 'volumeChange', label: 'Rel Vol', type: 'volume' },
    { key: 'currentPrice', label: 'Price', type: 'price' },
    { key: 'marketSentiment', label: 'Sentiment', type: 'number' },
    { key: 'ticker', label: 'Ticker', type: 'string' }
  ];

  const { sortedData, activeKey, direction, handleSort } = useSorter({
    data: movers,
    config: sortConfig,
    defaultKey: 'priceMovement'
  });

  const handleScan = async (force = false) => {
    setStatus(ScanStatus.SCANNING);
    setError(null);
    try {
      const result = await scanMarketMovers(force, filters);
      setMovers(result.movers);
      setMarketSummary(result.marketSummary);
      setSources(result.sources);
      setStatus(ScanStatus.COMPLETE);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Failed to fetch market movers.";
      setError(msg);
      setStatus(ScanStatus.ERROR);
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span className="text-4xl">🔥</span>
              <span>Market <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Movers</span></span>
            </h1>
            <p className="text-gray-400 mt-2 max-w-xl">
              Live active stocks with Price Change ±5%, Volume &gt; 1M, and RVOL &gt; 2x.
            </p>
          </div>
          
          <div className="flex gap-2">
             <button
                onClick={() => handleScan(true)}
                disabled={status === ScanStatus.SCANNING}
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium border border-gray-700"
             >
                {status === ScanStatus.SCANNING ? 'Scanning...' : 'Refresh'}
             </button>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-wrap gap-6 items-center">
           {/* Mode Toggle */}
           <div className="flex bg-gray-800 p-1 rounded-lg">
              {['ALL', 'GAINERS', 'LOSERS'].map(m => (
                 <button
                   key={m}
                   onClick={() => setFilters(prev => ({ ...prev, mode: m as any }))}
                   className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${filters.mode === m ? 'bg-orange-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                 >
                   {m === 'ALL' ? 'All Movers' : m === 'GAINERS' ? 'Top Gainers' : 'Top Losers'}
                 </button>
              ))}
           </div>

           {/* Market Cap */}
           <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 uppercase font-bold">Market Cap:</span>
              <div className="flex bg-gray-800 p-1 rounded-lg">
                 {['ALL', 'SMALL', 'MID', 'LARGE'].map(c => (
                    <button
                      key={c}
                      onClick={() => setFilters(prev => ({ ...prev, cap: c as any }))}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filters.cap === c ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                      {c === 'ALL' ? 'Any' : c}
                    </button>
                 ))}
              </div>
           </div>

           <button 
             onClick={() => handleScan(false)}
             className="ml-auto bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-orange-900/20"
           >
             Apply Filters
           </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-lg">
            {error}
        </div>
      )}

      {status === ScanStatus.COMPLETE && (
        <>
          <div className="mb-6 flex justify-between items-center bg-gray-900/50 p-3 rounded-lg border border-gray-800">
             <span className="text-sm text-gray-400">
               Found <strong className="text-white">{sortedData.length}</strong> stocks matching criteria.
             </span>
             <UniversalSortControl 
               activeKey={activeKey}
               direction={direction}
               options={sortConfig}
               onSort={handleSort}
            />
          </div>

          <div className="mb-6 bg-gray-900 border-l-4 border-orange-500 p-5 rounded-r-lg shadow-md">
              <h2 className="text-lg font-bold text-white mb-2">Market Intelligence</h2>
              <p className="text-gray-300 leading-relaxed text-sm md:text-base">{marketSummary}</p>
          </div>

          {sortedData.length === 0 ? (
              <div className="text-center py-20 bg-gray-900/50 rounded-xl border border-gray-800 border-dashed">
                <p className="text-gray-500 text-lg">No significant movers found for current criteria.</p>
              </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {sortedData.map((mover, index) => (
                <MoverCard key={`${mover.ticker}-${index}`} mover={mover} />
              ))}
            </div>
          )}
          
          <SourceList sources={sources} />
        </>
      )}

      {status === ScanStatus.IDLE && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-600">
            <p className="text-xl font-medium text-gray-400">Click "Apply Filters" to scan active movers.</p>
          </div>
      )}
    </div>
  );
};

export default MarketMoversScanner;
