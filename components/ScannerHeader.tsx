
import React from 'react';
import { ScanStatus, ScannerFilters } from '../types';

interface ScannerHeaderProps {
  onScan: () => void;
  status: ScanStatus;
  lastUpdated: Date | null;
  isLive: boolean;
  onToggleLive: (value: boolean) => void;
  filters: ScannerFilters;
  onToggleFilter: (key: keyof ScannerFilters) => void;
}

const ScannerHeader: React.FC<ScannerHeaderProps> = ({ 
  onScan, 
  status, 
  lastUpdated, 
  isLive, 
  onToggleLive,
  filters,
  onToggleFilter
}) => {

  const filterConfig: { key: keyof ScannerFilters; label: string; tooltip: string }[] = [
    { key: 'projVolume', label: 'Vol > 25M (Proj)', tooltip: 'Projected EOD Volume > 25 Million shares based on current rate' },
    { key: 'morningActive', label: 'Morning Active', tooltip: 'Significant movement between 7 AM and 11 AM ET' },
    { key: 'breakout', label: 'Breakout HOD', tooltip: 'Price is above Pre-Market High or Previous Day High' },
    { key: 'highVolatility', label: 'High Volatility', tooltip: 'High intraday range (>5%) or ATR expansion' },
    { key: 'excludeDerivatives', label: 'No ETFs/SPACs', tooltip: 'Exclude ETFs, Warrants, and SPACs to find pure momentum' },
    { key: 'lowFloatRetail', label: 'Low Inst. Own', tooltip: 'Institutional Ownership < 30% (Retail Driven)' },
  ];

  return (
    <div className="mb-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Momentum <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">Scanner</span>
          </h1>
          <p className="text-gray-400 mt-2 max-w-xl">
            Identifying high-volatility gaps and momentum . Real-time web scanning for low float, high relative volume opportunities.
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-3">
           {lastUpdated && (
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></span>
              <span className="text-xs text-gray-500 font-mono">
                {isLive ? 'Live Updates Active' : `Last Scan: ${lastUpdated.toLocaleTimeString()}`}
              </span>
            </div>
          )}
          
          <div className="flex gap-3">
            {/* Live Toggle */}
            <button 
              onClick={() => onToggleLive(!isLive)}
              disabled={status === ScanStatus.SCANNING || !lastUpdated}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
                border border-gray-700 
                ${isLive 
                  ? 'bg-green-900/30 text-green-400 border-green-500/50' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }
                ${(!lastUpdated || status === ScanStatus.SCANNING) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Live Updates
            </button>

            <button
              onClick={status === ScanStatus.SCANNING ? undefined : onScan}
              disabled={status === ScanStatus.SCANNING}
              className={`
                relative overflow-hidden px-6 py-2 rounded-lg font-bold text-white shadow-lg transform transition-all duration-200 text-sm
                ${status === ScanStatus.SCANNING 
                  ? 'bg-gray-700 cursor-not-allowed opacity-75' 
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 hover:scale-105 active:scale-95 shadow-blue-900/50'
                }
              `}
            >
              {status === ScanStatus.SCANNING ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Scanning...</span>
                </div>
              ) : (
                <span>Full Scan</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Standard Filters */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-800">
        <span className="flex items-center text-xs font-bold text-gray-500 uppercase mr-2 h-8">Filters:</span>
        {filterConfig.map(f => (
          <button
            key={f.key}
            onClick={() => onToggleFilter(f.key)}
            title={f.tooltip}
            className={`
              px-3 py-1.5 text-xs rounded-full border transition-all duration-200 font-medium flex items-center gap-1.5
              ${filters[f.key] 
                ? 'bg-blue-600/20 text-blue-300 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-gray-200'}
            `}
          >
            {filters[f.key] && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {f.label}
          </button>
        ))}
      </div>

      {/* ROSS Filters Section */}
      <div className={`mt-4 p-4 rounded-xl border transition-all duration-300 ${filters.enableRoss ? 'bg-green-900/10 border-green-500/40 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'bg-gray-800/20 border-gray-700/50'}`}>
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <div className="flex items-start gap-3">
               <div className={`p-2 rounded-lg ${filters.enableRoss ? 'bg-green-500/20 text-green-400' : 'bg-gray-700/50 text-gray-500'}`}>
                  <span className="text-xl">🟩</span>
               </div>
               <div>
                  <h3 className={`font-bold text-sm uppercase tracking-wide flex items-center gap-2 ${filters.enableRoss ? 'text-green-400' : 'text-gray-400'}`}>
                     ROSS Filters
                     {filters.enableRoss && <span className="text-[10px] bg-green-500 text-black px-1.5 rounded font-extrabold">ACTIVE</span>}
                  </h3>
                  <p className={`text-[10px] mt-0.5 ${filters.enableRoss ? 'text-green-500/70' : 'text-gray-500'}`}>Ross Cameron's 5-Step High Momentum Strategy</p>
               </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer group">
              <input 
                type="checkbox" 
                checked={filters.enableRoss} 
                onChange={() => onToggleFilter('enableRoss')} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 shadow-inner"></div>
              <span className={`ml-2 text-xs font-medium transition-colors ${filters.enableRoss ? 'text-green-400' : 'text-gray-400 group-hover:text-gray-300'}`}>
                Enable Strategy
              </span>
            </label>
         </div>

         <div className={`flex flex-wrap gap-2 transition-all duration-300 ${filters.enableRoss ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-900/50 rounded-lg border border-gray-700/50">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
               <span className="text-[10px] font-bold text-gray-300">RVOL ≥ 5x</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-900/50 rounded-lg border border-gray-700/50">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
               <span className="text-[10px] font-bold text-gray-300">Price $2–$20</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-900/50 rounded-lg border border-gray-700/50">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
               <span className="text-[10px] font-bold text-gray-300">Float &lt; 10M</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-900/50 rounded-lg border border-gray-700/50">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
               <span className="text-[10px] font-bold text-gray-300">Gap ≥ 2%</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-900/50 rounded-lg border border-gray-700/50">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
               <span className="text-[10px] font-bold text-gray-300">Active Catalyst</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-900/50 rounded-lg border border-gray-700/50">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
               <span className="text-[10px] font-bold text-gray-300">Active 7-11 AM</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ScannerHeader;
