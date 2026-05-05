import type { ProjectStatus, TaskPriority } from '../../types';

const statusStyles: Record<ProjectStatus, string> = {
  idea: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  in_progress: 'bg-accent/20 text-accent border-accent/30',
  testing: 'bg-warning/20 text-warning border-warning/30',
  deployed: 'bg-success/20 text-success border-success/30',
  archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const statusLabels: Record<ProjectStatus, string> = {
  idea: 'Idea',
  in_progress: 'In Progress',
  testing: 'Testing',
  deployed: 'Deployed',
  archived: 'Archived',
};

const priorityStyles: Record<TaskPriority, string> = {
  low: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  medium: 'bg-accent/20 text-accent border-accent/30',
  high: 'bg-danger/20 text-danger border-danger/30',
};

interface Props {
  status?: ProjectStatus;
  priority?: TaskPriority;
  className?: string;
}

export default function Badge({ status, priority, className = '' }: Props) {
  if (status) {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-[family-name:var(--font-tech)] border ${statusStyles[status]} ${className}`}>
        {statusLabels[status]}
      </span>
    );
  }

  if (priority) {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium font-[family-name:var(--font-tech)] border ${priorityStyles[priority]} ${className}`}>
        {priority}
      </span>
    );
  }

  return null;
}
