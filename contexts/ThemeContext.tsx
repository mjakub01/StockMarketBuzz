
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeSettings, ThemeMode, UI_Density, CornerStyle, AnimationSpeed, FontFamily } from '../types';

const defaultSettings: ThemeSettings = {
  mode: 'dark',
  accentColor: '#1E88E5', // Electric Blue default
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
  // Initialize state from localStorage or defaults
  const [settings, setSettings] = useState<ThemeSettings>(() => {
    const saved = localStorage.getItem('appThemeSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('appThemeSettings', JSON.stringify(settings));
    applyThemeVariables(settings);
  }, [settings]);

  // Function to calculate and inject CSS variables
  const applyThemeVariables = (s: ThemeSettings) => {
    const root = document.documentElement;

    // 1. Theme Mode (Colors)
    let bgMain, bgCard, textPrimary, textSecondary, border, glassOpacity;
    
    // Auto detection
    let effectiveMode = s.mode;
    if (s.mode === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveMode = prefersDark ? 'dark' : 'light';
    }

    switch (effectiveMode) {
      case 'light':
        bgMain = '#f3f4f6'; // gray-100
        bgCard = '#ffffff';
        textPrimary = '#111827'; // gray-900
        textSecondary = '#4b5563'; // gray-600
        border = '#e5e7eb'; // gray-200
        glassOpacity = '0.7';
        break;
      case 'amoled':
        bgMain = '#000000';
        bgCard = '#121212'; // slightly lighter than pure black for depth
        textPrimary = '#ffffff';
        textSecondary = '#9ca3af'; // gray-400
        border = '#27272a'; // gray-800
        glassOpacity = '0.3';
        break;
      case 'dark':
      default:
        bgMain = '#0d1117'; // gray-950
        bgCard = '#1f2937'; // gray-800
        textPrimary = '#f3f4f6'; // gray-100
        textSecondary = '#9ca3af'; // gray-400
        border = '#374151'; // gray-700
        glassOpacity = '0.5';
        break;
    }

    root.style.setProperty('--bg-main', bgMain);
    root.style.setProperty('--bg-card', bgCard);
    root.style.setProperty('--text-primary', textPrimary);
    root.style.setProperty('--text-secondary', textSecondary);
    root.style.setProperty('--border-color', border);
    root.style.setProperty('--glass-opacity', glassOpacity);
    
    // 2. Accent Color
    root.style.setProperty('--accent-color', s.accentColor);
    // Create a semi-transparent version for backgrounds/glows
    // Simple hex to rgba conversion approximation or just use opacity in CSS
    root.style.setProperty('--accent-glow', `${s.accentColor}40`); // ~25% opacity

    // 3. Density (Spacing)
    let spacingUnit, paddingUnit, gapUnit;
    switch (s.density) {
      case 'compact':
        spacingUnit = '0.75rem'; // 12px
        paddingUnit = '0.5rem'; // 8px
        gapUnit = '0.5rem';
        break;
      case 'expanded':
        spacingUnit = '1.5rem'; // 24px
        paddingUnit = '1.25rem'; // 20px
        gapUnit = '1.25rem';
        break;
      case 'comfort':
      default:
        spacingUnit = '1rem'; // 16px
        paddingUnit = '1rem';
        gapUnit = '1rem';
        break;
    }
    root.style.setProperty('--spacing-unit', spacingUnit);
    root.style.setProperty('--padding-unit', paddingUnit);
    root.style.setProperty('--gap-unit', gapUnit);

    // 4. Fonts
    root.style.setProperty('--font-family', s.fontFamily);
    let baseSize;
    switch (s.fontSize) {
      case 'small': baseSize = '14px'; break;
      case 'large': baseSize = '18px'; break;
      case 'xl': baseSize = '20px'; break;
      case 'medium': default: baseSize = '16px'; break;
    }
    root.style.setProperty('--base-font-size', baseSize);

    // 5. Corner Style (Radius)
    let radius;
    switch (s.cornerStyle) {
        case 'sharp': radius = '0px'; break;
        case 'extra-rounded': radius = '24px'; break;
        case 'glass': radius = '16px'; break; // Glass usually looks good with mod radius
        case 'rounded': default: radius = '12px'; break;
    }
    root.style.setProperty('--border-radius', radius);

    // 6. Animation Speed
    let duration;
    switch (s.animationSpeed) {
        case 'fast': duration = '100ms'; break;
        case 'reduced': duration = '0ms'; break; // Effectively off
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
