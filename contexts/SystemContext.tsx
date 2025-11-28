
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FeatureFlags } from '../types';
import { getSystemSettings, updateSystemSettings } from '../services/settingsService';

interface SystemContextType {
  features: FeatureFlags;
  toggleFeature: (key: keyof FeatureFlags) => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) throw new Error('useSystem must be used within SystemProvider');
  return context;
};

export const SystemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [features, setFeatures] = useState<FeatureFlags>(getSystemSettings());

  useEffect(() => {
    // Initial load
    setFeatures(getSystemSettings());
  }, []);

  const toggleFeature = (key: keyof FeatureFlags) => {
    const updated = { ...features, [key]: !features[key] };
    setFeatures(updated);
    updateSystemSettings(updated);
  };

  return (
    <SystemContext.Provider value={{ features, toggleFeature }}>
      {children}
    </SystemContext.Provider>
  );
};
