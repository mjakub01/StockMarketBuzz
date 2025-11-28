
import React, { createContext, useContext, useState, ReactNode } from 'react';

type ViewType = 'overview' | 'scanner' | 'earnings' | 'movers' | 'oversold' | 'insider' | 'heatmaps' | 'watchlist' | 'news' | 'settings';

interface NavigationContextType {
  activeView: string;
  currentTicker: string | null;
  navigate: (view: string) => void;
  goToStockAnalysis: (ticker: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<string>('overview');
  const [currentTicker, setCurrentTicker] = useState<string | null>(null);

  const navigate = (view: string) => {
    setActiveView(view);
    // Optional: Clear ticker if navigating away from watchlist? 
    // Keeping it allows "going back" to the last analyzed stock easily.
  };

  const goToStockAnalysis = (ticker: string) => {
    setCurrentTicker(ticker);
    setActiveView('watchlist'); // 'watchlist' is the ID for the Stock Analysis view
  };

  return (
    <NavigationContext.Provider value={{ activeView, currentTicker, navigate, goToStockAnalysis }}>
      {children}
    </NavigationContext.Provider>
  );
};
