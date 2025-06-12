
export type Priority = "Low" | "Medium" | "High";
export const Priorities: Priority[] = ["Low", "Medium", "High"];

export type TaskStatus = "To Do" | "In Progress" | "Done";
export const TaskStatuses: TaskStatus[] = ["To Do", "In Progress", "Done"];

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  createdAt: Date;
  tags?: string[];
}
