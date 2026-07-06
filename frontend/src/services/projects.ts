import api from './api';
import { demoStore, isDemoMode } from './demo';
import { normalizeProject } from '../utils/format';
import type { ActivityItem, Project, ProjectStatus } from '../types';

export interface ProjectCreateInput {
  title: string;
  description?: string;
  status?: ProjectStatus;
  github_url?: string;
  start_date?: string;
  target_date?: string;
}

export interface ProjectUpdateInput {
  title?: string;
  description?: string | null;
  status?: ProjectStatus;
}

export async function listProjects(): Promise<Project[]> {
  if (isDemoMode()) return demoStore.listProjects();
  const res = await api.get('/projects');
  return (res.data as Record<string, unknown>[]).map(normalizeProject);
}

export async function getProject(id: string): Promise<Project> {
  if (isDemoMode()) return demoStore.getProject(id);
  const res = await api.get(`/projects/${id}`);
  return normalizeProject(res.data);
}

export async function createProject(data: ProjectCreateInput): Promise<Project> {
  if (isDemoMode()) return demoStore.createProject(data);
  const res = await api.post('/projects', data);
  return normalizeProject(res.data);
}

export async function updateProject(id: string, patch: ProjectUpdateInput): Promise<Project> {
  if (isDemoMode()) return demoStore.updateProject(id, patch);
  const res = await api.patch(`/projects/${id}`, patch);
  return normalizeProject(res.data);
}

export async function deleteProject(id: string): Promise<void> {
  if (isDemoMode()) return demoStore.deleteProject(id);
  await api.delete(`/projects/${id}`);
}

export async function listActivity(projectId: string): Promise<ActivityItem[]> {
  if (isDemoMode()) return demoStore.listActivity(projectId);
  const res = await api.get(`/projects/${projectId}/activity`).catch(() => ({ data: [] }));
  return res.data as ActivityItem[];
}

export async function addProjectComment(projectId: string, content: string): Promise<void> {
  if (isDemoMode()) return demoStore.addProjectComment(projectId, content);
  await api.post(`/projects/${projectId}/comments`, { content });
}
