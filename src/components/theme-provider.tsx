
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
  isAnimating: boolean;
}

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
  toggleTheme: () => null,
  isAnimating: false,
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
  const [pendingTheme, setPendingTheme] = useState<Theme | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !theme) return;

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
    // This function is for programmatic theme changes without animation
    setThemeState(newTheme);
    setOverlayTheme(newTheme); // Keep overlayTheme in sync
    if (isAnimating) { // If an animation was running, cancel it
        setIsAnimating(false);
        setPendingTheme(null);
    }
  };

  const toggleTheme = useCallback((event?: React.MouseEvent) => {
    if (isAnimating) return; // Prevent starting a new animation if one is in progress

    const newThemeToSet = pendingTheme ? (pendingTheme === "light" ? "dark" : "light") : (theme === "light" ? "dark" : "light");

    if (event && typeof window !== 'undefined') {
      setClickPosition({ x: event.clientX, y: event.clientY });
      setPendingTheme(newThemeToSet);
      setOverlayTheme(newThemeToSet); // Overlay gets the color of the theme it's transitioning TO
      setIsAnimating(true);
      // Actual theme (on <html>) change is deferred to handleAnimationEnd
    } else {
      // Programmatic change or no event, no animation
      setThemeState(newThemeToSet);
      setOverlayTheme(newThemeToSet);
    }
  }, [theme, isAnimating, pendingTheme]);

  const handleAnimationEnd = () => {
    if (pendingTheme) {
      setThemeState(pendingTheme); // Apply the theme to <html>
      setPendingTheme(null);
    }
    setIsAnimating(false);
    setClickPosition(null); // Reset click position
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isAnimating,
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
