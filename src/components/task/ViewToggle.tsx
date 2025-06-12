"use client";

import { Button } from "@/components/ui/button";
import { List, LayoutGrid } from "lucide-react";
import type { ViewMode } from "@/app/page"; // Assuming ViewMode type is exported from page.tsx

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center space-x-1 rounded-md bg-muted p-0.5">
      <Button
        variant={currentView === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("list")}
        className={`px-3 py-1.5 h-auto transition-colors ${currentView === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:bg-background/50'}`}
        aria-pressed={currentView === 'list'}
      >
        <List size={16} className="mr-2" />
        List
      </Button>
      <Button
        variant={currentView === "kanban" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("kanban")}
        className={`px-3 py-1.5 h-auto transition-colors ${currentView === 'kanban' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:bg-background/50'}`}
        aria-pressed={currentView === 'kanban'}
      >
        <LayoutGrid size={16} className="mr-2" />
        Kanban
      </Button>
    </div>
  );
}
