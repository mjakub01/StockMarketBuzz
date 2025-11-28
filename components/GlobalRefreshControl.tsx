
import React, { useState, useEffect } from 'react';
import { useGlobalRefresh } from '../contexts/GlobalRefreshContext';

const GlobalRefreshControl: React.FC = () => {
  const { 
    triggerRefresh, 
    isAutoRefresh, 
    toggleAutoRefresh, 
    refreshInterval, 
    setRefreshInterval,
    lastUpdated
  } = useGlobalRefresh();

  const [isSpinning, setIsSpinning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleRefresh = () => {
    setIsSpinning(true);
    triggerRefresh();
    setShowToast(true);
    
    // Animation reset
    setTimeout(() => setIsSpinning(false), 1000);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <>
      {/* Visual Feedback Toast */}
      <div className={`fixed bottom-24 right-6 bg-gray-900 border border-green-500/50 text-green-400 px-4 py-2 rounded-lg shadow-2xl transition-all duration-500 z-50 flex items-center gap-2 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-xs font-bold">Data Updated: {lastUpdated?.toLocaleTimeString()}</span>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed bottom-24 right-6 bg-gray-900/90 backdrop-blur-md border border-gray-700 p-4 rounded-xl shadow-2xl z-50 w-64 animate-fade-in-up">
           <h4 className="text-white font-bold text-sm mb-3 border-b border-gray-800 pb-2">Auto-Refresh Settings</h4>
           
           <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-xs">Live Updates</span>
              <button 
                onClick={() => toggleAutoRefresh(!isAutoRefresh)}
                className={`w-10 h-5 rounded-full flex items-center transition-colors duration-300 ${isAutoRefresh ? 'bg-green-500 justify-end' : 'bg-gray-700 justify-start'}`}
              >
                 <span className="w-4 h-4 bg-white rounded-full shadow-md mx-0.5"></span>
              </button>
           </div>

           <div className={`space-y-2 transition-opacity ${isAutoRefresh ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              <p className="text-xs text-gray-500 uppercase font-bold">Update Frequency</p>
              <div className="grid grid-cols-2 gap-2">
                 {[5000, 15000, 30000, 60000].map(ms => (
                    <button
                      key={ms}
                      onClick={() => setRefreshInterval(ms)}
                      className={`text-xs py-1.5 rounded-md border font-medium transition-colors ${refreshInterval === ms ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'}`}
                    >
                      {ms / 1000}s
                    </button>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* Main Refresh Button Group */}
      <div className="fixed bottom-6 right-6 flex items-center gap-3 z-[60]">
         {/* Settings Toggle */}
         <button 
           onClick={() => setShowSettings(!showSettings)}
           className={`p-3 rounded-full bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700 shadow-lg transition-all ${showSettings ? 'text-blue-400 border-blue-500/50' : ''}`}
         >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
           </svg>
         </button>

         {/* REFRESH ALL Button */}
         <button
           onClick={handleRefresh}
           className="relative group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white pl-4 pr-6 py-3 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.5)] hover:shadow-[0_0_30px_rgba(79,70,229,0.7)] border border-white/20 transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2"
         >
            <div className={`transition-transform duration-700 ease-in-out ${isSpinning ? 'rotate-[360deg]' : ''}`}>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
               </svg>
            </div>
            <div className="flex flex-col items-start">
               <span className="text-sm font-bold tracking-wide">REFRESH ALL</span>
               {isAutoRefresh && <span className="text-[9px] font-mono text-blue-200 opacity-90 leading-none">AUTO ON • {refreshInterval/1000}s</span>}
            </div>
            
            {/* Glow Ring Animation */}
            <span className="absolute -inset-1 rounded-full border border-blue-400 opacity-30 animate-pulse-fast pointer-events-none"></span>
         </button>
      </div>
    </>
  );
};

export default GlobalRefreshControl;
