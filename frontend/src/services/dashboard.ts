import api from './api';
import { demoStore, isDemoMode } from './demo';
import { normalizeProject } from '../utils/format';
import type { DashboardSummary } from '../types';

export async function getDashboardSummary(): Promise<DashboardSummary> {
  if (isDemoMode()) return demoStore.getDashboardSummary();
  const res = await api.get('/dashboard/summary');
  const data = res.data as DashboardSummary;
  return {
    ...data,
    recent_projects: (data.recent_projects as unknown as Record<string, unknown>[]).map(normalizeProject),
  };
}
