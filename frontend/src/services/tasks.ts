import api from './api';
import { demoStore, isDemoMode } from './demo';
import { listProjects } from './projects';
import type { Comment, Project, Task, TaskPriority } from '../types';

export interface TaskCreateInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  due_date?: string;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string | null;
  is_done?: boolean;
  priority?: TaskPriority;
  due_date?: string | null;
}

export interface ProjectTaskGroup {
  project: Project;
  tasks: Task[];
}

export async function listProjectTasks(projectId: string): Promise<Task[]> {
  if (isDemoMode()) return demoStore.listTasks(projectId);
  const res = await api.get(`/projects/${projectId}/tasks`);
  return res.data as Task[];
}

/** All of the user's tasks grouped by project: two requests, not one per project. */
export async function listTaskGroups(): Promise<ProjectTaskGroup[]> {
  if (isDemoMode()) return demoStore.listTaskGroups();
  const [projects, tasksRes] = await Promise.all([listProjects(), api.get('/tasks')]);
  const tasks = tasksRes.data as Task[];
  return projects
    .map((project) => ({ project, tasks: tasks.filter((t) => t.project_id === project.id) }))
    .filter((g) => g.tasks.length > 0);
}

export async function createTask(projectId: string, data: TaskCreateInput): Promise<Task> {
  if (isDemoMode()) return demoStore.createTask(projectId, data);
  const res = await api.post(`/projects/${projectId}/tasks`, data);
  return res.data as Task;
}

export async function updateTask(taskId: string, patch: TaskUpdateInput): Promise<Task> {
  if (isDemoMode()) return demoStore.updateTask(taskId, patch);
  const res = await api.patch(`/tasks/${taskId}`, patch);
  return res.data as Task;
}

export async function deleteTask(taskId: string): Promise<void> {
  if (isDemoMode()) return demoStore.deleteTask(taskId);
  await api.delete(`/tasks/${taskId}`);
}

export async function listTaskComments(taskId: string): Promise<Comment[]> {
  if (isDemoMode()) return demoStore.listTaskComments(taskId);
  const res = await api.get(`/tasks/${taskId}/comments`);
  return res.data as Comment[];
}

export async function addTaskComment(taskId: string, content: string): Promise<Comment> {
  if (isDemoMode()) return demoStore.addTaskComment(taskId, content);
  const res = await api.post(`/tasks/${taskId}/comments`, { content });
  return res.data as Comment;
}
