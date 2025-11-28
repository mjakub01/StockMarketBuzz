
import React, { useState, useRef, useEffect } from 'react';
import { SortDirection, SortConfig } from '../hooks/useSorter';

interface UniversalSortControlProps<T> {
  activeKey: string;
  direction: SortDirection;
  options: SortConfig<T>[];
  onSort: (key: string) => void;
}

function UniversalSortControl<T>({ activeKey, direction, options, onSort }: UniversalSortControlProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLabel = options.find(o => o.key === activeKey)?.label || 'Sort';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative z-30" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
        </svg>
        <span>{activeLabel}</span>
        <span className="text-gray-500 text-xs ml-1 bg-gray-900 px-1.5 py-0.5 rounded">
          {direction === 'asc' ? '↑' : '↓'}
        </span>
        <svg 
           xmlns="http://www.w3.org/2000/svg" 
           className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
           fill="none" 
           viewBox="0 0 24 24" 
           stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-fade-in-down origin-top-right">
          <div className="p-2 border-b border-gray-800 bg-gray-900/50">
            <span className="text-[10px] uppercase font-bold text-gray-500 px-2">Sort By</span>
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {options.map((option) => (
              <button
                key={option.key}
                onClick={() => {
                  onSort(option.key);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors
                  ${activeKey === option.key 
                    ? 'bg-blue-900/20 text-blue-400' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'}
                `}
              >
                <span>{option.label}</span>
                {activeKey === option.key && (
                  <span className="text-xs font-bold bg-blue-900/40 px-2 py-0.5 rounded text-blue-300">
                     {direction === 'asc' ? 'Low → High' : 'High → Low'}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default UniversalSortControl;
