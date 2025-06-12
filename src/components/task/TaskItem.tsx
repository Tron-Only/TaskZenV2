
"use client";

import type { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, MoreVertical, CheckCircle, Circle, CalendarClock } from "lucide-react";
import { format, formatDistanceToNow, isPast, isToday } from "date-fns";
import { PriorityIcon } from "./PriorityIcon";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task["status"]) => void;
  onPreview: (task: Task) => void;
}

export function TaskItem({ task, onEdit, onDelete, onStatusChange, onPreview }: TaskItemProps) {
  const isDone = task.status === "Done";

  const handleToggleDone = () => {
    onStatusChange(task.id, isDone ? "To Do" : "Done");
  };

  const getDueDateColor = () => {
    if (!task.dueDate || isDone) return "text-muted-foreground";
    if (isPast(task.dueDate) && !isToday(task.dueDate)) return "text-destructive";
    if (isToday(task.dueDate)) return "text-orange-500"; 
    return "text-muted-foreground";
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, a, input, [data-radix-dropdown-menu-trigger], [role="button"]')) {
      return;
    }
    if (task.description) {
      onPreview(task);
    }
  };

  return (
    <Card 
      className={cn(
        "transition-all duration-300 hover:shadow-lg flex flex-col", 
        isDone && "bg-muted/50 opacity-70",
        task.description && "cursor-pointer"
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className={cn("text-lg leading-tight")}>
            <span className={cn("strikethrough-animated", isDone && "is-done")}>
              {task.title}
            </span>
          </CardTitle>
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
        {task.description && (
          <CardDescription className={cn("text-sm pt-1 line-clamp-3")}>
            <span className={cn("strikethrough-animated", isDone && "is-done")}>
              {task.description}
            </span>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-4 space-y-3 flex-grow">
        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
          <PriorityIcon priority={task.priority} />
          <Badge variant={task.priority === "High" ? "destructive" : task.priority === "Medium" ? "secondary" : "outline"} className="capitalize">
            {task.priority}
          </Badge>
          <Badge variant={task.status === "Done" ? "default" : task.status === "In Progress" ? "outline" : "secondary"} 
                 className={cn(
                   "capitalize",
                   task.status === "Done" && "bg-[hsl(var(--chart-2))] text-primary-foreground",
                   task.status === "In Progress" && "border-[hsl(var(--chart-4))] text-[hsl(var(--chart-4))]"
                 )}
          >
            {task.status}
          </Badge>
        </div>
        {task.tags && task.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {task.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0.5 font-normal bg-background/50">{tag}</Badge>
            ))}
          </div>
        )}
        {task.dueDate && (
          <div className={cn("text-xs flex items-center", getDueDateColor())}>
            <CalendarClock size={14} className="mr-1.5" />
            Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
            {isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && !isDone && <Badge variant="destructive" className="ml-2 text-xs px-1 py-0">Overdue</Badge>}
            {isToday(new Date(task.dueDate)) && !isDone && <Badge variant="outline" className="ml-2 text-xs px-1 py-0 border-orange-500 text-orange-500">Today</Badge>}
          </div>
        )}
         <div className="text-xs text-muted-foreground pt-1">
            Created: {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" onClick={handleToggleDone} className="w-full">
          {isDone ? <Circle size={16} className="mr-2" /> : <CheckCircle size={16} className="mr-2 text-[hsl(var(--chart-2))]" />}
          {isDone ? "Mark as Not Done" : "Mark as Done"}
        </Button>
      </CardFooter>
    </Card>
  );
}
