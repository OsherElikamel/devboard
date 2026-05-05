import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, CheckCircle2, Circle, Clock, Calendar,
  Flag, MessageSquare, Send, Trash2, Pencil,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { timeAgo } from '../../utils/format';
import { PRIORITIES } from './priority-constants';
import type { Task, TaskPriority, Comment } from '../../types';

interface Props {
  task: Task | null;
  projectTitle?: string;
  onClose: () => void;
  onUpdate: (updated: Task) => void;
  onDelete: (taskId: string) => void;
}

let _demoCommentId = 100;

export default function TaskDetailModal({ task, projectTitle, onClose, onUpdate, onDelete }: Props) {
  const { isDemo } = useAuth();
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState('');
  const [editingDesc, setEditingDesc] = useState(false);
  const [description, setDescription] = useState('');
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const priorityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setEditingTitle(false);
      setEditingDesc(false);
      setShowPriorityMenu(false);
      loadComments(task.id);
    }
  }, [task?.id]);

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
      if (priorityRef.current && !priorityRef.current.contains(e.target as Node)) {
        setShowPriorityMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const loadComments = async (taskId: string) => {
    setLoadingComments(true);
    try {
      const base = isDemo ? '/demo' : '';
      const res = await api.get(`${base}/tasks/${taskId}/comments`);
      setComments(res.data);
    } catch {
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  if (!task) return null;

  const priorityInfo = PRIORITIES.find(p => p.value === task.priority) || PRIORITIES[1];

  const saveTitle = async () => {
    setEditingTitle(false);
    const trimmed = title.trim();
    if (!trimmed || trimmed === task.title) {
      setTitle(task.title);
      return;
    }
    if (isDemo) {
      onUpdate({ ...task, title: trimmed });
      return;
    }
    const res = await api.patch(`/tasks/${task.id}`, { title: trimmed });
    onUpdate(res.data);
  };

  const saveDescription = async () => {
    setEditingDesc(false);
    const trimmed = description.trim();
    if (trimmed === (task.description || '')) return;
    if (isDemo) {
      onUpdate({ ...task, description: trimmed || null });
      return;
    }
    const res = await api.patch(`/tasks/${task.id}`, { description: trimmed || null });
    onUpdate(res.data);
  };

  const toggleDone = async () => {
    if (isDemo) {
      onUpdate({ ...task, is_done: !task.is_done });
      return;
    }
    const res = await api.patch(`/tasks/${task.id}`, { is_done: !task.is_done });
    onUpdate(res.data);
  };

  const changePriority = async (p: TaskPriority) => {
    setShowPriorityMenu(false);
    if (p === task.priority) return;
    if (isDemo) {
      onUpdate({ ...task, priority: p });
      return;
    }
    const res = await api.patch(`/tasks/${task.id}`, { priority: p });
    onUpdate(res.data);
  };

  const changeDueDate = async (dateStr: string) => {
    if (isDemo) {
      onUpdate({ ...task, due_date: dateStr || null });
      return;
    }
    const res = await api.patch(`/tasks/${task.id}`, { due_date: dateStr || null });
    onUpdate(res.data);
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (isDemo) {
      const c: Comment = {
        id: `demo-tc-${++_demoCommentId}`,
        task_id: task.id,
        user_id: 'demo',
        user_name: 'Guest',
        content: newComment.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setComments(prev => [...prev, c]);
      setNewComment('');
      return;
    }

    const res = await api.post(`/tasks/${task.id}/comments`, { content: newComment.trim() });
    setComments(prev => [...prev, res.data]);
    setNewComment('');
  };

  const handleDelete = () => {
    onDelete(task.id);
    onClose();
  };

  const dueInfo = (() => {
    if (!task.due_date) return null;
    const d = new Date(task.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000);
    if (diff < 0) return { className: 'text-danger' };
    if (diff <= 2) return { className: 'text-warning' };
    return { className: 'text-app-text-secondary' };
  })();

  return (
    <AnimatePresence>
      {task && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-4xl max-h-[85vh] rounded-2xl border border-app-border bg-app-surface shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-app-border shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {projectTitle && (
                  <span className="text-xs text-app-text-muted font-[family-name:var(--font-tech)] uppercase tracking-wide shrink-0">
                    {projectTitle}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!isDemo && (
                  <button
                    onClick={handleDelete}
                    className="p-1.5 rounded-lg text-app-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                    aria-label="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-app-text-muted hover:text-app-text hover:bg-app-hover transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col lg:flex-row">
                {/* Left: Task Details */}
                <div className="flex-1 p-6 space-y-5 min-w-0 lg:border-r lg:border-app-border">
                  {/* Title */}
                  <div>
                    {editingTitle ? (
                      <input
                        ref={titleRef}
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        onBlur={saveTitle}
                        onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setTitle(task.title); setEditingTitle(false); } }}
                        maxLength={200}
                        className="w-full text-xl font-bold text-app-text bg-transparent border-b-2 border-accent outline-none py-1"
                      />
                    ) : (
                      <h2
                        onClick={() => setEditingTitle(true)}
                        className="text-xl font-bold text-app-text cursor-text hover:bg-app-hover/50 rounded-lg px-1 -mx-1 py-1 transition-colors group flex items-center gap-2"
                      >
                        {task.title}
                        <Pencil size={14} className="text-app-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h2>
                    )}
                  </div>

                  {/* Properties Row */}
                  <div className="flex flex-wrap gap-4 py-3 border-y border-app-border">
                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-app-text-muted font-[family-name:var(--font-tech)] uppercase tracking-wide w-16">Status</span>
                      <button
                        onClick={toggleDone}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          task.is_done
                            ? 'bg-success/15 text-success border border-success/30'
                            : 'bg-accent/15 text-accent border border-accent/30'
                        }`}
                      >
                        {task.is_done ? <CheckCircle2 size={13} /> : <Circle size={13} />}
                        {task.is_done ? 'Completed' : 'To Do'}
                      </button>
                    </div>

                    {/* Priority */}
                    <div className="flex items-center gap-2 relative" ref={priorityRef}>
                      <span className="text-xs text-app-text-muted font-[family-name:var(--font-tech)] uppercase tracking-wide w-16">Priority</span>
                      <button
                        onClick={() => setShowPriorityMenu(v => !v)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors hover:brightness-110 ${priorityInfo.bg} ${priorityInfo.color} border-current/20`}
                      >
                        <Flag size={12} />
                        {priorityInfo.label}
                      </button>
                      {showPriorityMenu && (
                        <div className="absolute top-full left-16 mt-1 py-1 rounded-xl border border-app-border bg-app-surface shadow-xl z-10 min-w-[120px]">
                          {PRIORITIES.map(p => (
                            <button
                              key={p.value}
                              onClick={() => changePriority(p.value)}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-app-hover transition-colors ${
                                p.value === task.priority ? p.bg : ''
                              } ${p.color}`}
                            >
                              <Flag size={12} />
                              {p.label}
                              {p.value === task.priority && <span className="ml-auto text-[10px]">✓</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Due Date */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-app-text-muted font-[family-name:var(--font-tech)] uppercase tracking-wide w-16">Due</span>
                      <div className="relative">
                        <input
                          type="date"
                          value={task.due_date || ''}
                          onChange={e => changeDueDate(e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border border-app-border bg-app-input transition-colors focus:outline-none focus:border-accent ${
                            dueInfo ? dueInfo.className : 'text-app-text-secondary'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-app-text-muted font-[family-name:var(--font-tech)] uppercase tracking-wide">Description</span>
                    </div>
                    {editingDesc ? (
                      <textarea
                        ref={descRef}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        onBlur={saveDescription}
                        onKeyDown={e => { if (e.key === 'Escape') { setDescription(task.description || ''); setEditingDesc(false); } }}
                        maxLength={2000}
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl bg-app-input border border-accent text-app-text text-sm focus:outline-none resize-none leading-relaxed"
                        placeholder="Add a description..."
                      />
                    ) : (
                      <div
                        onClick={() => setEditingDesc(true)}
                        className="px-4 py-3 rounded-xl border border-transparent hover:border-app-border hover:bg-app-hover/50 cursor-text transition-colors min-h-[80px] group"
                      >
                        {task.description ? (
                          <p className="text-sm text-app-text-secondary leading-relaxed whitespace-pre-wrap">{task.description}</p>
                        ) : (
                          <p className="text-sm text-app-text-muted italic">Click to add a description...</p>
                        )}
                        <Pencil size={12} className="text-app-text-muted opacity-0 group-hover:opacity-100 transition-opacity mt-2" />
                      </div>
                    )}
                  </div>

                  {/* Timestamps */}
                  <div className="flex gap-6 text-xs text-app-text-muted pt-2">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      Created {timeAgo(task.created_at)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} />
                      Updated {timeAgo(task.updated_at)}
                    </span>
                  </div>
                </div>

                {/* Right: Comments */}
                <div className="lg:w-[340px] flex flex-col border-t lg:border-t-0 border-app-border">
                  <div className="px-5 py-3 border-b border-app-border flex items-center gap-2">
                    <MessageSquare size={14} className="text-app-text-muted" />
                    <span className="text-sm font-semibold text-app-text">Comments</span>
                    <span className="text-xs text-app-text-muted">({comments.length})</span>
                  </div>

                  <div className="flex-1 overflow-y-auto max-h-[350px] px-5 py-4 space-y-4">
                    {loadingComments ? (
                      <div className="flex justify-center py-8">
                        <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                      </div>
                    ) : comments.length === 0 ? (
                      <p className="text-sm text-app-text-muted text-center py-6">No comments yet</p>
                    ) : (
                      comments.map(c => (
                        <div key={c.id} className="flex gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent/30 to-accent-hover/30 flex items-center justify-center text-[10px] font-bold text-accent shrink-0 mt-0.5">
                            {c.user_name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs font-semibold text-app-text">{c.user_name || 'Unknown'}</span>
                              <span className="text-[10px] text-app-text-muted font-[family-name:var(--font-tech)]">{timeAgo(c.created_at)}</span>
                            </div>
                            <p className="text-sm text-app-text-secondary leading-relaxed mt-0.5">{c.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={submitComment} className="px-5 py-3 border-t border-app-border">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 px-3 py-2 rounded-xl bg-app-input border border-app-border text-app-text placeholder:text-app-text-muted text-sm focus:outline-none focus:border-accent transition-colors"
                      />
                      <button type="submit" className="p-2 rounded-xl bg-accent hover:bg-accent-hover text-white transition-colors">
                        <Send size={14} />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
