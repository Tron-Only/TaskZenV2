
"use client";

import type { Task } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PriorityIcon } from "./PriorityIcon";
import { CalendarClock, Info, Tag, CheckCircle, ListTodo, Hourglass } from "lucide-react";
import { format, formatDistanceToNow, isPast, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TaskPreviewDialogProps {
  task: Task | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function TaskPreviewDialog({ task, isOpen, onOpenChange }: TaskPreviewDialogProps) {
  if (!task) {
    return null;
  }

  const getStatusIcon = () => {
    if (task.status === "Done") return <CheckCircle className="mr-2 h-5 w-5 text-[hsl(var(--chart-2))]" />;
    if (task.status === "In Progress") return <Hourglass className="mr-2 h-5 w-5 text-[hsl(var(--chart-4))]" />;
    return <ListTodo className="mr-2 h-5 w-5 text-muted-foreground" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg w-[90vw]">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-2xl font-bold text-primary break-words">{task.title}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground pt-1">
            Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(80vh-120px)] pr-3 -mr-2"> {/* Adjusted max-h and padding */}
          <div className="space-y-4 py-2">
            {task.description && (
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground flex items-center">
                  <Info size={16} className="mr-2 text-primary shrink-0" />
                  Description
                </h4>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap bg-secondary/30 p-3 rounded-md break-words">
                  {task.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center">
                  <PriorityIcon priority={task.priority} iconProps={{ size: 16, className:"mr-2 shrink-0" }} />
                  Priority
                </h4>
                <Badge
                  variant={task.priority === "High" ? "destructive" : task.priority === "Medium" ? "secondary" : "outline"}
                  className="capitalize"
                >
                  {task.priority}
                </Badge>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center">
                  {getStatusIcon()}
                  Status
                </h4>
                <Badge
                  variant={task.status === "Done" ? "default" : task.status === "In Progress" ? "outline" : "secondary"}
                  className={cn(
                    "capitalize",
                    task.status === "Done" && "bg-[hsl(var(--chart-2))] text-primary-foreground",
                    task.status === "In Progress" && "border-[hsl(var(--chart-4))] text-[hsl(var(--chart-4))]"
                  )}
                >
                  {task.status}
                </Badge>
              </div>
            </div>

            {task.dueDate && (
              <div className="pt-2">
                <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center">
                   <CalendarClock size={16} className="mr-2 text-primary shrink-0" />
                   Due Date
                </h4>
                <p className={cn(
                    "text-sm", 
                    isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && task.status !== "Done" ? "text-destructive" : "text-foreground/90"
                  )}
                >
                  {format(new Date(task.dueDate), "PPP")}
                  {isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && task.status !== 'Done' && (
                    <Badge variant="destructive" className="ml-2 text-xs px-1.5 py-0.5">Overdue</Badge>
                  )}
                   {isToday(new Date(task.dueDate)) && task.status !== 'Done' && (
                    <Badge variant="outline" className="ml-2 text-xs px-1.5 py-0.5 border-orange-500 text-orange-500">Today</Badge>
                  )}
                </p>
              </div>
            )}

            {task.tags && task.tags.length > 0 && (
              <div className="pt-2">
                <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center">
                  <Tag size={16} className="mr-2 text-primary shrink-0" />
                  Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="font-normal bg-background/70">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

