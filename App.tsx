
import React, { useState } from 'react';
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
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SystemProvider } from './contexts/SystemContext';
import { StockAnalysisProvider } from './contexts/StockAnalysisContext';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';

// Main Content Component
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
    <DashboardLayout>
      {renderContent()}
    </DashboardLayout>
  );
};

// Auth Wrapper Component
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);

  if (isLoading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;

  if (!isAuthenticated) {
    if (isRegistering) {
      return <RegisterPage onSwitchToLogin={() => setIsRegistering(false)} />;
    }
    return <LoginPage onSwitchToRegister={() => setIsRegistering(true)} />;
  }

  return (
    <NavigationProvider>
      <StockAnalysisProvider>
        <ThemeProvider>
           <MainAppContent />
        </ThemeProvider>
      </StockAnalysisProvider>
    </NavigationProvider>
  );
};

const App: React.FC = () => {
  return (
    <SystemProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SystemProvider>
  );
};

export default App;
