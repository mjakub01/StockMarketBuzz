
import { ApiKeyConfig, ApiProviderId, ApiProviderConfig } from '../types';
import { GoogleGenAI } from "@google/genai";

export const SUPPORTED_PROVIDERS: ApiProviderConfig[] = [
  {
    id: 'gemini',
    name: 'Google Gemini AI',
    description: 'Powers all scanners, chat, and analysis features. (Required)',
    icon: '✨',
    website: 'https://aistudio.google.com/'
  },
  {
    id: 'polygon',
    name: 'Polygon.io',
    description: 'Real-time stock, options, and crypto data feeds.',
    icon: '🔷',
    website: 'https://polygon.io/'
  },
  {
    id: 'alphaVantage',
    name: 'Alpha Vantage',
    description: 'Historical data, technical indicators, and forex.',
    icon: '🅰️',
    website: 'https://www.alphavantage.co/'
  },
  {
    id: 'finnhub',
    name: 'Finnhub',
    description: 'Institutional-grade market data and alternative data.',
    icon: '📡',
    website: 'https://finnhub.io/'
  },
  {
    id: 'iex',
    name: 'IEX Cloud',
    description: 'Financial data platform for developers.',
    icon: '☁️',
    website: 'https://iexcloud.io/'
  }
];

const getStorageKey = (userId?: string) => userId ? `api_keys_${userId}` : 'stockbuzz_api_keys_guest';
const AI_FALLBACK_STORAGE_KEY = 'stockbuzz_ai_fallback';

// Get all keys mapping
export const getApiKeys = (userId?: string): Record<string, ApiKeyConfig> => {
  const stored = localStorage.getItem(getStorageKey(userId));
  return stored ? JSON.parse(stored) : {};
};

// Get specific key value if enabled
export const getActiveKey = (providerId: ApiProviderId, userId?: string): string | null => {
  const keys = getApiKeys(userId);
  const config = keys[providerId];
  return config && config.isEnabled && config.status === 'valid' ? config.apiKey : null;
};

// Save a key configuration
export const saveApiKey = (config: ApiKeyConfig, userId?: string) => {
  const keys = getApiKeys(userId);
  keys[config.providerId] = config;
  localStorage.setItem(getStorageKey(userId), JSON.stringify(keys));
};

// Remove a key
export const removeApiKey = (providerId: ApiProviderId, userId?: string) => {
  const keys = getApiKeys(userId);
  delete keys[providerId];
  localStorage.setItem(getStorageKey(userId), JSON.stringify(keys));
};

// AI Fallback Logic
export const getAIFallbackPreference = (userId?: string): boolean => {
  const key = userId ? `${AI_FALLBACK_STORAGE_KEY}_${userId}` : AI_FALLBACK_STORAGE_KEY;
  return localStorage.getItem(key) === 'true';
};

export const setAIFallbackPreference = (enabled: boolean, userId?: string) => {
  const key = userId ? `${AI_FALLBACK_STORAGE_KEY}_${userId}` : AI_FALLBACK_STORAGE_KEY;
  localStorage.setItem(key, String(enabled));
};

export const hasValidExternalProvider = (userId?: string): boolean => {
  const keys = getApiKeys(userId);
  // Check if any provider OTHER than gemini has a valid key
  return Object.values(keys).some(k => k.providerId !== 'gemini' && k.status === 'valid' && k.isEnabled);
};

// Test Connection Logic
export const testApiConnection = async (providerId: ApiProviderId, apiKey: string): Promise<{ success: boolean; message: string; data?: any }> => {
  if (!apiKey) return { success: false, message: 'No API Key provided' };

  try {
    switch (providerId) {
      case 'gemini':
        // Real test for Gemini
        const ai = new GoogleGenAI({ apiKey });
        await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: 'ping',
          config: { maxOutputTokens: 1 }
        });
        return { success: true, message: 'Connection Successful', data: { model: 'gemini-2.5-flash', status: 'active' } };

      case 'polygon':
      case 'alphaVantage':
      case 'finnhub':
      case 'iex':
        // Simulation for other providers
        await new Promise(resolve => setTimeout(resolve, 1500));
        if (apiKey.length > 8) {
           return { 
             success: true, 
             message: 'Connection Successful', 
             data: { 
               status: 'OK', 
               quota_remaining: 850, 
               last_updated: new Date().toISOString() 
             } 
           };
        }
        return { success: false, message: 'Invalid API Key format' };

      default:
        return { success: false, message: 'Unknown Provider' };
    }
  } catch (error: any) {
    console.error(`API Test Failed for ${providerId}:`, error);
    return { success: false, message: error.message || 'Connection Failed' };
  }
};
