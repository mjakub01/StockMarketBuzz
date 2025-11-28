
import React, { createContext, ReactNode } from 'react';

// Context is now empty/unused as requested
const GlobalRefreshContext = createContext<any>(undefined);

export const useGlobalRefresh = () => {
  return { 
    refreshTrigger: 0,
    triggerRefresh: () => {}, 
    isAutoRefresh: false, 
    toggleAutoRefresh: () => {},
    refreshInterval: 0,
    setRefreshInterval: () => {},
    lastUpdated: null
  };
};

export const GlobalRefreshProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <GlobalRefreshContext.Provider value={{}}>
      {children}
    </GlobalRefreshContext.Provider>
  );
};
