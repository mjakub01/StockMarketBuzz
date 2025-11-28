
import React from 'react';
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
import SettingsDashboard from './components/SettingsDashboard';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { SystemProvider } from './contexts/SystemContext';
import { StockAnalysisProvider } from './contexts/StockAnalysisContext';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';

// Main Content Component separate from Providers to use hooks
const MainAppContent: React.FC = () => {
  const { activeView, currentTicker, goToStockAnalysis } = useNavigation();

  const renderContent = () => {
    switch (activeView) {
      case 'overview': return <MarketOverview />;
      case 'scanner': return <MomentumScanner />;
      case 'earnings': return <EarningsScanner />;
      case 'movers': return <MarketMoversScanner />;
      case 'oversold': return <OversoldScanner />;
      case 'insider': return <InsiderScanner />;
      case 'heatmaps': return <HeatmapScanner />;
      case 'watchlist': 
        return (
          <WatchlistView 
            currentTicker={currentTicker}
            onTickerChange={goToStockAnalysis}
          />
        );
      case 'news': return <NewsFeed watchlist={currentTicker ? [currentTicker] : []} />;
      case 'settings': return <SettingsDashboard />;
      default: return <MarketOverview />;
    }
  };

  return (
    <ThemeProvider>
        <DashboardLayout>
          {renderContent()}
        </DashboardLayout>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <SystemProvider>
      <AuthProvider>
        <NavigationProvider>
          <StockAnalysisProvider>
            <MainAppContent />
          </StockAnalysisProvider>
        </NavigationProvider>
      </AuthProvider>
    </SystemProvider>
  );
};

export default App;
