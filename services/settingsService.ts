
import { FeatureFlags } from '../types';

const SETTINGS_KEY = 'stockbuzz_system_settings';

const defaultFlags: FeatureFlags = {
  enableMomentum: true,
  enableEarnings: true,
  enableMovers: true,
  enableOversold: true,
  enableInsider: true,
  enableHeatmaps: true,
  enableNews: true,
  enableGlobalRefresh: true,
  enableCrypto: true,
};

export const getSystemSettings = (): FeatureFlags => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) {
    try {
      return { ...defaultFlags, ...JSON.parse(stored) };
    } catch (e) {
      console.error("Failed to parse system settings", e);
    }
  }
  return defaultFlags;
};

export const updateSystemSettings = (settings: FeatureFlags): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};
