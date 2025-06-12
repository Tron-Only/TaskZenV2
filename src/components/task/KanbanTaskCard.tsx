
"use client";

import type { Task } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, MoreVertical, CalendarClock } from "lucide-react";
import { format, formatDistanceToNow, isPast, isToday } from "date-fns";
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

  const isDone = task.status === "Done";

  const getDueDateColor = () => {
    if (!task.dueDate || isDone) return "text-muted-foreground";
    if (isPast(task.dueDate) && !isToday(task.dueDate)) return "text-destructive";
    if (isToday(task.dueDate)) return "text-orange-500";
    return "text-muted-foreground";
  };

  return (
    <Card 
      draggable 
      onDragStart={handleDragStart}
      className={cn(
        "mb-3 cursor-grab active:cursor-grabbing transition-shadow duration-200 hover:shadow-md",
        isDragging && "opacity-50 shadow-xl scale-105",
        isDone && "bg-muted/30 opacity-80"
      )}
    >
      <CardHeader className="p-3 pb-2 relative">
        <CardTitle className="text-base leading-tight mb-1">
          <span className={cn("strikethrough-animated", isDone && "is-done")}>
            {task.title}
          </span>
        </CardTitle>
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
          <CardDescription className="text-xs line-clamp-2">
            <span className={cn("strikethrough-animated", isDone && "is-done")}>
             {task.description}
            </span>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-3 pt-1 space-y-2">
        <div className="flex items-center space-x-2">
          <PriorityIcon priority={task.priority} iconProps={{size: 14}} />
          <Badge variant={task.priority === "High" ? "destructive" : task.priority === "Medium" ? "secondary" : "outline"} className="capitalize text-xs px-1.5 py-0.5">
            {task.priority}
          </Badge>
        </div>
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs px-1 py-0 font-normal bg-background/50">{tag}</Badge>
            ))}
          </div>
        )}
        {task.dueDate && (
          <div className={cn("text-xs flex items-center", getDueDateColor())}>
            <CalendarClock size={13} className="mr-1" />
            Due: {format(new Date(task.dueDate), "MMM d")}
            {isPast(task.dueDate) && !isToday(task.dueDate) && !isDone && <Badge variant="destructive" className="ml-1.5 text-xs px-1 py-0">Overdue</Badge>}
            {isToday(task.dueDate) && !isDone && <Badge variant="outline" className="ml-1.5 text-xs px-1 py-0 border-orange-500 text-orange-500">Today</Badge>}
          </div>
        )}
        <div className="text-xs text-muted-foreground pt-1">
            Created: {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
        </div>
      </CardContent>
    </Card>
  );
}
