import { useEffect, useState } from 'react';
import { FolderPlus } from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import ProjectCard from '../components/projects/ProjectCard';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { normalizeProject } from '../utils/format';
import type { Project, ProjectStatus } from '../types';

const STATUS_FILTERS: { label: string; value: ProjectStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Deployed', value: 'deployed' },
  { label: 'Testing', value: 'testing' },
  { label: 'Idea', value: 'idea' },
  { label: 'Archived', value: 'archived' },
];

export default function ProjectsPage() {
  const { isDemo } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all');

  useEffect(() => {
    const endpoint = isDemo ? '/demo/projects' : '/projects';
    api.get(endpoint)
      .then((res) => {
        const raw = res.data as Record<string, unknown>[];
        setProjects(raw.map((p) => normalizeProject(p)));
      })
      .catch(() => setError('Failed to load projects'))
      .finally(() => setLoading(false));
  }, [isDemo]);

  const filtered = filter === 'all' ? projects : projects.filter((p) => p.status === filter);

  return (
    <>
      <Topbar
        title="Projects"
        subtitle={`Manage, deploy, and monitor your development infrastructure across ${projects.length} active environments.`}
      />

      <div className="flex-1 p-4 md:p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                filter === value
                  ? 'bg-accent text-white'
                  : 'bg-app-input text-app-text-secondary hover:text-app-text hover:bg-app-hover border border-app-border'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-app-surface animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-danger/30 bg-danger/5 p-8 text-center">
            <p className="text-sm text-danger">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-app-input flex items-center justify-center mb-4">
              <FolderPlus size={28} className="text-app-text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-app-text mb-1">No projects yet</h3>
            <p className="text-sm text-app-text-muted mb-4 text-center max-w-sm">
              Start by creating your first project and tracking your progress from idea to deployment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
