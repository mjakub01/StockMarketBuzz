
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeSettings, ThemeMode, UI_Density, CornerStyle, AnimationSpeed, FontFamily } from '../types';
import { useAuth } from './AuthContext';

const defaultSettings: ThemeSettings = {
  mode: 'dark',
  accentColor: '#1E88E5',
  density: 'comfort',
  fontFamily: 'Inter',
  fontSize: 'medium',
  cornerStyle: 'rounded',
  animationSpeed: 'smooth',
};

interface ThemeContextType {
  settings: ThemeSettings;
  updateSetting: <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // Storage key is dynamic based on logged-in user
  const storageKey = user ? `user_${user.id}_theme` : 'appThemeSettings_guest';

  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);

  // Load settings when User changes
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setSettings(JSON.parse(saved));
    } else {
      setSettings(defaultSettings);
    }
  }, [storageKey]);

  // Save settings when they change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(settings));
    applyThemeVariables(settings);
  }, [settings, storageKey]);

  // Apply CSS Variables
  const applyThemeVariables = (s: ThemeSettings) => {
    const root = document.documentElement;

    // 1. Theme Mode
    let bgMain, bgCard, textPrimary, textSecondary, border, glassOpacity;
    let effectiveMode = s.mode;
    if (s.mode === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveMode = prefersDark ? 'dark' : 'light';
    }

    switch (effectiveMode) {
      case 'light':
        bgMain = '#f3f4f6'; bgCard = '#ffffff'; textPrimary = '#111827'; textSecondary = '#4b5563'; border = '#e5e7eb'; glassOpacity = '0.7'; break;
      case 'amoled':
        bgMain = '#000000'; bgCard = '#121212'; textPrimary = '#ffffff'; textSecondary = '#9ca3af'; border = '#27272a'; glassOpacity = '0.3'; break;
      case 'dark':
      default:
        bgMain = '#0d1117'; bgCard = '#1f2937'; textPrimary = '#f3f4f6'; textSecondary = '#9ca3af'; border = '#374151'; glassOpacity = '0.5'; break;
    }

    root.style.setProperty('--bg-main', bgMain);
    root.style.setProperty('--bg-card', bgCard);
    root.style.setProperty('--text-primary', textPrimary);
    root.style.setProperty('--text-secondary', textSecondary);
    root.style.setProperty('--border-color', border);
    root.style.setProperty('--glass-opacity', glassOpacity);
    root.style.setProperty('--accent-color', s.accentColor);
    root.style.setProperty('--accent-glow', `${s.accentColor}40`);

    // Spacing
    let spacingUnit, paddingUnit, gapUnit;
    switch (s.density) {
      case 'compact': spacingUnit = '0.75rem'; paddingUnit = '0.5rem'; gapUnit = '0.5rem'; break;
      case 'expanded': spacingUnit = '1.5rem'; paddingUnit = '1.25rem'; gapUnit = '1.25rem'; break;
      case 'comfort': default: spacingUnit = '1rem'; paddingUnit = '1rem'; gapUnit = '1rem'; break;
    }
    root.style.setProperty('--spacing-unit', spacingUnit);
    root.style.setProperty('--padding-unit', paddingUnit);
    root.style.setProperty('--gap-unit', gapUnit);

    // Fonts
    root.style.setProperty('--font-family', s.fontFamily);
    let baseSize;
    switch (s.fontSize) {
      case 'small': baseSize = '14px'; break;
      case 'large': baseSize = '18px'; break;
      case 'xl': baseSize = '20px'; break;
      case 'medium': default: baseSize = '16px'; break;
    }
    root.style.setProperty('--base-font-size', baseSize);

    // Border Radius
    let radius;
    switch (s.cornerStyle) {
        case 'sharp': radius = '0px'; break;
        case 'extra-rounded': radius = '24px'; break;
        case 'glass': radius = '16px'; break;
        case 'rounded': default: radius = '12px'; break;
    }
    root.style.setProperty('--border-radius', radius);

    // Animation
    let duration;
    switch (s.animationSpeed) {
        case 'fast': duration = '100ms'; break;
        case 'reduced': duration = '0ms'; break;
        case 'smooth': default: duration = '300ms'; break;
    }
    root.style.setProperty('--transition-speed', duration);
  };

  const updateSetting = <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetTheme = () => {
    setSettings(defaultSettings);
  };

  return (
    <ThemeContext.Provider value={{ settings, updateSetting, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
