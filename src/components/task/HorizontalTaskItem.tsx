
"use client";

import type { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit2, Trash2, MoreVertical, CalendarDays } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { PriorityIcon } from "./PriorityIcon";
import { cn } from "@/lib/utils";

interface HorizontalTaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task["status"]) => void;
}

export function HorizontalTaskItem({ task, onEdit, onDelete, onStatusChange }: HorizontalTaskItemProps) {
  const isDone = task.status === "Done";

  const handleToggleDone = () => {
    onStatusChange(task.id, isDone ? "To Do" : "Done");
  };

  return (
    <Card className={cn("transition-all duration-300 hover:shadow-md w-full", isDone && "bg-muted/50 opacity-80")}>
      <CardContent className="p-3 flex items-center space-x-3 sm:space-x-4">
        <Checkbox
          id={`task-horizontal-${task.id}-done`}
          checked={isDone}
          onCheckedChange={handleToggleDone}
          aria-label={isDone ? "Mark task as not done" : "Mark task as done"}
          className="shrink-0"
        />
        <div className="flex-grow min-w-0">
          <h3 className={cn("font-medium text-base leading-tight strikethrough-animated truncate", isDone && "is-done")}>
            {task.title}
          </h3>
          {task.description && (
            <p className={cn("text-xs text-muted-foreground mt-0.5 truncate strikethrough-animated", isDone && "is-done")}>
              {task.description}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <PriorityIcon priority={task.priority} iconProps={{ size: 16 }} />
          <Badge variant={task.priority === "High" ? "destructive" : task.priority === "Medium" ? "secondary" : "outline"} className="capitalize text-xs px-1.5 py-0.5 whitespace-nowrap">
            {task.priority}
          </Badge>
        </div>
        <Badge
            variant={task.status === "Done" ? "default" : task.status === "In Progress" ? "outline" : "secondary"}
            className={cn(
            "capitalize text-xs px-1.5 py-0.5 whitespace-nowrap shrink-0",
            task.status === "Done" && "bg-[hsl(var(--chart-2))] text-primary-foreground",
            task.status === "In Progress" && "border-[hsl(var(--chart-4))] text-[hsl(var(--chart-4))]"
            )}
        >
            {task.status}
        </Badge>
        {task.dueDate && (
          <div className="text-xs text-muted-foreground whitespace-nowrap shrink-0 hidden sm:flex items-center">
            <CalendarDays size={12} className="mr-1" />
            {format(new Date(task.dueDate), "MMM d")}
          </div>
        )}
        <div className="text-xs text-muted-foreground whitespace-nowrap shrink-0 hidden md:block">
          {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
        </div>
        <div className="shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical size={18} />
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
      </CardContent>
    </Card>
  );
}
