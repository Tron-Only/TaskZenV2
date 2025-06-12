"use client";

import type { Task, TaskStatus } from "@/types";
import { KanbanTaskCard } from "./KanbanTaskCard";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onTaskDrop: (taskId: string, newStatus: TaskStatus) => void;
  draggingTaskId: string | null;
}

export function KanbanColumn({ status, tasks, onEditTask, onDeleteTask, onTaskDrop, draggingTaskId }: KanbanColumnProps) {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      onTaskDrop(taskId, status);
    }
  };
  
  let columnBgColor = "bg-card";
  if (status === "To Do") columnBgColor = "bg-secondary/50";
  if (status === "In Progress") columnBgColor = "bg-secondary/70";
  if (status === "Done") columnBgColor = "bg-secondary";


  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn("flex-1 p-4 rounded-lg min-h-[300px] transition-colors duration-200", columnBgColor)}
      data-testid={`kanban-column-${status.toLowerCase().replace(' ', '-')}`}
    >
      <h3 className="text-lg font-semibold mb-4 capitalize text-foreground/90 border-b pb-2">{status} ({tasks.length})</h3>
      <div className="space-y-3 min-h-[200px]">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <KanbanTaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              isDragging={draggingTaskId === task.id}
            />
          ))
        ) : (
          <div className="text-sm text-muted-foreground text-center py-10">
            No tasks here.
          </div>
        )}
      </div>
    </div>
  );
}
