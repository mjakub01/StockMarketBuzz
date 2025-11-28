
import React, { useState } from 'react';
import StockCard from './StockCard';
import SourceList from './SourceList';
import UniversalSortControl from './UniversalSortControl';
import { scanEarningsGappers } from '../services/geminiService';
import { StockCandidate, ScanStatus, SearchSource } from '../types';
import { useSorter, SortConfig } from '../hooks/useSorter';

const EarningsScanner: React.FC = () => {
  const [stocks, setStocks] = useState<StockCandidate[]>([]);
  const [marketSummary, setMarketSummary] = useState<string>("");
  const [sources, setSources] = useState<SearchSource[]>([]);
  const [status, setStatus] = useState<ScanStatus>(ScanStatus.IDLE);
  const [error, setError] = useState<string | null>(null);

  const sortConfig: SortConfig<StockCandidate>[] = [
    { key: 'gapPercent', label: 'Gain %', type: 'percentage' },
    { key: 'price', label: 'Price', type: 'price' },
    { key: 'volume', label: 'Volume', type: 'volume' },
    { key: 'relativeVolume', label: 'Relative Vol', type: 'volume' },
    { key: 'symbol', label: 'Symbol', type: 'string' }
  ];

  const { sortedData, activeKey, direction, handleSort } = useSorter({
    data: stocks,
    config: sortConfig,
    defaultKey: 'gapPercent'
  });

  const handleScan = async () => {
    setStatus(ScanStatus.SCANNING);
    setError(null);
    try {
      const result = await scanEarningsGappers();
      setStocks(result.stocks);
      setMarketSummary(result.marketSummary);
      setSources(result.sources);
      setStatus(ScanStatus.COMPLETE);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Failed to fetch earnings data.";
      setError(msg);
      setStatus(ScanStatus.ERROR);
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8 space-y-6">
        <div className="flex justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Earnings <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Movers</span>
            </h1>
            <p className="text-gray-400 mt-2 max-w-xl">
              Identify stocks that made significant moves yesterday driven by earnings reports.
            </p>
          </div>
          
          <button
            onClick={status === ScanStatus.SCANNING ? undefined : handleScan}
            disabled={status === ScanStatus.SCANNING}
            className={`
              relative overflow-hidden px-6 py-2 rounded-lg font-bold text-white shadow-lg transform transition-all duration-200 text-sm
              ${status === ScanStatus.SCANNING 
                ? 'bg-gray-700 cursor-not-allowed opacity-75' 
                : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:scale-105 active:scale-95'
              }
            `}
          >
            {status === ScanStatus.SCANNING ? 'Scanning...' : 'Scan Earnings'}
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
          <div className="mb-6 bg-gray-900 border-l-4 border-purple-500 p-4 rounded-r-lg shadow-md flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
               <h2 className="text-lg font-bold text-white mb-2">Earnings Summary</h2>
               <p className="text-gray-300 leading-relaxed text-sm">{marketSummary}</p>
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
                <p className="text-gray-500 text-lg">No earnings movers found matching the criteria.</p>
              </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedData.map((stock, index) => (
                <StockCard key={`${stock.symbol}-${index}`} stock={stock} percentLabel="Gain" />
              ))}
            </div>
          )}
          
          <SourceList sources={sources} />
        </>
      )}

      {status === ScanStatus.IDLE && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-600">
             <p className="text-xl font-medium">Find Earnings Winners</p>
          </div>
      )}
    </div>
  );
};

export default EarningsScanner;
