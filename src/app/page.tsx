
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PlusCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { TaskForm, type TaskFormValues } from "@/components/task/TaskForm";
import { TaskItem } from "@/components/task/TaskItem";
import { KanbanColumn } from "@/components/task/KanbanColumn";
import { HorizontalTaskItem } from "@/components/task/HorizontalTaskItem";
import { SortControls } from "@/components/task/SortControls";
import { ViewToggle } from "@/components/task/ViewToggle";
import useLocalStorage from "@/hooks/use-local-storage";
import type { Task, Priority, TaskStatus } from "@/types";
import { TaskStatuses } from "@/types"; // For Kanban columns
import { useToast } from "@/hooks/use-toast";

export type SortConfig = {
  key: "priority" | "createdAt";
  direction: "asc" | "desc";
};

export type ViewMode = "list" | "kanban" | "horizontal";

const priorityOrder: Record<Priority, number> = { Low: 0, Medium: 1, High: 2 };

export default function HomePage() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("taskzen-tasks", []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "createdAt", direction: "desc" });
  const [currentView, setCurrentView] = useState<ViewMode>("list");
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    const handleDragEnd = () => setDraggingTaskId(null);
    document.addEventListener("dragend", handleDragEnd);
    return () => {
      document.removeEventListener("dragend", handleDragEnd);
    };
  }, []);

  const handleOpenForm = (task?: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleTaskSubmit = (data: TaskFormValues, existingTaskId?: string) => {
    const tagsArray = data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [];
    
    const taskDataForStorage = {
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      tags: tagsArray,
    };

    if (existingTaskId) {
      setTasks(
        tasks.map((task) =>
          task.id === existingTaskId ? { ...task, ...taskDataForStorage } : task
        )
      );
      toast({ title: "Task Updated", description: `"${data.title}" has been updated.` });
    } else {
      const newTask: Task = {
        ...taskDataForStorage,
        id: crypto.randomUUID(),
        createdAt: new Date(),
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
    setDraggingTaskId(null);
  }, [setTasks]);

  const allUniqueTags = useMemo(() => {
    const tagSet = new Set<string>();
    tasks.forEach(task => task.tags?.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [tasks]);

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const filteredTasks = useMemo(() => {
    let currentTasks = tasks;

    if (searchTerm) {
      currentTasks = currentTasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedTags.length > 0) {
      currentTasks = currentTasks.filter(task =>
        selectedTags.every(stag => task.tags?.includes(stag))
      );
    }
    return currentTasks;
  }, [tasks, searchTerm, selectedTags]);

  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      let comparison = 0;
      if (sortConfig.key === "priority") {
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortConfig.key === "createdAt") {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  }, [filteredTasks, sortConfig]);

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
        <div className="flex flex-col lg:flex-row justify-between items-start mb-6 gap-4">
          <div className="flex flex-col gap-4 w-full lg:w-auto">
            <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2 sm:gap-4">
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:flex-1 md:max-w-xs"
              />
              <SortControls sortConfig={sortConfig} onSortChange={setSortConfig} />
              <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
            </div>
            {allUniqueTags.length > 0 || selectedTags.length > 0 ? (
              <div className="flex flex-col gap-2 p-3 border rounded-lg bg-card shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-card-foreground">Filter by tags:</span>
                  {selectedTags.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => setSelectedTags([])} className="text-xs h-auto py-0.5 px-1.5 text-primary hover:bg-primary/10">Clear Filters</Button>
                  )}
                </div>
                {allUniqueTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {allUniqueTags.map(tag => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "secondary"}
                        onClick={() => handleTagClick(tag)}
                        className="cursor-pointer transition-all hover:opacity-80"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground italic">No tags defined to filter by.</span>
                )}
              </div>
            ) : (
               <div className="p-3 border rounded-lg bg-card shadow-sm">
                 <span className="text-sm text-muted-foreground italic">No tags defined yet. Add tags to tasks to enable filtering.</span>
               </div>
            )}
          </div>
          <Button onClick={() => handleOpenForm()} className="w-full lg:w-auto mt-4 lg:mt-0 self-start lg:self-auto">
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
                <h2 className="text-xl mb-2">No tasks match your filters!</h2>
                <p>Try adjusting your search or tag filters, or create a new task.</p>
              </div>
            )}
          </div>
        )}

        {currentView === "kanban" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
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
             {sortedTasks.length === 0 && tasks.length > 0 && (
                <div className="md:col-span-full text-center py-10 text-muted-foreground">
                    <h2 className="text-xl mb-2">No tasks match your filters!</h2>
                    <p>Try adjusting your search or tag filters.</p>
                </div>
            )}
            {tasks.length === 0 && (
                 <div className="md:col-span-full text-center py-10 text-muted-foreground">
                    <h2 className="text-xl mb-2">No tasks yet!</h2>
                    <p>Click "Create Task" to get started.</p>
                </div>
            )}
          </div>
        )}

        {currentView === "horizontal" && (
          <div className="space-y-3 animate-in fade-in duration-300">
            {sortedTasks.length > 0 ? (
              sortedTasks.map((task) => (
                <HorizontalTaskItem
                  key={task.id}
                  task={task}
                  onEdit={handleOpenForm}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                />
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <h2 className="text-xl mb-2">No tasks match your filters!</h2>
                <p>Try adjusting your search or tag filters, or create a new task.</p>
              </div>
            )}
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
