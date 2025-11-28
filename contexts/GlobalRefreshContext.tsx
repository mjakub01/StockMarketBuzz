
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface GlobalRefreshContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
  isAutoRefresh: boolean;
  toggleAutoRefresh: (value: boolean) => void;
  refreshInterval: number;
  setRefreshInterval: (ms: number) => void;
  lastUpdated: Date | null;
}

const GlobalRefreshContext = createContext<GlobalRefreshContextType | undefined>(undefined);

export const useGlobalRefresh = () => {
  const context = useContext(GlobalRefreshContext);
  if (!context) {
    throw new Error('useGlobalRefresh must be used within a GlobalRefreshProvider');
  }
  return context;
};

export const GlobalRefreshProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(15000); // Default 15s
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    setLastUpdated(new Date());
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isAutoRefresh) {
      intervalId = setInterval(() => {
        triggerRefresh();
      }, refreshInterval);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAutoRefresh, refreshInterval]);

  return (
    <GlobalRefreshContext.Provider 
      value={{ 
        refreshTrigger, 
        triggerRefresh, 
        isAutoRefresh, 
        toggleAutoRefresh: setIsAutoRefresh,
        refreshInterval,
        setRefreshInterval,
        lastUpdated
      }}
    >
      {children}
    </GlobalRefreshContext.Provider>
  );
};
