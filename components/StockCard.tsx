
import React, { useEffect, useState, useRef } from 'react';
import { StockCandidate } from '../types';

interface StockCardProps {
  stock: StockCandidate;
  percentLabel?: string;
  viewMode?: 'live' | 'pre' | 'post';
  // Drag & Drop Props
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, symbol: string) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>, symbol: string) => void;
}

const StockCard: React.FC<StockCardProps> = ({ 
  stock, 
  percentLabel = "Gap", 
  viewMode = 'live',
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop
}) => {
  const [flash, setFlash] = useState<'green' | 'red' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Determine which price to show based on viewMode
  let displayPrice = stock.price;
  let displayChange = stock.gapPercent;
  let changeLabel = percentLabel;

  if (viewMode === 'pre' && stock.preMarketPrice) {
    displayPrice = stock.preMarketPrice;
    displayChange = stock.preMarketChange || '0.00%';
    changeLabel = "Pre-Mkt";
  } else if (viewMode === 'post' && stock.afterHoursPrice) {
    displayPrice = stock.afterHoursPrice;
    displayChange = stock.afterHoursChange || '0.00%';
    changeLabel = "Aft-Hrs";
  }

  // Fallback if specific session data missing: indicate via label
  if (viewMode === 'pre' && !stock.preMarketPrice) changeLabel = "Pre (N/A)";
  if (viewMode === 'post' && !stock.afterHoursPrice) changeLabel = "Post (N/A)";

  const isHighGap = parseFloat(displayChange.replace(/[^0-9.-]/g, '')) > 20;
  const isPositive = !displayChange.includes('-');
  
  const prevPriceRef = useRef<string>(displayPrice);

  useEffect(() => {
    const cleanPrice = (p: string) => parseFloat(p.replace(/[^0-9.]/g, ''));
    
    const current = cleanPrice(displayPrice);
    const prev = cleanPrice(prevPriceRef.current);

    if (current > prev) {
      setFlash('green');
    } else if (current < prev) {
      setFlash('red');
    }

    prevPriceRef.current = displayPrice;

    const timer = setTimeout(() => setFlash(null), 2000);
    return () => clearTimeout(timer);
  }, [displayPrice]);

  // Logic to detect if a meaningful catalyst exists
  const hasCatalyst = stock.catalyst && 
    stock.catalyst.length > 3 && 
    !['none', 'n/a', 'unknown', 'no news', 'unclear', 'investors observer'].some(s => stock.catalyst.toLowerCase().includes(s));

  const handleDragStartInternal = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
    if (onDragStart) onDragStart(e, stock.symbol);
    // Set drag image ghosting effect if needed, usually browser default is okay
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEndInternal = () => {
    setIsDragging(false);
  };

  return (
    <div 
      draggable={draggable}
      onDragStart={handleDragStartInternal}
      onDragEnd={handleDragEndInternal}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop && onDrop(e, stock.symbol)}
      className={`
      bg-gray-800 border rounded-xl p-5 shadow-lg group relative overflow-hidden transition-all duration-300
      ${flash === 'green' ? 'border-green-500 shadow-green-500/20' : flash === 'red' ? 'border-red-500 shadow-red-500/20' : 'border-gray-700 hover:border-blue-500'}
      ${isDragging ? 'opacity-50 scale-95 border-dashed border-gray-500' : ''}
      ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}
    `}>
      {/* Accent Line */}
      <div className={`absolute top-0 left-0 w-1 h-full ${isHighGap ? 'bg-green-500' : 'bg-blue-500'}`}></div>

      <div className="flex justify-between items-start mb-3 pl-3">
        <div>
          <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors flex items-center gap-2">
            {stock.symbol}
            {hasCatalyst && (
              <span className="bg-yellow-500/20 text-yellow-400 p-1 rounded-md border border-yellow-500/30 shadow-[0_0_8px_rgba(234,179,8,0.3)]" title="News Catalyst Detected">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </h3>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{stock.companyName}</p>
        </div>
        <div className="text-right">
          <p className={`text-xl font-mono font-bold transition-colors duration-300 ${flash === 'green' ? 'text-green-400' : flash === 'red' ? 'text-red-400' : 'text-white'}`}>
            {displayPrice}
          </p>
          <p className={`text-sm font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {displayChange} <span className="text-xs font-normal text-gray-400 ml-1">{changeLabel}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm pl-3 mb-4">
        <div>
          <span className="text-gray-500 block text-xs uppercase">Volume</span>
          <span className="text-gray-200 font-mono">{stock.volume}</span>
        </div>
        <div>
          <span className="text-gray-500 block text-xs uppercase">Float</span>
          <span className="text-gray-200 font-mono">{stock.float}</span>
        </div>
        <div>
          <span className="text-gray-500 block text-xs uppercase">Rel Vol</span>
          <span className="text-yellow-400 font-mono font-bold">{stock.relativeVolume}</span>
        </div>
        <div>
          <span className="text-gray-500 block text-xs uppercase">Sector</span>
          <span className="text-gray-200">{stock.sector}</span>
        </div>
      </div>

      {/* Extended Data Row if not selected view */}
      {(stock.preMarketChange || stock.afterHoursChange) && (
         <div className="pl-3 mb-3 grid grid-cols-2 gap-2 border-t border-gray-700/50 pt-2">
            {stock.preMarketChange && viewMode !== 'pre' && (
               <div className="flex justify-between text-xs">
                 <span className="text-gray-500">Pre-Mkt:</span>
                 <span className={`${stock.preMarketChange.includes('-') ? 'text-red-300' : 'text-green-300'} font-mono`}>
                    {stock.preMarketPrice} ({stock.preMarketChange})
                 </span>
               </div>
            )}
            {stock.afterHoursChange && viewMode !== 'post' && (
               <div className="flex justify-between text-xs">
                 <span className="text-gray-500">Aft-Hrs:</span>
                 <span className={`${stock.afterHoursChange.includes('-') ? 'text-red-300' : 'text-green-300'} font-mono`}>
                    {stock.afterHoursPrice} ({stock.afterHoursChange})
                 </span>
               </div>
            )}
         </div>
      )}

      <div className="pl-3 border-t border-gray-700 pt-3">
        <div className="flex items-center gap-2 mb-1">
            <span className="text-gray-500 text-xs uppercase block">Catalyst</span>
            {hasCatalyst && <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse"></span>}
        </div>
        <p className={`text-sm leading-snug ${hasCatalyst ? 'text-white font-medium' : 'text-gray-300'}`}>{stock.catalyst}</p>
      </div>
      
      <div className="pl-3 mt-3">
         <p className="text-gray-500 text-xs italic">{stock.summary}</p>
      </div>
    </div>
  );
};

export default StockCard;
