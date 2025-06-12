
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
  toggleTheme: () => void;
  isIconAnimating: boolean;
}

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
  toggleTheme: () => null,
  isIconAnimating: false,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

const ICON_ANIMATION_DURATION = 500; // ms, should match CSS animation

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

  const [isIconAnimating, setIsIconAnimating] = useState(false);
  const animationTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

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
    setThemeState(newTheme);
  };

  const toggleTheme = useCallback(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    setIsIconAnimating(true);
    setThemeState((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    animationTimeoutRef.current = setTimeout(() => {
      setIsIconAnimating(false);
    }, ICON_ANIMATION_DURATION);
  }, []);
  

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isIconAnimating,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
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
