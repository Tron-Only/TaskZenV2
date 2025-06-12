
"use client";

import type { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, MoreVertical, CheckCircle, Circle, CalendarDays } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { PriorityIcon } from "./PriorityIcon";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task["status"]) => void;
}

export function TaskItem({ task, onEdit, onDelete, onStatusChange }: TaskItemProps) {
  const isDone = task.status === "Done";

  const handleToggleDone = () => {
    onStatusChange(task.id, isDone ? "To Do" : "Done");
  };

  return (
    <Card className={cn("transition-all duration-300 hover:shadow-lg", isDone && "bg-muted/50 opacity-70")}>
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
          <CardDescription className={cn("text-sm pt-1")}>
            <span className={cn("strikethrough-animated", isDone && "is-done")}>
              {task.description}
            </span>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-4 space-y-3">
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
         <div className="text-xs text-muted-foreground">
            Created: {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
        </div>
        {task.dueDate && (
          <div className="text-xs text-muted-foreground flex items-center">
            <CalendarDays size={14} className="mr-1.5" />
            Due: {format(new Date(task.dueDate), "PPP")}
          </div>
        )}
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
