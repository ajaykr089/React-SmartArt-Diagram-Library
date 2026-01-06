import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DiagramTheme } from '../types/diagram';
import { defaultTheme } from './default';
import { darkTheme } from './dark';
import { corporateTheme } from './corporate';

export interface ThemeContextType {
  theme: DiagramTheme;
  setTheme: (themeName: 'default' | 'dark' | 'corporate') => void;
  availableThemes: Record<string, DiagramTheme>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themes = {
  default: defaultTheme,
  dark: darkTheme,
  corporate: corporateTheme
};

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: 'default' | 'dark' | 'corporate';
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = 'default'
}) => {
  const [currentTheme, setCurrentTheme] = useState<DiagramTheme>(themes[initialTheme]);

  const setTheme = (themeName: 'default' | 'dark' | 'corporate') => {
    setCurrentTheme(themes[themeName]);
  };

  // Apply theme to CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    const { colors, spacing, typography } = currentTheme;

    // Set CSS custom properties for theme colors
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
    });

    // Set spacing properties
    Object.entries(spacing).forEach(([key, value]) => {
      root.style.setProperty(`--theme-spacing-${key}`, `${value}px`);
    });

    // Set typography properties
    root.style.setProperty('--theme-font-family', typography.fontFamily);
    Object.entries(typography.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--theme-font-size-${key}`, `${value}px`);
    });
    Object.entries(typography.fontWeight).forEach(([key, value]) => {
      root.style.setProperty(`--theme-font-weight-${key}`, value.toString());
    });

    // Store theme preference in localStorage
    localStorage.setItem('smart-diagram-theme', currentTheme.name);
  }, [currentTheme]);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('smart-diagram-theme') as keyof typeof themes;
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(themes[savedTheme]);
    }
  }, []);

  const contextValue: ThemeContextType = {
    theme: currentTheme,
    setTheme,
    availableThemes: themes
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme selector component
export const ThemeSelector: React.FC = () => {
  const { theme, setTheme, availableThemes } = useTheme();

  return (
    <select
      value={theme.name}
      onChange={(e) => setTheme(e.target.value as 'default' | 'dark' | 'corporate')}
      style={{
        padding: '4px 8px',
        border: '1px solid var(--theme-border)',
        borderRadius: '4px',
        backgroundColor: 'var(--theme-surface)',
        color: 'var(--theme-text)',
        fontSize: '14px'
      }}
    >
      {Object.keys(availableThemes).map((themeName) => (
        <option key={themeName} value={themeName}>
          {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
        </option>
      ))}
    </select>
  );
};
