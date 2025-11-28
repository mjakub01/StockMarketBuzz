
import React, { useState, useEffect } from 'react';
import { fetchUpcomingEarnings } from '../services/geminiService';
import { EarningsCalendarEvent, CalendarDateRange } from '../types';
import { useNavigation } from '../contexts/NavigationContext';

const EarningsCalendarTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CalendarDateRange>('Today');
  const [data, setData] = useState<EarningsCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { goToStockAnalysis } = useNavigation();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const events = await fetchUpcomingEarnings(activeTab);
        setData(events);
      } catch (error) {
        console.error("Failed to fetch earnings calendar", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [activeTab]);

  return (
    <div className="bg-gray-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up">
      <div className="p-8 border-b border-white/10 bg-gray-900/50 flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Earnings Calendar</h2>
          <p className="text-gray-400 text-sm mt-1">Companies reporting upcoming earnings.</p>
        </div>

        <div className="flex gap-2 bg-gray-800/50 p-1 rounded-xl">
          {(['Today', 'Tomorrow', 'This Week'] as CalendarDateRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setActiveTab(range)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === range
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
          <p className="animate-pulse font-mono text-sm tracking-wider">FETCHING EARNINGS DATA...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-800/50 text-gray-500 text-xs uppercase font-bold tracking-widest">
              <tr>
                <th className="p-6">Ticker</th>
                <th className="p-6">Company</th>
                <th className="p-6">Time</th>
                <th className="p-6 text-right">Est. EPS</th>
                <th className="p-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 italic">
                    No major earnings scheduled for {activeTab}.
                  </td>
                </tr>
              ) : (
                data.map((evt, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors group">
                    <td className="p-6">
                      <button
                        onClick={() => goToStockAnalysis(evt.symbol)}
                        className="text-white font-mono font-bold hover:text-blue-400 hover:underline transition-colors"
                      >
                        {evt.symbol}
                      </button>
                    </td>
                    <td className="p-6 text-gray-300 font-medium text-sm">{evt.companyName}</td>
                    <td className="p-6">
                      <span
                        className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 w-fit ${
                          evt.time === 'BMO'
                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            : evt.time === 'AMC'
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                            : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                        }`}
                        title={evt.time === 'BMO' ? 'Before Market Open' : evt.time === 'AMC' ? 'After Market Close' : 'During Market'}
                      >
                        {evt.time === 'BMO' ? '☀️ BMO' : evt.time === 'AMC' ? '🌙 AMC' : 'MARKET'}
                      </span>
                    </td>
                    <td className="p-6 text-right font-mono font-bold tracking-tight">
                        <span className={evt.epsEstimate.startsWith('-') ? 'text-red-400' : 'text-green-400'}>
                            {evt.epsEstimate}
                        </span>
                    </td>
                    <td className="p-6 text-right">
                      <button
                        onClick={() => goToStockAnalysis(evt.symbol)}
                        className="text-xs bg-gray-800 hover:bg-blue-600 text-gray-300 hover:text-white px-3 py-1.5 rounded transition-all border border-gray-700 hover:border-blue-500"
                      >
                        Analyze
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EarningsCalendarTable;
