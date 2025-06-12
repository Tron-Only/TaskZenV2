
"use client";

import React, { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';

type Theme = "light" | "dark";

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: (event?: React.MouseEvent) => void;
}

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
  toggleTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "ui-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedTheme = localStorage.getItem(storageKey) as Theme | null;
        return storedTheme || defaultTheme;
      } catch (e) {
        console.error("Failed to read theme from localStorage", e);
        return defaultTheme;
      }
    }
    return defaultTheme;
  });

  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [overlayTheme, setOverlayTheme] = useState<Theme>(theme);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    try {
      localStorage.setItem(storageKey, theme);
    } catch (e) {
      console.error("Failed to save theme to localStorage", e);
    }
  }, [theme, storageKey]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = useCallback((event?: React.MouseEvent) => {
    const newTheme = theme === "light" ? "dark" : "light";
    // Always attempt custom animation if event is provided
    if (event && typeof window !== 'undefined') {
      setClickPosition({ x: event.clientX, y: event.clientY });
      setOverlayTheme(newTheme);
      setIsAnimating(true);
      setThemeState(newTheme);
    } else {
      setThemeState(newTheme); // Fallback for no event (e.g., programmatic change)
    }
  }, [theme]);

  const handleAnimationEnd = () => {
    setIsAnimating(false);
    setClickPosition(null);
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
      {isAnimating && clickPosition && (
        <div
          className={`theme-transition-overlay radial-reveal ${overlayTheme === 'dark' ? 'overlay-bg-dark' : 'overlay-bg-light'}`}
          style={{
            '--click-x': `${clickPosition.x}px`,
            '--click-y': `${clickPosition.y}px`,
          } as React.CSSProperties}
          onAnimationEnd={handleAnimationEnd}
        />
      )}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

