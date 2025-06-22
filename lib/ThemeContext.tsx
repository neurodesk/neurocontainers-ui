"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  getThemeColors, 
  getThemeComponents, 
  getThemePresets, 
  getThemeTypography 
} from './theme';

// Theme types
export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  // Current theme state
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  
  // Theme setters
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  
  // Theme-aware style getters
  colors: ReturnType<typeof getThemeColors>;
  components: ReturnType<typeof getThemeComponents>;
  presets: ReturnType<typeof getThemePresets>;
  typography: ReturnType<typeof getThemeTypography>;
  
  // Utility flags
  isDark: boolean;
  isSystemTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({ 
  children, 
  defaultTheme = 'system',
  storageKey = 'neurocontainers-theme'
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [mounted, setMounted] = useState(false);

  // Determine the resolved theme based on current theme and system preference
  const getResolvedTheme = (currentTheme: Theme): ResolvedTheme => {
    if (currentTheme === 'system') {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'light';
    }
    return currentTheme;
  };

  // Update resolved theme when theme changes
  useEffect(() => {
    const resolved = getResolvedTheme(theme);
    setResolvedTheme(resolved);
    
    // Apply theme to document
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(resolved);
      root.setAttribute('data-theme', resolved);
    }
  }, [theme]);

  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored && ['light', 'dark', 'system'].includes(stored)) {
          setThemeState(stored as Theme);
        }
      } catch (error) {
        console.warn('Failed to load theme from localStorage:', error);
      }
      setMounted(true);
    }
  }, [storageKey]);

  // Listen for system theme changes when using system theme
  useEffect(() => {
    if (theme === 'system' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = () => {
        const resolved = getResolvedTheme('system');
        setResolvedTheme(resolved);
        
        // Apply theme to document
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(resolved);
        root.setAttribute('data-theme', resolved);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  // Save theme to localStorage
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch (error) {
        console.warn('Failed to save theme to localStorage:', error);
      }
    }
  };

  // Toggle between light and dark (system becomes light if currently dark, dark if currently light)
  const toggleTheme = () => {
    if (theme === 'system') {
      const currentResolved = getResolvedTheme('system');
      setTheme(currentResolved === 'dark' ? 'light' : 'dark');
    } else {
      setTheme(theme === 'light' ? 'dark' : 'light');
    }
  };

  // Get theme-aware styles
  const isDark = resolvedTheme === 'dark';
  const colors = getThemeColors(isDark);
  const components = getThemeComponents(isDark);
  const presets = getThemePresets(isDark);
  const typography = getThemeTypography(isDark);

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    colors,
    components,
    presets,
    typography,
    isDark,
    isSystemTheme: theme === 'system',
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{
        ...value,
        resolvedTheme: 'light', // Default to light during SSR
        isDark: false,
        colors: getThemeColors(false),
        components: getThemeComponents(false),
        presets: getThemePresets(false),
        typography: getThemeTypography(false),
      }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook for theme-aware class names
export function useThemeClass() {
  const { isDark, components, presets, colors, typography } = useTheme();
  
  return {
    isDark,
    colors,
    components,
    presets,
    typography,
    // Convenience methods for common patterns
    getInputClass: () => presets.input,
    getButtonClass: (variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'primary') => {
      switch (variant) {
        case 'primary': return presets.buttonPrimary;
        case 'secondary': return presets.buttonSecondary;
        case 'ghost': return presets.buttonIcon;
        case 'danger': return presets.buttonDanger;
        default: return presets.buttonPrimary;
      }
    },
    getCardClass: () => presets.card,
    getTextClass: (variant: 'primary' | 'secondary' | 'muted' = 'primary') => {
      return typography.color[variant];
    },
  };
}