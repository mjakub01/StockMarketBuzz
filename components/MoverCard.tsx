
import React from 'react';
import { MarketMover } from '../types';
import { useNavigation } from '../contexts/NavigationContext';

interface MoverCardProps {
  mover: MarketMover;
}

const MoverCard: React.FC<MoverCardProps> = ({ mover }) => {
  const { goToStockAnalysis } = useNavigation();
  // FIX: Cast to string to ensure .includes works even if API returns a number
  const isPositive = !String(mover.priceMovement || '').includes('-');
  
  const getMomentumColor = (momentum: string) => {
    switch(momentum?.toLowerCase()) {
      case 'bullish': return 'text-green-400 bg-green-900/30 border-green-500/30';
      case 'bearish': return 'text-red-400 bg-red-900/30 border-red-500/30';
      default: return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/30';
    }
  };

  const getSentimentColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div 
      onClick={() => goToStockAnalysis(mover.ticker)}
      className="bg-gray-800 border border-gray-700 rounded-xl p-5 shadow-lg group hover:border-orange-500/50 transition-all duration-300 relative overflow-hidden cursor-pointer"
    >
      {/* Background Pulse Effect for high sentiment */}
      {mover.marketSentiment >= 9 && (
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-orange-500/20 blur-2xl rounded-full"></div>
      )}

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2 group-hover:text-blue-400 transition-colors">
            {mover.ticker}
            <span className={`text-[10px] px-2 py-0.5 rounded uppercase border ${getMomentumColor(mover.technicalMomentum)}`}>
              {mover.technicalMomentum}
            </span>
          </h3>
          <p className="text-xs text-gray-400 font-medium truncate max-w-[150px]">{mover.companyName}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-mono font-bold text-white">{mover.currentPrice}</p>
          <p className={`text-sm font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {mover.priceMovement}
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-4 relative z-10">
        <div className="flex justify-between items-center text-sm border-b border-gray-700 pb-2">
           <span className="text-gray-500 text-xs uppercase">Volume vs 30D Avg</span>
           <span className="text-blue-300 font-mono font-medium">{mover.volumeChange}</span>
        </div>
        
        <div className="flex justify-between items-center text-sm border-b border-gray-700 pb-2">
           <span className="text-gray-500 text-xs uppercase">Catalyst</span>
           <span className="text-gray-200 text-right text-xs max-w-[60%] leading-tight">{mover.keyCatalyst}</span>
        </div>

        <div>
           <div className="flex justify-between text-xs uppercase text-gray-500 mb-1">
             <span>Market Sentiment</span>
             <span className="text-white font-mono">{mover.marketSentiment}/10</span>
           </div>
           <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full ${getSentimentColor(mover.marketSentiment)}`} 
                style={{ width: `${mover.marketSentiment * 10}%` }}
              ></div>
           </div>
        </div>
      </div>

      <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
         <p className="text-gray-400 text-xs leading-relaxed">
           <span className="text-orange-400 font-semibold block mb-1">🔥 Why It's Hot:</span>
           {mover.whyItsHot}
         </p>
      </div>
    </div>
  );
};

export default MoverCard;
