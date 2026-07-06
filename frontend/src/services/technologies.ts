import api from './api';
import { demoStore, isDemoMode } from './demo';
import type { Technology } from '../types';

export async function listTechnologies(): Promise<Technology[]> {
  if (isDemoMode()) return demoStore.listTechnologies();
  const res = await api.get('/technologies');
  return res.data as Technology[];
}

export async function createTechnology(name: string): Promise<Technology> {
  if (isDemoMode()) return demoStore.createTechnology(name);
  const res = await api.post('/technologies', { name });
  return res.data as Technology;
}

export async function attachTechnology(projectId: string, technologyId: string): Promise<void> {
  if (isDemoMode()) return demoStore.attachTechnology(projectId, technologyId);
  await api.post(`/projects/${projectId}/technologies`, { technology_ids: [technologyId] });
}

export async function detachTechnology(projectId: string, technologyId: string): Promise<void> {
  if (isDemoMode()) return demoStore.detachTechnology(projectId, technologyId);
  await api.delete(`/projects/${projectId}/technologies/${technologyId}`);
}
