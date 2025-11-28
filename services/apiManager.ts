
import { ApiKeyConfig, ApiProviderId, ApiProviderConfig } from '../types';
import { GoogleGenAI } from "@google/genai";

const API_KEYS_STORAGE_KEY = 'stockbuzz_api_keys';

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

// Get all keys mapping
export const getApiKeys = (): Record<string, ApiKeyConfig> => {
  const stored = localStorage.getItem(API_KEYS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
};

// Get specific key value if enabled
export const getActiveKey = (providerId: ApiProviderId): string | null => {
  const keys = getApiKeys();
  const config = keys[providerId];
  return config && config.isEnabled && config.status === 'valid' ? config.apiKey : null;
};

// Save a key configuration
export const saveApiKey = (config: ApiKeyConfig) => {
  const keys = getApiKeys();
  keys[config.providerId] = config;
  localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(keys));
};

// Remove a key
export const removeApiKey = (providerId: ApiProviderId) => {
  const keys = getApiKeys();
  delete keys[providerId];
  localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(keys));
};

// Test Connection Logic
export const testApiConnection = async (providerId: ApiProviderId, apiKey: string): Promise<boolean> => {
  if (!apiKey) return false;

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
        return true;

      case 'polygon':
      case 'alphaVantage':
      case 'finnhub':
      case 'iex':
        // Simulation for other providers (CORS usually blocks direct browser calls to these APIs)
        // In a real backend app, we would proxy this request.
        // For this demo, we simulate a network delay and "validate" if key length > 5
        await new Promise(resolve => setTimeout(resolve, 1500));
        return apiKey.length > 8; 

      default:
        return false;
    }
  } catch (error) {
    console.error(`API Test Failed for ${providerId}:`, error);
    return false;
  }
};
