import { motion } from 'framer-motion';
import { GitBranch, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../../types';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';

interface Props {
  project: Project;
  isDemo?: boolean;
}

export default function ProjectCard({ project, isDemo }: Props) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
      className="rounded-2xl p-5 border border-app-border bg-app-surface cursor-pointer transition-all duration-200 hover:border-accent/30 hover:shadow-[0_0_30px_rgba(56,189,248,0.08)] group"
    >
      <div className="flex items-start justify-between mb-3">
        <Badge status={project.status} />
        <span className="text-xs text-app-text-muted font-[family-name:var(--font-tech)]">
          {new Date(project.updated_at).toLocaleDateString()}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-app-text mb-1 group-hover:text-accent transition-colors">
        {project.title}
      </h3>
      <p className="text-sm text-app-text-muted line-clamp-2 mb-4">{project.description}</p>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-app-text-muted mb-1.5">
          <span>Progress</span>
          <span className="text-accent font-medium">{project.progress}%</span>
        </div>
        <ProgressBar value={project.progress} size="sm" />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {project.technologies.map((tech) => (
          <span
            key={tech.id || tech.name}
            className="px-2 py-0.5 rounded-full text-[11px] font-[family-name:var(--font-tech)] border border-app-border text-app-text-secondary hover:border-accent/50 hover:text-accent transition-colors"
          >
            {tech.name}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-3 border-t border-app-border">
        {project.github_url && (
          <a
            href={project.github_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-xs text-app-text-muted hover:text-accent transition-colors"
          >
            <GitBranch size={14} /> GitHub
          </a>
        )}
        {project.live_url && (
          <a
            href={project.live_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-xs text-app-text-muted hover:text-accent transition-colors"
          >
            <ExternalLink size={14} /> Live Demo
          </a>
        )}
        <span className="ml-auto text-xs text-app-text-secondary font-[family-name:var(--font-tech)]">
          {project.tasks_completed}/{project.total_tasks} tasks
        </span>
      </div>
    </motion.div>
  );
}
