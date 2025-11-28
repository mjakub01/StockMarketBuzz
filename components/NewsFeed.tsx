
import React, { useState, useEffect } from 'react';
import SourceList from './SourceList';
import UniversalSortControl from './UniversalSortControl';
import { fetchMarketNews } from '../services/geminiService';
import { NewsFeedResult, NewsCategory, NewsItem, ScanStatus } from '../types';
import { useSorter, SortConfig } from '../hooks/useSorter';
import { useNavigation } from '../contexts/NavigationContext';

interface NewsFeedProps {
  watchlist: string[];
}

const NewsFeed: React.FC<NewsFeedProps> = ({ watchlist }) => {
  const [newsData, setNewsData] = useState<NewsFeedResult | null>(null);
  const [status, setStatus] = useState<ScanStatus>(ScanStatus.IDLE);
  const [activeTab, setActiveTab] = useState<NewsCategory>('Breaking');
  const [error, setError] = useState<string | null>(null);
  const { goToStockAnalysis } = useNavigation();

  // Helper to extract active list based on tab
  const getRawList = () => {
    if (!newsData) return [];
    switch (activeTab) {
      case 'Breaking': return newsData.breakingNews;
      case 'Watchlist': return newsData.watchlistNews;
      case 'Macro': return newsData.marketNews;
      case 'Trending': return newsData.trendingNews;
      case 'Earnings': return newsData.earningsNews;
      case 'Analyst': return newsData.analystNews;
      case 'Company': return newsData.companyNews;
      default: return [];
    }
  };

  const sortConfig: SortConfig<NewsItem>[] = [
    { key: 'impactLevel', label: 'Impact', type: 'sentiment', getValue: (n) => n.impactLevel }, // Using sentiment parser (High=8, Low=2) for impact text works nicely
    { key: 'sentimentScore', label: 'Sentiment', type: 'number' },
    { key: 'headline', label: 'Headline', type: 'string' }
  ];

  const { sortedData, activeKey, direction, handleSort } = useSorter({
    data: getRawList(),
    config: sortConfig,
    defaultKey: 'impactLevel'
  });

  const fetchNews = async () => {
    setStatus(ScanStatus.SCANNING);
    setError(null);
    try {
      const result = await fetchMarketNews(watchlist);
      setNewsData(result);
      setStatus(ScanStatus.COMPLETE);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Failed to fetch live market news.";
      setError(msg);
      setStatus(ScanStatus.ERROR);
    }
  };

  useEffect(() => { fetchNews(); }, []);

  const getSentimentBadge = (score: number) => {
    let color = 'bg-gray-700 text-gray-300';
    let text = 'Neutral';
    if (score >= 8) { color = 'bg-green-900/40 text-green-400 border-green-500/40'; text = 'Very Bullish'; }
    else if (score >= 6) { color = 'bg-green-900/20 text-green-300 border-green-500/20'; text = 'Bullish'; }
    else if (score <= 2) { color = 'bg-red-900/40 text-red-400 border-red-500/40'; text = 'Very Bearish'; }
    else if (score <= 4) { color = 'bg-red-900/20 text-red-300 border-red-500/20'; text = 'Bearish'; }

    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${color}`}>
        {text} ({score}/10)
      </span>
    );
  };

  const getImpactBadge = (level: string) => {
    switch (level) {
      case 'High': return <span className="text-red-400 text-xs font-bold uppercase flex items-center gap-1"><span className="animate-pulse">🔥</span> High Impact</span>;
      case 'Medium': return <span className="text-yellow-400 text-xs font-bold uppercase">⚡ Medium Impact</span>;
      default: return <span className="text-blue-400 text-xs font-bold uppercase">ℹ️ Low Impact</span>;
    }
  };

  const renderNewsCard = (item: NewsItem, idx: number) => {
    const CardContent = (
      <>
        <div className="flex justify-between items-start mb-2">
           <div className="flex flex-wrap gap-2 mb-2">
             {item.tickers?.map(t => (
               <button 
                 key={t} 
                 onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToStockAnalysis(t); }}
                 className="bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded text-xs font-mono font-bold border border-blue-500/30 hover:bg-blue-800 hover:text-white transition-colors"
                >
                 {t}
               </button>
             ))}
             {getSentimentBadge(item.sentimentScore)}
           </div>
           {getImpactBadge(item.impactLevel)}
        </div>

        <h3 className="text-lg font-bold text-white mb-2 leading-snug group-hover:text-blue-300 transition-colors">{item.headline}</h3>

        {/* Category Specific Fields */}
        {(item.epsResult || item.revenueResult) && (
           <div className="flex gap-4 mb-3 text-sm">
              {item.epsResult && <div className="bg-gray-900 px-3 py-1 rounded text-gray-300"><span className="text-gray-500 text-xs uppercase mr-1">EPS:</span> {item.epsResult}</div>}
              {item.revenueResult && <div className="bg-gray-900 px-3 py-1 rounded text-gray-300"><span className="text-gray-500 text-xs uppercase mr-1">Rev:</span> {item.revenueResult}</div>}
           </div>
        )}
        
        <div className="text-sm text-gray-300 mb-3 bg-gray-900/30 p-3 rounded-lg border border-gray-700/30">
           {item.summary}
        </div>

        <div className="flex flex-wrap items-center justify-between mt-3 pt-3 border-t border-gray-700/50">
           <div className="flex flex-wrap gap-2">
            {item.tags.map(tag => (
              <span key={tag} className="text-[10px] uppercase tracking-wider text-gray-500 bg-gray-900 px-2 py-0.5 rounded-full">
                 #{tag}
              </span>
            ))}
          </div>
          {(item.source || item.url) && (
             <div className="text-[10px] text-gray-500 flex items-center gap-1">
                Source: <span className="text-gray-400 font-medium">{item.source || 'Web'}</span>
             </div>
          )}
        </div>
      </>
    );

    if (item.url) {
      return (
        <a key={idx} href={item.url} target="_blank" rel="noopener noreferrer" className="block bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-blue-500 hover:shadow-blue-500/20 transition-all shadow-lg mb-4 cursor-pointer group">
          {CardContent}
        </a>
      );
    }
    return <div key={idx} className="bg-gray-800 border border-gray-700 rounded-xl p-5 transition-all shadow-lg mb-4 group">{CardContent}</div>;
  };

  const categories: NewsCategory[] = ['Breaking', 'Watchlist', 'Macro', 'Trending', 'Earnings', 'Analyst', 'Company'];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
           <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
             <span className="text-4xl">📰</span>
             <span>Market <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">News Feed</span></span>
           </h1>
           <p className="text-gray-400 mt-1 text-sm">Real-time, AI-curated market intelligence.</p>
        </div>
        
        <div className="flex items-center gap-2">
            <button 
                onClick={fetchNews} 
                disabled={status === ScanStatus.SCANNING}
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-700"
            >
                {status === ScanStatus.SCANNING ? 'Refreshing...' : 'Refresh News'}
            </button>
            <UniversalSortControl 
                activeKey={activeKey}
                direction={direction}
                options={sortConfig}
                onSort={handleSort}
            />
        </div>
      </div>

      {status === ScanStatus.ERROR && (
         <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-lg mb-6">
           {error}
         </div>
      )}

      {/* Tabs */}
      <div className="flex overflow-x-auto pb-2 mb-6 gap-2 scrollbar-hide">
         {categories.map(cat => (
           <button
             key={cat}
             onClick={() => setActiveTab(cat)}
             className={`
               whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all
               ${activeTab === cat 
                 ? 'bg-blue-600 text-white shadow-lg' 
                 : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}
             `}
           >
             {cat === 'Watchlist' && watchlist.length > 0 ? `★ ${cat}` : cat}
           </button>
         ))}
      </div>

      {status === ScanStatus.SCANNING && !newsData ? (
         <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="bg-gray-800 h-40 rounded-xl animate-pulse"></div>)}
         </div>
      ) : (
         <div>
            {sortedData.length === 0 ? (
               <div className="text-center py-20 bg-gray-900/50 rounded-xl border border-gray-800 border-dashed">
                  <p className="text-gray-500">No recent news found for {activeTab}.</p>
               </div>
            ) : (
               <div className="animate-fade-in-up">
                  {sortedData.map((item, idx) => renderNewsCard(item, idx))}
               </div>
            )}
            
            {newsData && <SourceList sources={newsData.sources} />}
         </div>
      )}
    </div>
  );
};

export default NewsFeed;
