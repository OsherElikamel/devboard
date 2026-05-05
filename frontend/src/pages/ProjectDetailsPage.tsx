import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, GitBranch, ExternalLink, Plus, Trash2,
  ChevronDown, ChevronRight, CheckCircle2, MessageSquare,
  GitCommit, Rocket, RefreshCw, Calendar, Clock, Pencil,
} from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import PriorityDropdown from '../components/tasks/PriorityDropdown';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { timeAgo, dueLabel, normalizeProject } from '../utils/format';
import type { Project, Task, TaskPriority, ActivityItem, ActivityType, ProjectStatus } from '../types';

let _demoCommentId = 0;

const ACTIVITY_CONFIG: Record<ActivityType, { icon: typeof MessageSquare; color: string }> = {
  comment: { icon: MessageSquare, color: 'text-accent' },
  task_completed: { icon: CheckCircle2, color: 'text-success' },
  status_change: { icon: RefreshCw, color: 'text-warning' },
  deployment: { icon: Rocket, color: 'text-success' },
  commit: { icon: GitCommit, color: 'text-accent' },
};

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'idea', label: 'Idea' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'testing', label: 'Testing' },
  { value: 'deployed', label: 'Deployed' },
  { value: 'archived', label: 'Archived' },
];

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDemo } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showTodo, setShowTodo] = useState(true);
  const [showDone, setShowDone] = useState(true);

  const [editingTitle, setEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editingDesc, setEditingDesc] = useState(false);
  const [editDesc, setEditDesc] = useState('');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!id) return;
    const base = isDemo ? '/demo' : '';

    Promise.all([
      api.get(`${base}/projects/${id}`),
      api.get(`${base}/projects/${id}/tasks`),
      api.get(`${base}/projects/${id}/activity`).catch(() => ({ data: [] })),
    ])
      .then(([pRes, tRes, aRes]) => {
        setProject(normalizeProject(pRes.data));
        setTasks(tRes.data);
        setActivity(aRes.data);
      })
      .catch(() => navigate('/projects'))
      .finally(() => setLoading(false));
  }, [id, isDemo, navigate]);

  useEffect(() => {
    if (editingTitle && titleRef.current) titleRef.current.focus();
  }, [editingTitle]);

  useEffect(() => {
    if (editingDesc && descRef.current) {
      descRef.current.focus();
      descRef.current.setSelectionRange(descRef.current.value.length, descRef.current.value.length);
    }
  }, [editingDesc]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setShowStatusMenu(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const todoTasks = tasks.filter(t => !t.is_done);
  const doneTasks = tasks.filter(t => t.is_done);

  const saveProjectTitle = async () => {
    setEditingTitle(false);
    if (!project) return;
    const trimmed = editTitle.trim();
    if (!trimmed || trimmed.length < 2 || trimmed === project.title) {
      setEditTitle(project.title);
      return;
    }
    if (isDemo) {
      setProject({ ...project, title: trimmed });
      return;
    }
    const res = await api.patch(`/projects/${id}`, { title: trimmed });
    setProject(prev => prev ? { ...prev, ...res.data, technologies: prev.technologies } : prev);
  };

  const saveProjectDesc = async () => {
    setEditingDesc(false);
    if (!project) return;
    const trimmed = editDesc.trim();
    if (trimmed === (project.description || '')) return;
    if (isDemo) {
      setProject({ ...project, description: trimmed || null });
      return;
    }
    const res = await api.patch(`/projects/${id}`, { description: trimmed || null });
    setProject(prev => prev ? { ...prev, ...res.data, technologies: prev.technologies } : prev);
  };

  const changeProjectStatus = async (s: ProjectStatus) => {
    setShowStatusMenu(false);
    if (!project || s === project.status) return;
    if (isDemo) {
      setProject({ ...project, status: s });
      return;
    }
    const res = await api.patch(`/projects/${id}`, { status: s });
    setProject(prev => prev ? { ...prev, ...res.data, technologies: prev.technologies } : prev);
  };

  const toggleTask = async (task: Task) => {
    if (isDemo) {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, is_done: !t.is_done } : t));
      return;
    }
    const res = await api.patch(`/tasks/${task.id}`, { is_done: !task.is_done });
    setTasks(prev => prev.map(t => t.id === task.id ? res.data : t));
    const pRes = await api.get(`/projects/${id}`);
    setProject(prev => prev ? { ...prev, ...pRes.data, technologies: prev.technologies } : prev);
  };

  const changePriority = async (task: Task, priority: TaskPriority) => {
    if (priority === task.priority) return;
    if (isDemo) {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, priority } : t));
      return;
    }
    const res = await api.patch(`/tasks/${task.id}`, { priority });
    setTasks(prev => prev.map(t => t.id === task.id ? res.data : t));
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || isDemo) return;
    const res = await api.post(`/projects/${id}/tasks`, { title: newTask.trim() });
    setTasks(prev => [res.data, ...prev]);
    setNewTask('');
    const pRes = await api.get(`/projects/${id}`);
    setProject(prev => prev ? { ...prev, ...pRes.data, technologies: prev.technologies } : prev);
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (isDemo) {
      const item: ActivityItem = {
        id: `demo-comment-${++_demoCommentId}`,
        project_id: id!,
        type: 'comment',
        user_name: 'Guest',
        user_avatar_initial: 'G',
        content: newComment.trim(),
        created_at: new Date().toISOString(),
      };
      setActivity(prev => [item, ...prev]);
      setNewComment('');
      return;
    }

    await api.post(`/projects/${id}/comments`, { content: newComment.trim() });
    setNewComment('');
    const aRes = await api.get(`/projects/${id}/activity`).catch(() => ({ data: [] }));
    setActivity(aRes.data);
  };

  const deleteTask = async (taskId: string) => {
    if (isDemo) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      return;
    }
    await api.delete(`/tasks/${taskId}`);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    const pRes = await api.get(`/projects/${id}`);
    setProject(prev => prev ? { ...prev, ...pRes.data, technologies: prev.technologies } : prev);
  };

  const handleTaskUpdate = (updated: Task) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    setSelectedTask(updated);
  };

  if (loading) {
    return (
      <>
        <Topbar title="Loading..." />
        <div className="flex-1 p-8 space-y-6">
          <div className="h-48 rounded-2xl bg-app-surface animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 h-96 rounded-2xl bg-app-surface animate-pulse" />
            <div className="lg:col-span-2 h-96 rounded-2xl bg-app-surface animate-pulse" />
          </div>
        </div>
      </>
    );
  }

  if (!project) return null;

  return (
    <>
      <Topbar title={project.title} />

      <div className="flex-1 p-8 space-y-6 overflow-y-auto">
        <button onClick={() => navigate('/projects')} className="flex items-center gap-2 text-sm text-app-text-muted hover:text-accent transition-colors">
          <ArrowLeft size={16} /> Back to Projects
        </button>

        {/* Project Header */}
        <div className="rounded-2xl p-6 border border-app-border bg-app-surface">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                {editingTitle ? (
                  <input
                    ref={titleRef}
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    onBlur={saveProjectTitle}
                    onKeyDown={e => { if (e.key === 'Enter') saveProjectTitle(); if (e.key === 'Escape') { setEditTitle(project.title); setEditingTitle(false); } }}
                    maxLength={100}
                    className="text-2xl font-bold text-app-text bg-transparent border-b-2 border-accent outline-none py-0.5 w-full max-w-lg"
                  />
                ) : (
                  <h2
                    onClick={() => { if (!isDemo) { setEditTitle(project.title); setEditingTitle(true); } }}
                    className={`text-2xl font-bold text-app-text group flex items-center gap-2 ${!isDemo ? 'cursor-text hover:bg-app-hover/50 rounded-lg px-1 -mx-1' : ''} transition-colors`}
                  >
                    {project.title}
                    {!isDemo && <Pencil size={14} className="text-app-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </h2>
                )}
                <div className="relative shrink-0" ref={statusRef}>
                  <button onClick={() => { if (!isDemo) setShowStatusMenu(v => !v); }}>
                    <Badge status={project.status} className={!isDemo ? 'cursor-pointer hover:brightness-110' : ''} />
                  </button>
                  {showStatusMenu && (
                    <div className="absolute top-full left-0 mt-1 py-1 rounded-xl border border-app-border bg-app-surface shadow-xl z-10 min-w-[140px]">
                      {STATUS_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => changeProjectStatus(opt.value)}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-app-hover transition-colors ${opt.value === project.status ? 'text-accent font-medium' : 'text-app-text-secondary'}`}
                        >
                          {opt.label}
                          {opt.value === project.status && <span className="float-right text-xs">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {editingDesc ? (
                <textarea
                  ref={descRef}
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  onBlur={saveProjectDesc}
                  onKeyDown={e => { if (e.key === 'Escape') { setEditDesc(project.description || ''); setEditingDesc(false); } }}
                  maxLength={2000}
                  rows={3}
                  className="w-full max-w-3xl px-3 py-2 rounded-xl bg-app-input border border-accent text-app-text-secondary text-sm focus:outline-none resize-none leading-relaxed"
                />
              ) : (
                <div
                  onClick={() => { if (!isDemo) { setEditDesc(project.description || ''); setEditingDesc(true); } }}
                  className={`max-w-3xl group ${!isDemo ? 'cursor-text hover:bg-app-hover/50 rounded-lg px-1 -mx-1 py-1' : ''} transition-colors`}
                >
                  {project.description ? (
                    <p className="text-app-text-secondary leading-relaxed">{project.description}</p>
                  ) : (
                    <p className="text-app-text-muted italic text-sm">Click to add a description...</p>
                  )}
                  {!isDemo && <Pencil size={12} className="text-app-text-muted opacity-0 group-hover:opacity-100 transition-opacity mt-1" />}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 ml-4 shrink-0">
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-app-border text-sm text-app-text-secondary hover:text-accent hover:border-accent/30 transition-colors">
                  <GitBranch size={14} /> GitHub
                </a>
              )}
              {project.live_url && (
                <a href={project.live_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-app-border text-sm text-app-text-secondary hover:text-accent hover:border-accent/30 transition-colors">
                  <ExternalLink size={14} /> Live
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-app-border">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-app-text-muted">Progress</span>
                <span className="text-accent font-bold">{project.progress}%</span>
              </div>
              <ProgressBar value={project.progress} size="md" />
            </div>
            <div>
              <p className="text-sm text-app-text-muted mb-2">Tech Stack</p>
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.map(tech => (
                  <span key={tech.id} className="px-2.5 py-1 rounded-full text-xs font-[family-name:var(--font-tech)] border border-app-border text-app-text-secondary">
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-6">
              {project.start_date && (
                <div>
                  <p className="text-xs text-app-text-muted mb-1">Started</p>
                  <p className="text-sm text-app-text-secondary flex items-center gap-1.5">
                    <Calendar size={13} />
                    {new Date(project.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              )}
              {project.target_date && (
                <div>
                  <p className="text-xs text-app-text-muted mb-1">Target</p>
                  <p className="text-sm text-app-text-secondary flex items-center gap-1.5">
                    <Calendar size={13} />
                    {new Date(project.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Two-Column: Tasks + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Tasks Panel */}
          <div className="lg:col-span-3 rounded-2xl border border-app-border bg-app-surface overflow-hidden">
            <div className="px-6 py-4 border-b border-app-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-app-text">Tasks</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-[family-name:var(--font-tech)] bg-accent/10 text-accent">
                  {todoTasks.length} remaining
                </span>
              </div>
              <span className="text-sm text-app-text-muted">
                {doneTasks.length}/{tasks.length} completed
              </span>
            </div>

            <div className="divide-y divide-app-border">
              {!isDemo && (
                <form onSubmit={addTask} className="flex gap-2 px-6 py-3">
                  <input
                    type="text"
                    value={newTask}
                    onChange={e => setNewTask(e.target.value)}
                    placeholder="Add a new task..."
                    className="flex-1 px-4 py-2 rounded-xl bg-app-input border border-app-border text-app-text placeholder:text-app-text-muted text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                  <button type="submit" className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors">
                    <Plus size={16} />
                  </button>
                </form>
              )}

              {/* To Do Group */}
              <div>
                <button
                  onClick={() => setShowTodo(v => !v)}
                  className="w-full flex items-center gap-2 px-6 py-3 hover:bg-app-hover transition-colors"
                >
                  <div className="w-1 h-5 rounded-full bg-accent" />
                  {showTodo ? <ChevronDown size={16} className="text-app-text-muted" /> : <ChevronRight size={16} className="text-app-text-muted" />}
                  <span className="text-sm font-semibold text-app-text">To Do</span>
                  <span className="text-xs text-app-text-muted ml-1">({todoTasks.length})</span>
                </button>
                <AnimatePresence initial={false}>
                  {showTodo && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      {todoTasks.length === 0 ? (
                        <p className="px-6 py-4 text-sm text-app-text-muted text-center">All tasks completed!</p>
                      ) : (
                        todoTasks.map(task => {
                          const due = dueLabel(task.due_date);
                          return (
                            <div key={task.id} className="flex items-center gap-3 px-6 py-2.5 hover:bg-app-hover transition-colors group">
                              <button
                                onClick={() => toggleTask(task)}
                                className="w-[18px] h-[18px] rounded border-2 border-app-text-muted hover:border-accent transition-colors shrink-0"
                              />
                              <span
                                onClick={() => setSelectedTask(task)}
                                className="flex-1 text-sm text-app-text truncate cursor-pointer hover:text-accent transition-colors"
                              >
                                {task.title}
                              </span>
                              <PriorityDropdown priority={task.priority} onChange={p => changePriority(task, p)} />
                              {due && (
                                <span className={`text-xs font-[family-name:var(--font-tech)] flex items-center gap-1 shrink-0 ${due.className}`}>
                                  <Clock size={12} /> {due.label}
                                </span>
                              )}
                              {!isDemo && (
                                <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-1 text-app-text-muted hover:text-danger transition-all">
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          );
                        })
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Completed Group */}
              <div>
                <button
                  onClick={() => setShowDone(v => !v)}
                  className="w-full flex items-center gap-2 px-6 py-3 hover:bg-app-hover transition-colors"
                >
                  <div className="w-1 h-5 rounded-full bg-success" />
                  {showDone ? <ChevronDown size={16} className="text-app-text-muted" /> : <ChevronRight size={16} className="text-app-text-muted" />}
                  <span className="text-sm font-semibold text-app-text">Completed</span>
                  <span className="text-xs text-app-text-muted ml-1">({doneTasks.length})</span>
                </button>
                <AnimatePresence initial={false}>
                  {showDone && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      {doneTasks.map(task => (
                        <div key={task.id} className="flex items-center gap-3 px-6 py-2.5 hover:bg-app-hover transition-colors group">
                          <button
                            onClick={() => toggleTask(task)}
                            className="w-[18px] h-[18px] rounded border-2 bg-success border-success flex items-center justify-center shrink-0"
                          >
                            <span className="text-white text-[10px] leading-none">✓</span>
                          </button>
                          <span
                            onClick={() => setSelectedTask(task)}
                            className="flex-1 text-sm text-app-text-muted line-through truncate cursor-pointer hover:text-accent transition-colors"
                          >
                            {task.title}
                          </span>
                          <PriorityDropdown priority={task.priority} onChange={p => changePriority(task, p)} />
                          {!isDemo && (
                            <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-1 text-app-text-muted hover:text-danger transition-all">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Activity Panel */}
          <div className="lg:col-span-2 rounded-2xl border border-app-border bg-app-surface overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-app-border">
              <h3 className="text-lg font-semibold text-app-text">Activity</h3>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[600px] px-6 py-4 space-y-4">
              {activity.length === 0 ? (
                <p className="text-sm text-app-text-muted text-center py-8">No activity yet</p>
              ) : (
                activity.map(item => {
                  const config = ACTIVITY_CONFIG[item.type];
                  const Icon = config.icon;
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="shrink-0 mt-0.5">
                        <div className="w-8 h-8 rounded-full bg-app-elevated flex items-center justify-center">
                          <Icon size={14} className={config.color} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-app-text leading-relaxed">
                          <span className="font-medium">{item.user_name}</span>
                          {' '}
                          <span className="text-app-text-secondary">{item.content}</span>
                        </p>
                        <p className="text-xs text-app-text-muted mt-0.5 font-[family-name:var(--font-tech)]">
                          {timeAgo(item.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={submitComment} className="px-6 py-4 border-t border-app-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-4 py-2 rounded-xl bg-app-input border border-app-border text-app-text placeholder:text-app-text-muted text-sm focus:outline-none focus:border-accent transition-colors"
                />
                <button type="submit" className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors">
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <TaskDetailModal
        task={selectedTask}
        projectTitle={project.title}
        onClose={() => setSelectedTask(null)}
        onUpdate={handleTaskUpdate}
        onDelete={deleteTask}
      />
    </>
  );
}
