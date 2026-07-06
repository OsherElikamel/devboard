import api from './api';

export interface AdminStats {
  total_users: number;
  total_projects: number;
  total_tasks: number;
  completed_tasks: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  created_at: string | null;
  project_count: number;
}

export interface AdminProject {
  id: string;
  title: string;
  status: string;
  owner_name: string;
  owner_email: string;
  task_count: number;
  created_at: string | null;
  updated_at: string | null;
}

export async function getStats(): Promise<AdminStats> {
  const res = await api.get('/admin/stats');
  return res.data as AdminStats;
}

export async function listUsers(): Promise<AdminUser[]> {
  const res = await api.get('/admin/users');
  return res.data as AdminUser[];
}

export async function listAllProjects(): Promise<AdminProject[]> {
  const res = await api.get('/admin/projects');
  return res.data as AdminProject[];
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/admin/users/${id}`);
}

export async function deleteProject(id: string): Promise<void> {
  await api.delete(`/admin/projects/${id}`);
}
