
import React from 'react';

export interface SortOption {
  label: string;
  value: string;
}

interface SortControlsProps {
  options: SortOption[];
  currentSort: string;
  currentOrder: 'asc' | 'desc';
  onSortChange: (value: string) => void;
  onOrderChange: (order: 'asc' | 'desc') => void;
}

const SortControls: React.FC<SortControlsProps> = ({ 
  options, 
  currentSort, 
  currentOrder, 
  onSortChange, 
  onOrderChange 
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 bg-gray-800/50 p-2 rounded-lg border border-gray-700/50">
      <span className="text-xs font-bold text-gray-500 uppercase px-2">Sort By:</span>
      
      <div className="flex gap-1">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSortChange(option.value)}
            className={`
              px-3 py-1 text-xs font-medium rounded-md transition-all
              ${currentSort === option.value 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'}
            `}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="w-px h-4 bg-gray-700 mx-1"></div>

      <div className="flex bg-gray-900 rounded-md p-0.5">
        <button
          onClick={() => onOrderChange('asc')}
          className={`p-1.5 rounded transition-colors ${currentOrder === 'asc' ? 'bg-gray-700 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
          title="Ascending"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
        </button>
        <button
          onClick={() => onOrderChange('desc')}
          className={`p-1.5 rounded transition-colors ${currentOrder === 'desc' ? 'bg-gray-700 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
          title="Descending"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h5m4 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SortControls;
