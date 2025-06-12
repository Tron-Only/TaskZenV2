"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { TaskForm } from "@/components/task/TaskForm";
import { TaskItem } from "@/components/task/TaskItem";
import { KanbanColumn } from "@/components/task/KanbanColumn";
import { SortControls } from "@/components/task/SortControls";
import { ViewToggle } from "@/components/task/ViewToggle";
import useLocalStorage from "@/hooks/use-local-storage";
import type { Task, Priority, TaskStatus } from "@/types";
import { TaskStatuses } from "@/types"; // For Kanban columns
import { useToast } from "@/hooks/use-toast";

export type SortConfig = {
  key: "priority" | "dueDate" | "createdAt";
  direction: "asc" | "desc";
};

export type ViewMode = "list" | "kanban";

const priorityOrder: Record<Priority, number> = { Low: 0, Medium: 1, High: 2 };

export default function HomePage() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("taskzen-tasks", []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "createdAt", direction: "desc" });
  const [currentView, setCurrentView] = useState<ViewMode>("list");
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null); // For visual feedback while dragging

  const { toast } = useToast();

  // Effect to handle drag start and end for visual feedback (optional)
  useEffect(() => {
    const handleDragStart = (event: DragEvent) => {
      if (event.dataTransfer?.types.includes("taskid")) { // A bit of a hack, better to set on actual draggable item
        // This part is tricky to get right without direct access to the draggable item's onDragStart
        // For now, KanbanTaskCard will handle its own isDragging visual state via prop
      }
    };
    const handleDragEnd = () => setDraggingTaskId(null);

    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("dragend", handleDragEnd);
    return () => {
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("dragend", handleDragEnd);
    };
  }, []);


  const handleOpenForm = (task?: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleTaskSubmit = (data: Omit<Task, "id" | "createdAt">, existingTaskId?: string) => {
    if (existingTaskId) {
      setTasks(
        tasks.map((task) =>
          task.id === existingTaskId ? { ...task, ...data, dueDate: data.dueDate ? new Date(data.dueDate) : undefined } : task
        )
      );
      toast({ title: "Task Updated", description: `"${data.title}" has been updated.` });
    } else {
      const newTask: Task = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      };
      setTasks([newTask, ...tasks]);
      toast({ title: "Task Created", description: `"${data.title}" has been added.` });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    setTasks(tasks.filter((task) => task.id !== taskId));
    if (taskToDelete) {
       toast({ title: "Task Deleted", description: `"${taskToDelete.title}" has been removed.`, variant: "destructive" });
    }
  };

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    setTasks(
      tasks.map((task) => (task.id === taskId ? { ...task, status } : task))
    );
  };

  const handleTaskDrop = useCallback((taskId: string, newStatus: TaskStatus) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
    setDraggingTaskId(null); // Clear dragging state
  }, [setTasks]);


  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      let comparison = 0;
      if (sortConfig.key === "priority") {
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortConfig.key === "dueDate") {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        comparison = dateA - dateB;
         if (dateA === Infinity && dateB !== Infinity) comparison = sortConfig.direction === 'asc' ? 1 : -1;
         if (dateB === Infinity && dateA !== Infinity) comparison = sortConfig.direction === 'asc' ? -1 : 1;
      } else { // createdAt
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  }, [tasks, sortConfig]);

  const tasksByStatus = useMemo(() => {
    return TaskStatuses.reduce((acc, status) => {
      acc[status] = sortedTasks.filter((task) => task.status === status);
      return acc;
    }, {} as Record<TaskStatus, Task[]>);
  }, [sortedTasks]);


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <SortControls sortConfig={sortConfig} onSortChange={setSortConfig} />
            <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
          </div>
          <Button onClick={() => handleOpenForm()} className="w-full sm:w-auto">
            <PlusCircle size={18} className="mr-2" /> Create Task
          </Button>
        </div>

        {currentView === "list" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-300">
            {sortedTasks.length > 0 ? (
              sortedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onEdit={handleOpenForm}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-muted-foreground">
                <h2 className="text-xl mb-2">No tasks yet!</h2>
                <p>Click "Create Task" to get started.</p>
              </div>
            )}
          </div>
        )}

        {currentView === "kanban" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {TaskStatuses.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                tasks={tasksByStatus[status]}
                onEditTask={handleOpenForm}
                onDeleteTask={handleDeleteTask}
                onTaskDrop={handleTaskDrop}
                draggingTaskId={draggingTaskId}
              />
            ))}
          </div>
        )}
      </main>
      <TaskForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleTaskSubmit}
        initialTask={editingTask}
      />
      <footer className="text-center py-4 border-t text-sm text-muted-foreground mt-auto">
        TaskZen - Your focus, amplified.
      </footer>
    </div>
  );
}
