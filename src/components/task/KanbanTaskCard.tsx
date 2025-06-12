"use client";

import type { Task } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, MoreVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PriorityIcon } from "./PriorityIcon";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface KanbanTaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  isDragging?: boolean;
}

export function KanbanTaskCard({ task, onEdit, onDelete, isDragging }: KanbanTaskCardProps) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("taskId", task.id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <Card 
      draggable 
      onDragStart={handleDragStart}
      className={cn(
        "mb-3 cursor-grab active:cursor-grabbing transition-shadow duration-200 hover:shadow-md",
        isDragging && "opacity-50 shadow-xl scale-105",
        task.status === "Done" && "bg-muted/30"
      )}
    >
      <CardHeader className="p-3 pb-2 relative">
        <CardTitle className="text-base leading-tight mb-1">{task.title}</CardTitle>
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit2 size={14} className="mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <Trash2 size={14} className="mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {task.description && (
          <CardDescription className="text-xs line-clamp-2">{task.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-3 pt-1 space-y-2">
        <div className="flex items-center space-x-2">
          <PriorityIcon priority={task.priority} iconProps={{size: 14}} />
          <Badge variant={task.priority === "High" ? "destructive" : task.priority === "Medium" ? "secondary" : "outline"} className="capitalize text-xs px-1.5 py-0.5">
            {task.priority}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground pt-1">
            {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
        </div>
      </CardContent>
    </Card>
  );
}
