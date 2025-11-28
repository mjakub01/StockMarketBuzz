
import React from 'react';
import { OversoldCandidate } from '../types';

interface ReboundCardProps {
  candidate: OversoldCandidate;
}

const ReboundCard: React.FC<ReboundCardProps> = ({ candidate }) => {
  const getReactionColor = (reaction: string) => {
    switch (reaction) {
      case 'Bullish': return 'text-green-400 bg-green-900/20 border-green-500/20';
      case 'Neutral': return 'text-gray-400 bg-gray-700/30 border-gray-600/30';
      default: return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/20';
    }
  };

  const getProbColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl hover:border-indigo-500/50 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <h3 className="text-2xl font-bold text-white tracking-tight">{candidate.ticker}</h3>
             <span className={`text-[10px] px-2 py-0.5 rounded uppercase border font-semibold ${getReactionColor(candidate.marketReaction)}`}>
               {candidate.marketReaction}
             </span>
          </div>
          <p className="text-xs text-gray-400 font-medium truncate max-w-[180px]">{candidate.companyName}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-mono font-bold text-white">{candidate.currentPrice}</p>
          <p className="text-xs font-bold text-red-400 bg-red-900/20 px-2 py-0.5 rounded mt-1 inline-block">
             {candidate.dropFromHigh}
          </p>
        </div>
      </div>

      <div className="mb-5">
         <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Recent Catalyst
         </div>
         <p className="text-gray-200 text-sm leading-snug font-medium">
           {candidate.recentCatalyst}
         </p>
      </div>

      <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50 mb-4">
        <h4 className="text-xs text-gray-500 uppercase font-bold mb-1">Why It Matters</h4>
        <p className="text-gray-300 text-xs leading-relaxed">
          {candidate.whyItMatters}
        </p>
      </div>

      <div>
        <div className="flex justify-between text-xs uppercase text-gray-500 mb-1.5 font-medium">
          <span>Reversal Probability</span>
          <span className="text-white font-mono">{candidate.reversalProbability}/10</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden shadow-inner">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${getProbColor(candidate.reversalProbability)}`} 
            style={{ width: `${candidate.reversalProbability * 10}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ReboundCard;
