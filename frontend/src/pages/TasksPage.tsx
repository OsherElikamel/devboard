import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Clock, ListChecks } from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import Badge from '../components/ui/Badge';
import PriorityDropdown from '../components/tasks/PriorityDropdown';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { dueLabel, normalizeProject } from '../utils/format';
import type { Project, Task, TaskPriority } from '../types';

type StatusFilter = 'all' | 'todo' | 'done';

interface ProjectTasks {
  project: Project;
  tasks: Task[];
}

export default function TasksPage() {
  const { isDemo } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<ProjectTasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedProjectTitle, setSelectedProjectTitle] = useState('');

  useEffect(() => {
    const base = isDemo ? '/demo' : '';

    api.get(`${base}/projects`)
      .then(async (res) => {
        const projects: Project[] = (res.data as Record<string, unknown>[]).map(normalizeProject);

        const taskResults = await Promise.all(
          projects.map(p => api.get(`${base}/projects/${p.id}/tasks`).then(r => r.data as Task[]))
        );

        setGroups(
          projects
            .map((project, i) => ({ project, tasks: taskResults[i] }))
            .filter(g => g.tasks.length > 0)
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isDemo]);

  const toggleCollapse = (projectId: string) => {
    setCollapsed(prev => ({ ...prev, [projectId]: !prev[projectId] }));
  };

  const toggleTask = async (task: Task, groupIdx: number) => {
    if (isDemo) {
      setGroups(prev => prev.map((g, i) =>
        i === groupIdx
          ? { ...g, tasks: g.tasks.map(t => t.id === task.id ? { ...t, is_done: !t.is_done } : t) }
          : g
      ));
      return;
    }
    const res = await api.patch(`/tasks/${task.id}`, { is_done: !task.is_done });
    setGroups(prev => prev.map((g, i) =>
      i === groupIdx
        ? { ...g, tasks: g.tasks.map(t => t.id === task.id ? res.data : t) }
        : g
    ));
  };

  const changePriority = async (task: Task, groupIdx: number, priority: TaskPriority) => {
    if (priority === task.priority) return;
    if (isDemo) {
      setGroups(prev => prev.map((g, i) =>
        i === groupIdx
          ? { ...g, tasks: g.tasks.map(t => t.id === task.id ? { ...t, priority } : t) }
          : g
      ));
      return;
    }
    const res = await api.patch(`/tasks/${task.id}`, { priority });
    setGroups(prev => prev.map((g, i) =>
      i === groupIdx
        ? { ...g, tasks: g.tasks.map(t => t.id === task.id ? res.data : t) }
        : g
    ));
  };

  const handleTaskUpdate = (updated: Task) => {
    setGroups(prev => prev.map(g => ({
      ...g,
      tasks: g.tasks.map(t => t.id === updated.id ? updated : t),
    })));
    setSelectedTask(updated);
  };

  const handleTaskDelete = (taskId: string) => {
    if (isDemo) {
      setGroups(prev => prev.map(g => ({
        ...g,
        tasks: g.tasks.filter(t => t.id !== taskId),
      })).filter(g => g.tasks.length > 0));
      return;
    }
    api.delete(`/tasks/${taskId}`).then(() => {
      setGroups(prev => prev.map(g => ({
        ...g,
        tasks: g.tasks.filter(t => t.id !== taskId),
      })).filter(g => g.tasks.length > 0));
    });
  };

  const filterTasks = (tasks: Task[]) => {
    if (filter === 'todo') return tasks.filter(t => !t.is_done);
    if (filter === 'done') return tasks.filter(t => t.is_done);
    return tasks;
  };

  const totalTasks = groups.reduce((sum, g) => sum + g.tasks.length, 0);
  const totalTodo = groups.reduce((sum, g) => sum + g.tasks.filter(t => !t.is_done).length, 0);
  const totalDone = groups.reduce((sum, g) => sum + g.tasks.filter(t => t.is_done).length, 0);

  const FILTERS: { label: string; value: StatusFilter; count: number }[] = [
    { label: 'All Tasks', value: 'all', count: totalTasks },
    { label: 'To Do', value: 'todo', count: totalTodo },
    { label: 'Completed', value: 'done', count: totalDone },
  ];

  return (
    <>
      <Topbar title="Tasks" subtitle={`${totalTodo} tasks remaining across ${groups.length} projects`} />

      <div className="flex-1 p-4 md:p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                filter === f.value
                  ? 'bg-accent text-white'
                  : 'bg-app-input text-app-text-secondary hover:text-app-text hover:bg-app-hover border border-app-border'
              }`}
            >
              {f.label}
              <span className="ml-1.5 text-xs opacity-70">{f.count}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-app-surface animate-pulse" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-app-input flex items-center justify-center mb-4">
              <ListChecks size={28} className="text-app-text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-app-text mb-1">No tasks yet</h3>
            <p className="text-sm text-app-text-muted text-center max-w-sm">
              Create a project and add tasks to start tracking your work.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-app-border bg-app-surface overflow-hidden">
            <div className="hidden md:flex items-center px-6 py-3 border-b border-app-border text-xs font-semibold text-app-text-muted uppercase tracking-wider font-[family-name:var(--font-tech)]">
              <span className="w-8" />
              <span className="flex-1">Task</span>
              <span className="w-24 text-center">Priority</span>
              <span className="w-28 text-right">Due Date</span>
            </div>

            {groups.map((group, groupIdx) => {
              const filtered = filterTasks(group.tasks);
              if (filtered.length === 0 && filter !== 'all') return null;
              const isCollapsed = collapsed[group.project.id];
              const todoCount = group.tasks.filter(t => !t.is_done).length;
              const doneCount = group.tasks.filter(t => t.is_done).length;

              const statusColor = {
                in_progress: 'bg-accent',
                deployed: 'bg-success',
                testing: 'bg-warning',
                idea: 'bg-app-text-muted',
                archived: 'bg-app-text-muted',
              }[group.project.status] || 'bg-app-text-muted';

              return (
                <div key={group.project.id}>
                  <button
                    onClick={() => toggleCollapse(group.project.id)}
                    className="w-full flex items-center gap-3 px-6 py-3 bg-app-elevated hover:bg-app-hover border-b border-app-border transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full ${statusColor}`} />
                    {isCollapsed
                      ? <ChevronRight size={16} className="text-app-text-muted" />
                      : <ChevronDown size={16} className="text-app-text-muted" />}
                    <span
                      className="text-sm font-semibold text-app-text cursor-pointer hover:text-accent transition-colors"
                      onClick={(e) => { e.stopPropagation(); navigate(`/projects/${group.project.id}`); }}
                    >
                      {group.project.title}
                    </span>
                    <span className="text-xs text-app-text-muted font-[family-name:var(--font-tech)]">
                      {todoCount} to do · {doneCount} done
                    </span>
                    <Badge status={group.project.status} className="ml-auto" />
                  </button>

                  <AnimatePresence initial={false}>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        {(filtered.length === 0 ? group.tasks : filtered).map(task => {
                          const due = dueLabel(task.due_date);
                          return (
                            <div
                              key={task.id}
                              className="flex flex-wrap md:flex-nowrap items-center px-6 py-2.5 border-b border-app-border last:border-b-0 hover:bg-app-hover transition-colors group"
                            >
                              <button
                                onClick={() => toggleTask(task, groupIdx)}
                                className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                                  task.is_done
                                    ? 'bg-success border-success'
                                    : 'border-app-text-muted hover:border-accent'
                                }`}
                              >
                                {task.is_done && <span className="text-white text-[10px] leading-none">✓</span>}
                              </button>
                              <span
                                onClick={() => { setSelectedTask(task); setSelectedProjectTitle(group.project.title); }}
                                className={`flex-1 text-sm ml-3 truncate cursor-pointer hover:text-accent transition-colors ${
                                  task.is_done ? 'text-app-text-muted line-through' : 'text-app-text'
                                }`}
                              >
                                {task.title}
                              </span>
                              <span className="hidden md:flex w-24 justify-center">
                                <PriorityDropdown priority={task.priority} onChange={p => changePriority(task, groupIdx, p)} />
                              </span>
                              <span className="hidden md:block w-28 text-right">
                                {due && (
                                  <span className={`text-xs font-[family-name:var(--font-tech)] inline-flex items-center gap-1 ${due.className}`}>
                                    <Clock size={12} /> {due.label}
                                  </span>
                                )}
                              </span>
                              {(task.priority !== 'medium' || due) && (
                                <div className="flex md:hidden items-center gap-3 w-full ml-[30px] mt-1">
                                  <PriorityDropdown priority={task.priority} onChange={p => changePriority(task, groupIdx, p)} />
                                  {due && (
                                    <span className={`text-xs font-[family-name:var(--font-tech)] inline-flex items-center gap-1 ${due.className}`}>
                                      <Clock size={12} /> {due.label}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <TaskDetailModal
        task={selectedTask}
        projectTitle={selectedProjectTitle}
        onClose={() => setSelectedTask(null)}
        onUpdate={handleTaskUpdate}
        onDelete={handleTaskDelete}
      />
    </>
  );
}
