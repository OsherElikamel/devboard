import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useLayout } from '../../contexts/LayoutContext';
import api from '../../services/api';
import type { ProjectStatus } from '../../types';

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'idea', label: 'Idea' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'testing', label: 'Testing' },
  { value: 'deployed', label: 'Deployed' },
];

export default function CreateProjectModal() {
  const { createProjectOpen, closeCreateProject } = useLayout();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('idea');
  const [githubUrl, setGithubUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setTitle('');
    setDescription('');
    setStatus('idea');
    setGithubUrl('');
    setStartDate('');
    setTargetDate('');
    setError('');
  };

  const handleClose = () => {
    reset();
    closeCreateProject();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 2) {
      setError('Title must be at least 2 characters');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const payload: Record<string, unknown> = {
        title: title.trim(),
        status,
      };
      if (description.trim()) payload.description = description.trim();
      if (githubUrl.trim()) payload.github_url = githubUrl.trim();
      if (startDate) payload.start_date = startDate;
      if (targetDate) payload.target_date = targetDate;

      const res = await api.post('/projects', payload);
      handleClose();
      navigate(`/projects/${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {createProjectOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg rounded-2xl border border-app-border bg-app-surface shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-app-border">
              <h2 className="text-lg font-semibold text-app-text">New Project</h2>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg text-app-text-muted hover:text-app-text hover:bg-app-hover transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-app-text-secondary mb-1.5 font-[family-name:var(--font-tech)] uppercase tracking-wide">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="My Awesome Project"
                  required
                  minLength={2}
                  maxLength={100}
                  className="w-full px-4 py-2.5 rounded-xl bg-app-input border border-app-border text-app-text placeholder:text-app-text-muted text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-app-text-secondary mb-1.5 font-[family-name:var(--font-tech)] uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="What is this project about?"
                  rows={3}
                  maxLength={2000}
                  className="w-full px-4 py-2.5 rounded-xl bg-app-input border border-app-border text-app-text placeholder:text-app-text-muted text-sm focus:outline-none focus:border-accent transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-app-text-secondary mb-1.5 font-[family-name:var(--font-tech)] uppercase tracking-wide">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as ProjectStatus)}
                    className="w-full px-4 py-2.5 rounded-xl bg-app-input border border-app-border text-app-text text-sm focus:outline-none focus:border-accent transition-colors"
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-app-text-secondary mb-1.5 font-[family-name:var(--font-tech)] uppercase tracking-wide">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={e => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-4 py-2.5 rounded-xl bg-app-input border border-app-border text-app-text placeholder:text-app-text-muted text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-app-text-secondary mb-1.5 font-[family-name:var(--font-tech)] uppercase tracking-wide">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-app-input border border-app-border text-app-text text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-app-text-secondary mb-1.5 font-[family-name:var(--font-tech)] uppercase tracking-wide">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={e => setTargetDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-app-input border border-app-border text-app-text text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 rounded-xl border border-app-border text-app-text-secondary text-sm font-medium hover:bg-app-hover transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-hover text-white text-sm font-medium transition-all duration-200 hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
