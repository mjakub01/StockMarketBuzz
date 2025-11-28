
import React from 'react';
import { ScanStatus } from '../types';

interface ScannerHeaderProps {
  onScan: () => void;
  status: ScanStatus;
  lastUpdated: Date | null;
  isLive: boolean;
  onToggleLive: (value: boolean) => void;
}

const ScannerHeader: React.FC<ScannerHeaderProps> = ({ onScan, status, lastUpdated, isLive, onToggleLive }) => {
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

      {/* Criteria Tags */}
      <div className="flex flex-wrap gap-2">
        <span className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-full border border-gray-700">RV &gt; 5x</span>
        <span className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-full border border-gray-700">Price $2-$20</span>
        <span className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-full border border-gray-700">Float &lt; 10M</span>
        <span className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-full border border-gray-700">Gap &ge; 2%</span>
        <span className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-full border border-gray-700">Catalyst + News</span>
      </div>
    </div>
  );
};

export default ScannerHeader;
