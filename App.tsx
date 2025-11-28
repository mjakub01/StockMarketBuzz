
import React, { useState, useEffect } from 'react';
import DashboardLayout from './components/DashboardLayout';
import MomentumScanner from './components/MomentumScanner';
import EarningsScanner from './components/EarningsScanner';
import MarketMoversScanner from './components/MarketMoversScanner';
import OversoldScanner from './components/OversoldScanner';
import HeatmapScanner from './components/HeatmapScanner';
import InsiderScanner from './components/InsiderScanner';
import WatchlistView from './components/WatchlistView';
import NewsFeed from './components/NewsFeed';
import MarketOverview from './components/MarketOverview';
import ThemeSettings from './components/ThemeSettings';
import { Watchlist } from './types';
import { GlobalRefreshProvider } from './contexts/GlobalRefreshContext';
import { ThemeProvider } from './contexts/ThemeContext';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('scanner');
  
  // Multi-Watchlist State
  const [watchlists, setWatchlists] = useState<Watchlist[]>([
    { id: 'default', name: 'Main Watchlist', tickers: [] }
  ]);
  const [activeWatchlistId, setActiveWatchlistId] = useState<string>('default');

  // Load Watchlists from local storage with Migration Logic
  useEffect(() => {
    const savedLists = localStorage.getItem('myWatchlists');
    if (savedLists) {
      try {
        const parsed = JSON.parse(savedLists);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWatchlists(parsed);
          setActiveWatchlistId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed to parse watchlists", e);
      }
    } else {
      const oldList = localStorage.getItem('myWatchlist');
      if (oldList) {
        try {
          const tickers = JSON.parse(oldList);
          if (Array.isArray(tickers) && tickers.length > 0) {
            const migratedList: Watchlist = {
              id: 'migrated',
              name: 'Imported Legacy',
              tickers: tickers
            };
            setWatchlists([migratedList]);
            setActiveWatchlistId('migrated');
          }
        } catch (e) {
           console.error("Failed to migrate legacy watchlist", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('myWatchlists', JSON.stringify(watchlists));
  }, [watchlists]);

  const getAllTickers = () => {
    const all = new Set<string>();
    watchlists.forEach(w => w.tickers.forEach(t => all.add(t)));
    return Array.from(all);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'scanner':
        return <MomentumScanner />;
      case 'earnings':
        return <EarningsScanner />;
      case 'movers':
        return <MarketMoversScanner />;
      case 'oversold':
        return <OversoldScanner />;
      case 'insider':
        return <InsiderScanner />;
      case 'heatmaps':
        return <HeatmapScanner />;
      case 'watchlist':
        return (
          <WatchlistView 
            watchlists={watchlists} 
            activeWatchlistId={activeWatchlistId}
            setActiveWatchlistId={setActiveWatchlistId}
            setWatchlists={setWatchlists}
          />
        );
      case 'overview':
        return <MarketOverview />;
      case 'news':
        return <NewsFeed watchlist={getAllTickers()} />;
      case 'settings':
        return <ThemeSettings />;
      default:
        return <MomentumScanner />;
    }
  };

  return (
    <ThemeProvider>
      <GlobalRefreshProvider>
        <DashboardLayout activeView={activeView} onNavigate={setActiveView}>
          {renderContent()}
        </DashboardLayout>
      </GlobalRefreshProvider>
    </ThemeProvider>
  );
};

export default App;
