import type { Project, TechnologyInfo } from '../types';

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function dueLabel(due: string | null): { label: string; className: string } | null {
  if (!due) return null;
  const d = new Date(due);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000);
  const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (diff < 0) return { label, className: 'text-danger' };
  if (diff <= 2) return { label, className: 'text-warning' };
  return { label, className: 'text-app-text-muted' };
}

export function normalizeTechnologies(raw: unknown): TechnologyInfo[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  if (typeof raw[0] === 'string') {
    return (raw as string[]).map((name, i) => ({ id: String(i), name, category: null }));
  }
  return raw as TechnologyInfo[];
}

export function normalizeProject(p: Record<string, unknown>): Project {
  return { ...p, technologies: normalizeTechnologies(p.technologies) } as Project;
}
