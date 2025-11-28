
import React, { useState, useEffect } from 'react';
import HeatmapScanner from './HeatmapScanner';
import MarketMoversScanner from './MarketMoversScanner';
import NewsFeed from './NewsFeed';
import StockCard from './StockCard';
import { fetchMarketIndices, fetchEconomicCalendar, fetchTopGainersLosers, fetchDailyMarketSummary, fetchCryptoMovers } from '../services/geminiService';
import { MarketIndex, EconomicEvent, GainersLosersResult, DailyMarketSummary, CryptoCandidate } from '../types';
import { useGlobalRefresh } from '../contexts/GlobalRefreshContext';

interface MarketOverviewProps {}

const MarketOverview: React.FC<MarketOverviewProps> = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { refreshTrigger } = useGlobalRefresh();

  // --- Sub-Screen Components ---

  const IndicesView = () => {
    const [indices, setIndices] = useState<MarketIndex[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = () => fetchMarketIndices().then(setIndices).finally(() => setLoading(false));

    useEffect(() => { loadData(); }, []);
    useEffect(() => { if(refreshTrigger > 0) loadData(); }, [refreshTrigger]);

    if (loading) return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
        <p className="animate-pulse font-mono text-sm tracking-wider">LOADING INDICES DATA...</p>
      </div>
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
        {indices.map((idx) => (
          <div key={idx.symbol} className="bg-gray-900/40 backdrop-blur-xl p-6 rounded-2xl border border-white/5 shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-300 group hover:-translate-y-1">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-lg font-bold text-gray-300 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                    {idx.symbol[0]}
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-white leading-none tracking-tight">{idx.symbol}</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">{idx.name}</p>
                 </div>
              </div>
              <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${idx.sentiment === 'Bullish' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                {idx.sentiment}
              </span>
            </div>
            <div className="text-3xl font-mono font-bold text-white mb-2 tracking-tighter drop-shadow-md">{idx.price}</div>
            <div className={`flex items-center gap-2 text-sm font-bold ${idx.changePercent.includes('-') ? 'text-red-400' : 'text-green-400'}`}>
              <span className={`px-2 py-0.5 rounded text-xs ${idx.changePercent.includes('-') ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                {idx.changePercent}
              </span>
              <span>{idx.change}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const GainersLosersView = () => {
    const [data, setData] = useState<GainersLosersResult | null>(null);
    const [loading, setLoading] = useState(true);

    const loadData = () => fetchTopGainersLosers().then(setData).finally(() => setLoading(false));

    useEffect(() => { loadData(); }, []);
    useEffect(() => { if(refreshTrigger > 0) loadData(); }, [refreshTrigger]);

    if (loading) return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4 shadow-[0_0_15px_rgba(34,197,94,0.5)]"></div>
        <p className="animate-pulse font-mono text-sm tracking-wider">SCANNING MARKET MOVERS...</p>
      </div>
    );

    return (
      <div className="space-y-12 animate-fade-in-up">
        <div className="bg-gray-900/30 border border-white/5 rounded-3xl p-6 md:p-8">
          <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-4">
             <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl text-green-400 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
             </div>
             <div>
               <h3 className="text-2xl font-bold text-white tracking-tight">Top Gainers</h3>
               <p className="text-gray-500 text-xs uppercase tracking-widest">Momentum Leaders</p>
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.gainers.map((s, i) => <StockCard key={i} stock={s} percentLabel="Gain" />)}
          </div>
        </div>

        <div className="bg-gray-900/30 border border-white/5 rounded-3xl p-6 md:p-8">
          <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-4">
             <div className="p-3 bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-xl text-red-400 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
             </div>
             <div>
               <h3 className="text-2xl font-bold text-white tracking-tight">Top Losers</h3>
               <p className="text-gray-500 text-xs uppercase tracking-widest">Highest Relative Weakness</p>
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.losers.map((s, i) => <StockCard key={i} stock={s} percentLabel="Loss" />)}
          </div>
        </div>
      </div>
    );
  };

  const AIView = () => {
    const [data, setData] = useState<DailyMarketSummary | null>(null);
    const [loading, setLoading] = useState(true);

    const loadData = () => fetchDailyMarketSummary().then(setData).finally(() => setLoading(false));

    useEffect(() => { loadData(); }, []);
    useEffect(() => { if(refreshTrigger > 0) loadData(); }, [refreshTrigger]);

    if (loading) return (
       <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
          <p className="animate-pulse font-mono text-sm tracking-wider">ANALYZING MARKET DATA...</p>
       </div>
    );

    return (
      <div className="max-w-4xl mx-auto animate-fade-in-up">
        <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
           {/* Decorative Glows */}
           <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>
           <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
           
           <div className="relative z-10">
              <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.4)] border border-white/10">
                     <span className="text-4xl">🤖</span>
                  </div>
                  <div>
                     <h2 className="text-4xl font-extrabold text-white tracking-tight">Market Intelligence</h2>
                     <p className="text-indigo-400 font-mono text-sm mt-1 uppercase tracking-widest">AI-Generated Analysis</p>
                  </div>
              </div>

              <div className="flex items-center gap-4 mb-8 bg-black/20 p-4 rounded-xl border border-white/5 w-fit">
                 <span className="text-gray-400 text-xs uppercase font-bold tracking-wider">Overall Sentiment</span>
                 <span className={`px-4 py-1.5 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2 ${data?.sentiment === 'Bullish' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : data?.sentiment === 'Bearish' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-gray-600/20 text-gray-300 border border-gray-600/30'}`}>
                    <span className={`w-2 h-2 rounded-full ${data?.sentiment === 'Bullish' ? 'bg-green-400' : data?.sentiment === 'Bearish' ? 'bg-red-400' : 'bg-gray-400'} animate-pulse`}></span>
                    {data?.sentiment}
                 </span>
              </div>

              <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/5 relative">
                 <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-blue-500 rounded-l-2xl"></div>
                 <p className="text-gray-200 text-lg leading-relaxed font-light tracking-wide">
                    {data?.summary}
                 </p>
              </div>

              <h3 className="font-bold text-white mb-6 uppercase text-sm tracking-widest flex items-center gap-2">
                 <span className="text-indigo-400">//</span> Key Takeaways
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {data?.keyPoints.map((kp, i) => (
                    <div key={i} className="flex items-start gap-4 p-5 bg-gray-800/30 rounded-xl border border-white/5 hover:bg-gray-800/50 transition-colors">
                       <span className="text-indigo-400 font-bold mt-0.5">0{i+1}</span>
                       <span className="text-gray-300 text-sm font-medium leading-relaxed">{kp}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    );
  };

  const CalendarView = () => {
    const [events, setEvents] = useState<EconomicEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = () => fetchEconomicCalendar().then(setEvents).finally(() => setLoading(false));

    useEffect(() => { loadData(); }, []);
    useEffect(() => { if(refreshTrigger > 0) loadData(); }, [refreshTrigger]);

    if (loading) return (
       <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500 mb-4"></div>
          <p className="animate-pulse font-mono text-sm tracking-wider">FETCHING MACRO DATA...</p>
       </div>
    );

    return (
      <div className="bg-gray-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up">
        <div className="p-8 border-b border-white/10 bg-gray-900/50 flex justify-between items-end">
           <div>
               <h2 className="text-3xl font-bold text-white tracking-tight">Economic Calendar</h2>
               <p className="text-gray-400 text-sm mt-1">Key macro events affecting volatility.</p>
           </div>
           <div className="text-4xl opacity-20">📅</div>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead className="bg-gray-800/50 text-gray-500 text-xs uppercase font-bold tracking-widest">
                 <tr>
                    <th className="p-6">Time</th>
                    <th className="p-6">Event</th>
                    <th className="p-6">Impact</th>
                    <th className="p-6 text-right">Actual</th>
                    <th className="p-6 text-right">Forecast</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                 {events.map((evt, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors group">
                       <td className="p-6 text-white font-mono text-sm group-hover:text-blue-300 transition-colors">{evt.time}</td>
                       <td className="p-6 text-gray-200 font-medium">{evt.event}</td>
                       <td className="p-6">
                          <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${evt.impact === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' : evt.impact === 'Medium' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                             {evt.impact}
                          </span>
                       </td>
                       <td className="p-6 text-right text-white font-mono font-bold tracking-tight">{evt.actual || '-'}</td>
                       <td className="p-6 text-right text-gray-500 font-mono text-sm">{evt.forecast || '-'}</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    );
  };

  const CryptoView = () => {
      const [coins, setCoins] = useState<CryptoCandidate[]>([]);
      const [loading, setLoading] = useState(true);

      const loadData = () => fetchCryptoMovers().then(setCoins).finally(() => setLoading(false));
  
      useEffect(() => { loadData(); }, []);
      useEffect(() => { if(refreshTrigger > 0) loadData(); }, [refreshTrigger]);
  
      if (loading) return (
         <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mb-4 shadow-[0_0_15px_rgba(234,197,8,0.5)]"></div>
            <p className="animate-pulse font-mono text-sm tracking-wider">LOADING CRYPTO MARKETS...</p>
         </div>
      );
  
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
          {coins.map((coin, i) => (
            <div key={i} className="bg-gray-900/60 backdrop-blur-md rounded-2xl border border-white/5 p-6 shadow-lg hover:border-yellow-500/30 hover:shadow-[0_0_20px_rgba(234,179,8,0.1)] transition-all duration-300 group hover:-translate-y-1">
               <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-2xl border border-yellow-500/20">🪙</div>
                     <div>
                        <h3 className="text-white font-bold tracking-tight text-lg">{coin.symbol}</h3>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">{coin.name}</p>
                     </div>
                  </div>
                  <span className={`text-sm font-bold px-2 py-1 rounded bg-black/30 ${coin.change24h.includes('-') ? 'text-red-400' : 'text-green-400'}`}>
                     {coin.change24h}
                  </span>
               </div>
               <div className="text-2xl font-mono font-bold text-white mb-2 tracking-tighter">{coin.price}</div>
               <div className="flex justify-between items-end border-t border-white/5 pt-3 mt-2">
                  <span className="text-[10px] text-gray-500 uppercase font-bold">Volume (24h)</span>
                  <span className="text-gray-300 font-mono text-sm">{coin.volume}</span>
               </div>
            </div>
          ))}
        </div>
      );
  };

  const OptionsView = () => {
     return (
        <div className="max-w-3xl mx-auto text-center py-24 animate-fade-in-up">
           <div className="inline-block p-1 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 mb-8 shadow-[0_0_50px_rgba(236,72,153,0.3)]">
              <div className="p-8 rounded-full bg-gray-900 border border-gray-700 relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/10 to-transparent"></div>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                 </svg>
              </div>
           </div>
           <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Institutional <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">Flow</span></h2>
           <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
              Unlock real-time Options Flow, Dark Pool Prints, and Whale Activity. See where the smart money is positioning.
           </p>
           <button className="px-10 py-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-2xl font-bold text-lg shadow-[0_0_30px_rgba(236,72,153,0.4)] transition-all transform hover:scale-105 active:scale-95 border border-white/10">
              Unlock Pro Access
           </button>
        </div>
     );
  };

  const buttons = [
    { id: 'indices', title: 'Market Indices', subtitle: 'SPY, QQQ, DIA, IWM', icon: '📊', color: 'from-blue-600 to-indigo-600', shadow: 'shadow-blue-500/20' },
    { id: 'sectors', title: 'Sector Heatmap', subtitle: 'Live Sector Rotation', icon: '📈', color: 'from-emerald-500 to-teal-600', shadow: 'shadow-teal-500/20' },
    { id: 'gainers', title: 'Top Gainers', subtitle: 'Daily Extremes', icon: '🚀', color: 'from-green-500 to-emerald-600', shadow: 'shadow-green-500/20' },
    { id: 'movers', title: 'Market Movers', subtitle: 'Volume & Momentum', icon: '🔥', color: 'from-orange-500 to-red-600', shadow: 'shadow-orange-500/20' },
    { id: 'ai', title: 'AI Summary', subtitle: 'Daily Intelligence', icon: '🤖', color: 'from-indigo-600 to-violet-600', shadow: 'shadow-indigo-500/20' },
    { id: 'news', title: 'News Briefing', subtitle: 'Curated Headlines', icon: '📰', color: 'from-purple-500 to-fuchsia-600', shadow: 'shadow-purple-500/20' },
    { id: 'calendar', title: 'Eco. Calendar', subtitle: 'Key Macro Events', icon: '📅', color: 'from-slate-500 to-slate-700', shadow: 'shadow-slate-500/20' },
    { id: 'options', title: 'Options Flow', subtitle: 'Whale Activity', icon: '💰', color: 'from-pink-500 to-rose-600', shadow: 'shadow-pink-500/20', badge: 'PREMIUM' },
    { id: 'crypto', title: 'Crypto Movers', subtitle: 'BTC, ETH & Alts', icon: '🪙', color: 'from-yellow-500 to-amber-600', shadow: 'shadow-yellow-500/20' },
  ];

  // --- Main Render ---

  if (activeSection) {
    return (
      <div className="max-w-7xl mx-auto animate-fade-in pb-20">
        <div className="flex items-center justify-between mb-8">
            <button 
                onClick={() => setActiveSection(null)}
                className="group flex items-center gap-3 px-5 py-2.5 rounded-xl bg-gray-900/50 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/5 backdrop-blur-md"
            >
                <div className="p-1 rounded-full bg-gray-800 group-hover:bg-gray-700 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-translate-x-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-bold text-sm tracking-wide">DASHBOARD</span>
            </button>
            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight hidden md:block">
              {buttons.find(b => b.id === activeSection)?.title}
            </h2>
        </div>

        {activeSection === 'indices' && <IndicesView />}
        {activeSection === 'sectors' && <HeatmapScanner />}
        {activeSection === 'gainers' && <GainersLosersView />}
        {activeSection === 'movers' && <MarketMoversScanner />}
        {activeSection === 'ai' && <AIView />}
        {activeSection === 'news' && <NewsFeed watchlist={[]} />}
        {activeSection === 'calendar' && <CalendarView />}
        {activeSection === 'options' && <OptionsView />}
        {activeSection === 'crypto' && <CryptoView />}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-20">
      <div className="text-center mb-16 relative">
         {/* Background Ambience */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

         <h1 className="text-6xl font-extrabold text-white tracking-tighter mb-4 drop-shadow-2xl relative z-10">
            Market <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Hub</span>
         </h1>
         <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed font-light tracking-wide relative z-10">
            Real-time intelligence dashboard. Monitor momentum, institutional flow, and macro catalysts in one view.
         </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buttons.map(btn => (
          <button
            key={btn.id}
            onClick={() => setActiveSection(btn.id)}
            className={`group relative h-48 rounded-[2rem] overflow-hidden bg-gray-900 border border-white/5 hover:border-white/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${btn.shadow}`}
          >
            {/* Background Gradient on Hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${btn.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
            
            {/* Glow Effect */}
            <div className={`absolute -right-12 -bottom-12 w-40 h-40 bg-gradient-to-br ${btn.color} blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>

            <div className="relative z-10 p-8 h-full flex flex-col justify-between items-start">
               <div className="flex justify-between w-full items-start">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg bg-gradient-to-br ${btn.color} text-white border border-white/10 group-hover:scale-110 transition-transform duration-500`}>
                     {btn.icon}
                  </div>
                  {btn.badge && (
                     <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black/40 text-white border border-white/10 tracking-widest backdrop-blur-sm">
                        {btn.badge}
                     </span>
                  )}
               </div>

               <div>
                  <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-white transition-colors tracking-tight">{btn.title}</h3>
                  <p className="text-sm text-gray-500 font-medium group-hover:text-gray-300 transition-colors uppercase tracking-wider">{btn.subtitle}</p>
               </div>
            </div>
            
            {/* Arrow Icon */}
            <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
               <div className="p-2 rounded-full bg-white/10 backdrop-blur-md">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                 </svg>
               </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MarketOverview;
