'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import type { Theme } from '@/types';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = 'sequenzia-theme';
const HIGH_CONTRAST_STORAGE_KEY = 'sequenzia-high-contrast';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = THEME_STORAGE_KEY,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [highContrast, setHighContrastState] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Get system preference
  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }, []);

  // Resolve theme (handle 'system' option)
  const resolveTheme = useCallback(
    (t: Theme): 'light' | 'dark' => {
      if (t === 'system') {
        return getSystemTheme();
      }
      return t;
    },
    [getSystemTheme]
  );

  // Apply theme to document
  const applyTheme = useCallback(
    (resolved: 'light' | 'dark', contrast: boolean) => {
      const root = document.documentElement;

      // Remove existing theme classes
      root.classList.remove('light', 'dark', 'high-contrast');

      // Add new theme class
      root.classList.add(resolved);

      // Add high contrast if enabled
      if (contrast) {
        root.classList.add('high-contrast');
      }

      // Update color-scheme for native elements
      root.style.colorScheme = resolved;
    },
    []
  );

  // Initialize from storage
  useEffect(() => {
    const storedTheme = localStorage.getItem(storageKey) as Theme | null;
    const storedContrast = localStorage.getItem(HIGH_CONTRAST_STORAGE_KEY);

    const initialTheme = storedTheme || defaultTheme;
    const initialContrast = storedContrast === 'true';

    setThemeState(initialTheme);
    setHighContrastState(initialContrast);

    const resolved = resolveTheme(initialTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved, initialContrast);

    setMounted(true);
  }, [defaultTheme, storageKey, resolveTheme, applyTheme]);

  // Listen for system preference changes
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (theme === 'system') {
        const resolved = getSystemTheme();
        setResolvedTheme(resolved);
        applyTheme(resolved, highContrast);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, highContrast, mounted, getSystemTheme, applyTheme]);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      localStorage.setItem(storageKey, newTheme);

      const resolved = resolveTheme(newTheme);
      setResolvedTheme(resolved);
      applyTheme(resolved, highContrast);
    },
    [storageKey, resolveTheme, highContrast, applyTheme]
  );

  const setHighContrast = useCallback(
    (enabled: boolean) => {
      setHighContrastState(enabled);
      localStorage.setItem(HIGH_CONTRAST_STORAGE_KEY, String(enabled));
      applyTheme(resolvedTheme, enabled);
    },
    [resolvedTheme, applyTheme]
  );

  // Prevent flash of incorrect theme
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        highContrast,
        setHighContrast,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
