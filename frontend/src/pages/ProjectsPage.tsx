import { useEffect, useState } from 'react';
import { FolderPlus, Plus } from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import ProjectCard from '../components/projects/ProjectCard';
import { useLayout } from '../contexts/LayoutContext';
import { listProjects } from '../services/projects';
import type { Project, ProjectStatus } from '../types';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const STATUS_FILTERS: { label: string; value: ProjectStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Deployed', value: 'deployed' },
  { label: 'Testing', value: 'testing' },
  { label: 'Idea', value: 'idea' },
  { label: 'Archived', value: 'archived' },
];

export default function ProjectsPage() {
  useDocumentTitle('Projects · DevBoard');
  const { openCreateProject } = useLayout();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all');

  useEffect(() => {
    listProjects()
      .then(setProjects)
      .catch(() => setError('Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? projects : projects.filter((p) => p.status === filter);

  return (
    <>
      <Topbar
        title="Projects"
        subtitle="Everything you're building, from idea to deployed."
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
            <button
              onClick={openCreateProject}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
            >
              <Plus size={16} /> Create your first project
            </button>
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
