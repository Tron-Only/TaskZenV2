"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownWideNarrow, ArrowUpWideNarrow } from "lucide-react";
import type { SortConfig } from "@/app/page"; 

interface SortControlsProps {
  sortConfig: SortConfig;
  onSortChange: (newSortConfig: SortConfig) => void;
}

export function SortControls({ sortConfig, onSortChange }: SortControlsProps) {
  const handleSortKeyChange = (key: "priority" | "createdAt") => {
    onSortChange({ ...sortConfig, key });
  };

  const toggleSortDirection = () => {
    onSortChange({ ...sortConfig, direction: sortConfig.direction === "asc" ? "desc" : "asc" });
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground">Sort by:</span>
      <Select
        value={sortConfig.key}
        onValueChange={(value) => handleSortKeyChange(value as SortConfig['key'])}
      >
        <SelectTrigger className="w-[150px] h-9">
          <SelectValue placeholder="Select field" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="priority">Priority</SelectItem>
          <SelectItem value="createdAt">Created Date</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" size="icon" onClick={toggleSortDirection} className="h-9 w-9" aria-label="Toggle sort direction">
        {sortConfig.direction === "asc" ? <ArrowUpWideNarrow size={16} /> : <ArrowDownWideNarrow size={16} />}
      </Button>
    </div>
  );
}
