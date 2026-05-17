import { useEffect, useState } from 'react';
import { Shield, Users, FolderKanban, CheckSquare, Trash2 } from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import api from '../services/api';

interface AdminStats {
  total_users: number;
  total_projects: number;
  total_tasks: number;
  completed_tasks: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  created_at: string | null;
  project_count: number;
}

interface AdminProject {
  id: string;
  title: string;
  status: string;
  owner_name: string;
  owner_email: string;
  task_count: number;
  created_at: string | null;
  updated_at: string | null;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'user' | 'project'; id: string; name: string } | null>(null);

  const fetchAll = async () => {
    try {
      const [statsRes, usersRes, projectsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/projects'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setProjects(projectsRes.data);
    } catch {
      setError('Access denied — admin only.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const endpoint = deleteConfirm.type === 'user'
      ? `/admin/users/${deleteConfirm.id}`
      : `/admin/projects/${deleteConfirm.id}`;
    await api.delete(endpoint);
    setDeleteConfirm(null);
    fetchAll();
  };

  if (loading) return <div className="flex-1 flex items-center justify-center"><p className="text-app-text-muted">Loading...</p></div>;
  if (error) return <div className="flex-1 flex items-center justify-center"><p className="text-danger">{error}</p></div>;

  return (
    <>
      <Topbar title="Admin Panel" subtitle="System overview, user management, and project oversight." />

      <div className="flex-1 p-4 md:p-8 space-y-6 overflow-y-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox icon={Users} label="Users" value={stats?.total_users ?? 0} />
          <StatBox icon={FolderKanban} label="Projects" value={stats?.total_projects ?? 0} />
          <StatBox icon={CheckSquare} label="Tasks" value={stats?.total_tasks ?? 0} />
          <StatBox icon={Shield} label="Completion" value={stats ? `${Math.round((stats.completed_tasks / Math.max(stats.total_tasks, 1)) * 100)}%` : '0%'} />
        </div>

        {/* Users */}
        <div className="rounded-2xl border border-app-border bg-app-surface overflow-hidden">
          <div className="px-6 py-4 border-b border-app-border">
            <h3 className="text-lg font-semibold text-app-text flex items-center gap-2">
              <Users size={18} className="text-accent" /> Users ({users.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-app-border text-app-text-muted text-left">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Projects</th>
                  <th className="px-6 py-3 font-medium">Joined</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-app-border/50 hover:bg-app-hover/50 transition-colors">
                    <td className="px-6 py-3 text-app-text font-medium">{u.name}</td>
                    <td className="px-6 py-3 text-app-text-secondary">{u.email}</td>
                    <td className="px-6 py-3 text-app-text-secondary">{u.project_count}</td>
                    <td className="px-6 py-3 text-app-text-muted">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => setDeleteConfirm({ type: 'user', id: u.id, name: `${u.name} (${u.email})` })}
                        className="p-1.5 rounded-lg text-app-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                        title="Delete user"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Projects */}
        <div className="rounded-2xl border border-app-border bg-app-surface overflow-hidden">
          <div className="px-6 py-4 border-b border-app-border">
            <h3 className="text-lg font-semibold text-app-text flex items-center gap-2">
              <FolderKanban size={18} className="text-accent" /> All Projects ({projects.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-app-border text-app-text-muted text-left">
                  <th className="px-6 py-3 font-medium">Title</th>
                  <th className="px-6 py-3 font-medium">Owner</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Tasks</th>
                  <th className="px-6 py-3 font-medium">Updated</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} className="border-b border-app-border/50 hover:bg-app-hover/50 transition-colors">
                    <td className="px-6 py-3 text-app-text font-medium">{p.title}</td>
                    <td className="px-6 py-3 text-app-text-secondary">{p.owner_name}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(p.status)}`}>
                        {p.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-app-text-secondary">{p.task_count}</td>
                    <td className="px-6 py-3 text-app-text-muted">{p.updated_at ? new Date(p.updated_at).toLocaleDateString() : '—'}</td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => setDeleteConfirm({ type: 'project', id: p.id, name: p.title })}
                        className="p-1.5 rounded-lg text-app-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                        title="Delete project"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-app-surface rounded-2xl border border-app-border p-6 max-w-sm w-full space-y-4" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-lg font-semibold text-app-text">Confirm Delete</h4>
            <p className="text-sm text-app-text-secondary">
              Are you sure you want to permanently delete {deleteConfirm.type} <span className="text-app-text font-medium">{deleteConfirm.name}</span>? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-app-text-secondary hover:bg-app-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-danger text-white hover:bg-danger/90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function StatBox({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-app-border bg-app-surface p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className="text-accent" />
        <span className="text-xs text-app-text-muted font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold text-app-text">{value}</p>
    </div>
  );
}

function statusColor(status: string): string {
  switch (status) {
    case 'deployed': return 'bg-success/10 text-success';
    case 'in_progress': return 'bg-accent/10 text-accent';
    case 'testing': return 'bg-warning/10 text-warning';
    case 'idea': return 'bg-app-hover text-app-text-secondary';
    case 'archived': return 'bg-app-hover text-app-text-muted';
    default: return 'bg-app-hover text-app-text-secondary';
  }
}
