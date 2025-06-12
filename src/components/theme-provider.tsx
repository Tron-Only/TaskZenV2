
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
    if (event && typeof window !== 'undefined' && 'startViewTransition' in document) {
      setClickPosition({ x: event.clientX, y: event.clientY });
      setOverlayTheme(newTheme); // Set overlay to the theme we are transitioning TO
      setIsAnimating(true);
      // The actual theme change (and class on <html>) will happen after the animation starts
      // or can be deferred slightly for the overlay to pick up the *old* theme's styles if needed.
      // For simplicity, we change it immediately and the overlay will pick up the new theme's bg.
      setThemeState(newTheme);
    } else {
      setThemeState(newTheme); // Fallback for no event or no View Transitions API
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
          className={`theme-transition-overlay radial-reveal bg-background`}
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
