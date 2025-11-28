
import React, { useState } from 'react';
import SourceList from './SourceList';
import UniversalSortControl from './UniversalSortControl';
import { scanInsiderTrading } from '../services/geminiService';
import { InsiderScanResult, InsiderStockSummary, ScanStatus } from '../types';
import { useSorter, SortConfig } from '../hooks/useSorter';

const InsiderScanner: React.FC = () => {
  const [data, setData] = useState<InsiderScanResult | null>(null);
  const [status, setStatus] = useState<ScanStatus>(ScanStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [expandedStock, setExpandedStock] = useState<string | null>(null);

  // Note: We are sorting the 'stocks' list, transactions inside are not sorted by this control
  const sortConfig: SortConfig<InsiderStockSummary>[] = [
    { key: 'dollarImbalance', label: 'Net Imbalance', type: 'currency' },
    { key: 'totalBuys', label: 'Total Buys', type: 'number' },
    { key: 'totalSells', label: 'Total Sells', type: 'number' },
    { key: 'netActivity', label: 'Sentiment', type: 'sentiment' },
    { key: 'ticker', label: 'Ticker', type: 'string' }
  ];

  const { sortedData, activeKey, direction, handleSort } = useSorter({
    data: data?.stocks || [],
    config: sortConfig,
    defaultKey: 'dollarImbalance'
  });

  const handleScan = async () => {
    setStatus(ScanStatus.SCANNING);
    setError(null);
    try {
      const result = await scanInsiderTrading();
      setData(result);
      setStatus(ScanStatus.COMPLETE);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Failed to fetch insider trading data.";
      setError(msg);
      setStatus(ScanStatus.ERROR);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'bullish': return 'text-green-400 bg-green-900/20 border-green-500/30';
      case 'bearish': return 'text-red-400 bg-red-900/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-800 border-gray-700';
    }
  };

  const getTransactionColor = (type: string) => {
    return type.toLowerCase() === 'buy' ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span className="text-4xl">💼</span>
              <span>Insider <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Tracker</span></span>
            </h1>
            <p className="text-gray-400 mt-2 max-w-xl">
              Track significant insider buying and selling activity from the last 30 days.
            </p>
          </div>
          
          <button
            onClick={status === ScanStatus.SCANNING ? undefined : handleScan}
            disabled={status === ScanStatus.SCANNING}
            className={`
              relative overflow-hidden px-8 py-3 rounded-lg font-bold text-white shadow-lg transform transition-all duration-200 text-sm
              ${status === ScanStatus.SCANNING 
                ? 'bg-gray-700 cursor-not-allowed opacity-75' 
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:scale-105 active:scale-95'
              }
            `}
          >
            {status === ScanStatus.SCANNING ? 'Scanning...' : 'Scan Insider Activity'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-lg">
            {error}
        </div>
      )}

      {status === ScanStatus.COMPLETE && data && (
        <>
          <div className="mb-6 bg-gray-900 border-l-4 border-emerald-500 p-5 rounded-r-lg shadow-md flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white mb-2">Market Insider Sentiment</h2>
              <p className="text-gray-300 leading-relaxed text-sm md:text-base">{data.marketSummary}</p>
            </div>
            <UniversalSortControl 
               activeKey={activeKey}
               direction={direction}
               options={sortConfig}
               onSort={handleSort}
            />
          </div>

          <div className="space-y-6">
            {sortedData.map((stock, idx) => (
              <div key={`${stock.ticker}-${idx}`} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-lg transition-all hover:border-gray-600">
                {/* Header Card */}
                <div className="p-6 cursor-pointer" onClick={() => setExpandedStock(expandedStock === stock.ticker ? null : stock.ticker)}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-2xl font-bold text-white tracking-tight">{stock.ticker}</h3>
                                <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded border ${getSentimentColor(stock.netActivity)}`}>
                                    {stock.netActivity}
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm">{stock.companyName}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-right w-full md:w-auto">
                            <div>
                                <span className="block text-xs text-gray-500 uppercase font-bold">Total Buys</span>
                                <span className="text-green-400 font-mono font-bold">{stock.totalBuys}</span>
                            </div>
                            <div>
                                <span className="block text-xs text-gray-500 uppercase font-bold">Total Sells</span>
                                <span className="text-red-400 font-mono font-bold">{stock.totalSells}</span>
                            </div>
                            <div className="col-span-2 md:col-span-1 border-t md:border-t-0 md:border-l border-gray-700 pt-2 md:pt-0 md:pl-6 mt-2 md:mt-0">
                                <span className="block text-xs text-gray-500 uppercase font-bold">Net Imbalance</span>
                                <span className="text-white font-mono font-bold">{stock.dollarImbalance}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 bg-gray-900/50 p-3 rounded-lg text-sm text-gray-300 border border-gray-800/50 flex items-start gap-2">
                        <span className="text-emerald-500 text-lg">🤖</span>
                        <p>{stock.aiSummary}</p>
                    </div>
                </div>

                {/* Expanded Details - Transactions */}
                {expandedStock === stock.ticker && (
                    <div className="border-t border-gray-700 bg-gray-900/30 p-6 animate-fade-in-down">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Recent Transactions</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-700 text-gray-500">
                                        <th className="pb-3 font-medium">Insider</th>
                                        <th className="pb-3 font-medium">Type</th>
                                        <th className="pb-3 font-medium text-right">Amount</th>
                                        <th className="pb-3 font-medium text-right">Shares</th>
                                        <th className="pb-3 font-medium text-right">Price</th>
                                        <th className="pb-3 font-medium text-right">Date</th>
                                        <th className="pb-3 font-medium pl-6">Interpretation</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {stock.transactions.map((tx, tIdx) => (
                                        <tr key={tIdx} className="hover:bg-gray-800/50 transition-colors">
                                            <td className="py-4">
                                                <div className="font-bold text-white">{tx.insiderName}</div>
                                                <div className="text-xs text-gray-500">{tx.role}</div>
                                            </td>
                                            <td className={`py-4 font-bold ${getTransactionColor(tx.transactionType)}`}>
                                                {tx.transactionType}
                                            </td>
                                            <td className="py-4 text-right font-mono text-gray-300">{tx.amount}</td>
                                            <td className="py-4 text-right font-mono text-gray-400">{tx.shares}</td>
                                            <td className="py-4 text-right font-mono text-gray-300">{tx.price}</td>
                                            <td className="py-4 text-right text-gray-500">{tx.date}</td>
                                            <td className="py-4 pl-6 text-gray-400 italic text-xs max-w-xs leading-relaxed">
                                                {tx.interpretation}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
              </div>
            ))}
          </div>
          
          <SourceList sources={data.sources} />
        </>
      )}

      {status === ScanStatus.IDLE && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-600">
             <p className="text-xl font-medium text-gray-400">Track the Smart Money</p>
          </div>
      )}
    </div>
  );
};

export default InsiderScanner;
