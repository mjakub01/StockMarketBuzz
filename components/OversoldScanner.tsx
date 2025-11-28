
import React, { useState } from 'react';
import ReboundCard from './ReboundCard';
import SourceList from './SourceList';
import UniversalSortControl from './UniversalSortControl';
import { scanOversoldRebounds } from '../services/geminiService';
import { OversoldCandidate, ScanStatus, SearchSource } from '../types';
import { useSorter, SortConfig } from '../hooks/useSorter';

const OversoldScanner: React.FC = () => {
  const [candidates, setCandidates] = useState<OversoldCandidate[]>([]);
  const [marketSummary, setMarketSummary] = useState<string>("");
  const [sources, setSources] = useState<SearchSource[]>([]);
  const [status, setStatus] = useState<ScanStatus>(ScanStatus.IDLE);
  const [error, setError] = useState<string | null>(null);

  const sortConfig: SortConfig<OversoldCandidate>[] = [
    { key: 'reversalProbability', label: 'Probability', type: 'number' },
    { key: 'dropFromHigh', label: 'Drop %', type: 'percentage' },
    { key: 'currentPrice', label: 'Price', type: 'price' },
    { key: 'ticker', label: 'Ticker', type: 'string' }
  ];

  const { sortedData, activeKey, direction, handleSort } = useSorter({
    data: candidates,
    config: sortConfig,
    defaultKey: 'reversalProbability'
  });

  const handleScan = async () => {
    setStatus(ScanStatus.SCANNING);
    setError(null);
    try {
      const result = await scanOversoldRebounds();
      setCandidates(result.candidates);
      setMarketSummary(result.marketSummary);
      setSources(result.sources);
      setStatus(ScanStatus.COMPLETE);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Failed to fetch oversold candidates.";
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
              <span className="text-4xl">📉</span>
              <span>Oversold <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Rebounds</span></span>
            </h1>
            <p className="text-gray-400 mt-2 max-w-xl">
              Identify beaten-down stocks (down 50%+) showing signs of life due to fresh positive news catalysts.
            </p>
          </div>
          
          <button
            onClick={status === ScanStatus.SCANNING ? undefined : handleScan}
            disabled={status === ScanStatus.SCANNING}
            className={`
              relative overflow-hidden px-8 py-3 rounded-lg font-bold text-white shadow-lg transform transition-all duration-200 text-sm
              ${status === ScanStatus.SCANNING 
                ? 'bg-gray-700 cursor-not-allowed opacity-75' 
                : 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:scale-105 active:scale-95'
              }
            `}
          >
            {status === ScanStatus.SCANNING ? 'Scanning...' : 'Find Rebounds'}
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
          <div className="mb-6 bg-gray-900 border-l-4 border-indigo-500 p-5 rounded-r-lg shadow-md flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white mb-2">Market Sentiment</h2>
              <p className="text-gray-300 leading-relaxed text-sm md:text-base">{marketSummary}</p>
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
                <p className="text-gray-500 text-lg">No strong reversal candidates found.</p>
              </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {sortedData.map((candidate, index) => (
                <ReboundCard key={`${candidate.ticker}-${index}`} candidate={candidate} />
              ))}
            </div>
          )}
          
          <SourceList sources={sources} />
        </>
      )}

      {status === ScanStatus.IDLE && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-600">
            <p className="text-xl font-medium text-gray-400">Find Turnaround Plays</p>
          </div>
      )}
    </div>
  );
};

export default OversoldScanner;
