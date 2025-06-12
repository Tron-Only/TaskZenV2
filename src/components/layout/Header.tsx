
"use client";

import { ListChecks, Sun, Moon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useState, useEffect } from 'react';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeToggle = (event: React.MouseEvent) => {
    toggleTheme(event);
  };

  return (
    <header className="bg-card border-b shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <ListChecks className="h-8 w-8 text-primary mr-3" />
          <h1 className="text-3xl font-headline font-bold text-primary">TaskZen</h1>
        </div>
        <Button variant="outline" size="icon" onClick={handleThemeToggle} aria-label="Toggle theme">
          {mounted ? (
            theme === 'light' ? (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Sun className="h-[1.2rem] w-[1.2rem] fill-current" />
            )
          ) : (
            // Render a placeholder or null during server render and initial client render before mount
            <div className="h-[1.2rem] w-[1.2rem]" /> // Simple placeholder to maintain layout
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </header>
  );
}
