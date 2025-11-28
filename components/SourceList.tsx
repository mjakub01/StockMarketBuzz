import React, { useState } from 'react';
import { SearchSource } from '../types';

interface SourceListProps {
  sources: SearchSource[];
}

const SourceList: React.FC<SourceListProps> = ({ sources }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!sources || sources.length === 0) return null;

  const getFaviconUrl = (uri: string) => {
    try {
      const url = new URL(uri);
      return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`;
    } catch (e) {
      return null;
    }
  };

  const getHostname = (uri: string) => {
    try {
      return new URL(uri).hostname.replace('www.', '');
    } catch (e) {
      return uri;
    }
  };

  return (
    <div className="mt-12 pt-6 border-t border-gray-800 animate-fade-in">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 hover:text-gray-300 transition-colors focus:outline-none group"
      >
        <span>Data Sources</span>
        <span className="bg-gray-800 text-gray-400 text-[10px] px-2 py-0.5 rounded-full">{sources.length}</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-4 w-4 transition-transform duration-300 text-gray-600 group-hover:text-gray-400 ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'opacity-100 max-h-[1000px]' : 'opacity-0 max-h-0'}`}>
        {sources.map((source, idx) => {
          const favicon = getFaviconUrl(source.uri);
          const hostname = getHostname(source.uri);
          
          return (
            <a 
              key={idx} 
              href={source.uri} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-800/50 hover:border-blue-500/30 hover:bg-gray-800 transition-all group"
            >
              {favicon ? (
                <div className="flex-shrink-0 w-8 h-8 rounded bg-gray-800 flex items-center justify-center p-1.5 overflow-hidden">
                   <img 
                    src={favicon} 
                    alt="" 
                    className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              ) : (
                <div className="flex-shrink-0 w-8 h-8 rounded bg-gray-800 flex items-center justify-center text-gray-500 text-xs font-bold">
                  {hostname.charAt(0).toUpperCase()}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-300 group-hover:text-blue-300 truncate font-medium transition-colors">
                  {source.title || hostname}
                </p>
                <p className="text-[10px] text-gray-600 truncate">
                  {hostname}
                </p>
              </div>
              
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700 group-hover:text-gray-500 flex-shrink-0 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default SourceList;