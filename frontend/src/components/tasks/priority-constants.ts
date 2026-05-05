import type { TaskPriority } from '../../types';

export const PRIORITIES: {
  value: TaskPriority;
  label: string;
  color: string;
  bg: string;
  border: string;
}[] = [
  { value: 'high', label: 'High', color: 'text-danger', bg: 'bg-danger/20', border: 'border-danger/30' },
  { value: 'medium', label: 'Medium', color: 'text-accent', bg: 'bg-accent/20', border: 'border-accent/30' },
  { value: 'low', label: 'Low', color: 'text-slate-400', bg: 'bg-slate-500/20', border: 'border-slate-500/30' },
];
