import React, { createContext, useContext, useState, ReactNode } from 'react';
import { StockAnalysisFull } from '../types';
import { analyzeStockFull, clearCache } from '../services/geminiService';

interface StockAnalysisContextType {
  activeTicker: string | null;
  analysisData: StockAnalysisFull | null;
  isLoading: boolean;
  lastUpdated: Date | null;
  loadStock: (ticker: string, force?: boolean) => Promise<void>;
  clearStock: () => void;
}

const StockAnalysisContext = createContext<StockAnalysisContextType | undefined>(undefined);

export const useStockAnalysis = () => {
  const context = useContext(StockAnalysisContext);
  if (!context) {
    throw new Error('useStockAnalysis must be used within a StockAnalysisProvider');
  }
  return context;
};

export const StockAnalysisProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTicker, setActiveTicker] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<StockAnalysisFull | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadStock = async (ticker: string, force = false) => {
    // Optimistic update: if we are requesting the same ticker and it's loading, ignore
    if (ticker === activeTicker && isLoading) return;

    setActiveTicker(ticker);
    setIsLoading(true);
    
    // Clear specific cache if forcing refresh
    if (force) {
        clearCache(`analysis_${ticker}`);
    }

    try {
      const data = await analyzeStockFull(ticker, force);
      setAnalysisData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load stock analysis", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearStock = () => {
    setActiveTicker(null);
    setAnalysisData(null);
    setLastUpdated(null);
  };

  return (
    <StockAnalysisContext.Provider value={{ activeTicker, analysisData, isLoading, lastUpdated, loadStock, clearStock }}>
      {children}
    </StockAnalysisContext.Provider>
  );
};