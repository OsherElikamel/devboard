import { useEffect, useState } from 'react';
import { FolderKanban, Rocket, Activity, TrendingUp, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import StatCard from '../components/dashboard/StatCard';
import DonutChart from '../components/charts/DonutChart';
import ProjectCard from '../components/projects/ProjectCard';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { normalizeProject } from '../utils/format';
import type { DashboardSummary, Project, ProjectStatus } from '../types';

type StatFilter = 'total' | 'active' | 'deployed';

const STAT_TITLES: Record<StatFilter, string> = {
  total: 'All Projects',
  active: 'Active Projects',
  deployed: 'Deployed Projects',
};

export default function DashboardPage() {
  const { user, isDemo } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedStat, setExpandedStat] = useState<StatFilter | null>(null);
  const [selectedTechs, setSelectedTechs] = useState<Set<string>>(new Set());

  useEffect(() => {
    const endpoint = isDemo ? '/demo/dashboard' : '/dashboard/summary';
    api.get(endpoint)
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isDemo]);

  const greeting = isDemo ? 'Welcome, Guest' : `Welcome back, ${user?.name || 'Developer'}`;

  const toggleStat = (stat: StatFilter) => {
    setExpandedStat((prev) => (prev === stat ? null : stat));
  };

  const allProjects: Project[] = data
    ? data.recent_projects.map((p) => normalizeProject(p as unknown as Record<string, unknown>))
    : [];

  const filteredProjects: Project[] = allProjects.filter((p) => {
    if (!expandedStat || expandedStat === 'total') return true;
    if (expandedStat === 'active') return p.status === 'in_progress';
    if (expandedStat === 'deployed') return p.status === 'deployed';
    return true;
  });

  const toggleTech = (tech: string) => {
    setSelectedTechs((prev) => {
      const next = new Set(prev);
      if (next.has(tech)) next.delete(tech);
      else next.add(tech);
      return next;
    });
  };

  const techProjectCounts: Record<string, number> = {};
  for (const p of allProjects) {
    for (const t of p.technologies) {
      techProjectCounts[t.name] = (techProjectCounts[t.name] || 0) + 1;
    }
  }

  const techFilteredProjects = allProjects.filter((p) => {
    if (selectedTechs.size === 0) return true;
    const projectTechNames = new Set(p.technologies.map((t) => t.name));
    for (const tech of selectedTechs) {
      if (!projectTechNames.has(tech)) return false;
    }
    return true;
  });

  return (
    <>
      <Topbar title="System Overview" subtitle={`${greeting}. Here's what's happening across your repositories today.`} />

      <div className="flex-1 p-8 space-y-8 overflow-y-auto">
        {loading ? (
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-app-surface animate-pulse" />
            ))}
          </div>
        ) : data && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Projects" value={data.total_projects} icon={FolderKanban} subtitle={`+${data.projects_by_status.in_progress || 0} this month`} onClick={() => toggleStat('total')} active={expandedStat === 'total'} />
              <StatCard label="Active Projects" value={data.projects_by_status.in_progress || 0} icon={Activity} subtitle="Current Sprints" onClick={() => toggleStat('active')} active={expandedStat === 'active'} />
              <StatCard label="Deployed" value={data.projects_by_status.deployed || 0} icon={Rocket} subtitle="Live Production" onClick={() => toggleStat('deployed')} active={expandedStat === 'deployed'} />
              <StatCard label="Avg Progress" value={`${data.average_progress}%`} icon={TrendingUp} subtitle={`+${Math.min(data.average_progress, 15)}% vs last week`} accent />
            </div>

            <AnimatePresence>
              {expandedStat && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="rounded-2xl border border-accent/20 bg-app-surface p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-app-text">
                        {STAT_TITLES[expandedStat]}
                        <span className="ml-2 text-app-text-muted font-normal">({filteredProjects.length})</span>
                      </h3>
                      <button
                        onClick={() => setExpandedStat(null)}
                        className="text-xs text-app-text-muted hover:text-app-text transition-colors"
                      >
                        Close
                      </button>
                    </div>

                    {filteredProjects.length === 0 ? (
                      <p className="text-sm text-app-text-muted py-4 text-center">No projects match this filter.</p>
                    ) : (
                      <div className="space-y-1">
                        {filteredProjects.map((project) => (
                          <motion.div
                            key={project.id}
                            whileHover={{ x: 4 }}
                            onClick={() => navigate(`/projects/${project.id}`)}
                            className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-app-hover cursor-pointer transition-colors group"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2.5">
                                <span className="text-sm font-medium text-app-text group-hover:text-accent transition-colors truncate">
                                  {project.title}
                                </span>
                                <Badge status={project.status as ProjectStatus} />
                              </div>
                              <div className="flex items-center gap-3 mt-1.5">
                                <div className="w-24">
                                  <ProgressBar value={project.progress} size="sm" />
                                </div>
                                <span className="text-[11px] text-app-text-muted font-[family-name:var(--font-tech)]">
                                  {project.progress}%
                                </span>
                                <span className="text-[11px] text-app-text-muted">
                                  {project.tasks_completed}/{project.total_tasks} tasks
                                </span>
                              </div>
                            </div>
                            <ChevronRight size={14} className="text-app-text-muted group-hover:text-accent transition-colors shrink-0" />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl p-6 border border-app-border bg-app-surface">
                <h3 className="text-lg font-semibold text-app-text mb-1">Project Status Distribution</h3>
                <p className="text-sm text-app-text-muted mb-4">Real-time health across lifecycle stages.</p>
                <DonutChart data={data.projects_by_status} />
              </div>

              <div className="rounded-2xl p-6 border border-app-border bg-app-surface">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-app-text">Technologies Used</h3>
                  {selectedTechs.size > 0 && (
                    <button
                      onClick={() => setSelectedTechs(new Set())}
                      className="text-xs text-app-text-muted hover:text-accent transition-colors"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.technologies_used.map((tech) => {
                    const isSelected = selectedTechs.has(tech);
                    return (
                      <button
                        key={tech}
                        onClick={() => toggleTech(tech)}
                        className={`px-3 py-1.5 rounded-full text-xs font-[family-name:var(--font-tech)] border transition-all duration-200 ${
                          isSelected
                            ? 'border-accent bg-accent/15 text-accent shadow-[0_0_12px_rgba(56,189,248,0.15)]'
                            : 'border-app-border text-app-text-secondary hover:border-accent/50 hover:text-accent'
                        }`}
                      >
                        {tech}
                        <span className={`ml-1.5 ${isSelected ? 'text-accent/70' : 'text-app-text-muted'}`}>
                          {techProjectCounts[tech] || 0}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-6 pt-4 border-t border-app-border">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-app-text-muted">Task Completion</span>
                    <span className="text-accent font-medium">{data.completed_tasks}/{data.total_tasks}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-app-input">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent to-accent-hover transition-all duration-700"
                      style={{ width: data.total_tasks ? `${(data.completed_tasks / data.total_tasks) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-semibold text-app-text">
                  {selectedTechs.size > 0 ? 'Matching Projects' : 'Featured Projects'}
                </h3>
                {selectedTechs.size > 0 && (
                  <span className="text-xs text-app-text-muted font-[family-name:var(--font-tech)]">
                    {techFilteredProjects.length} of {allProjects.length} projects
                  </span>
                )}
              </div>
              <p className="text-sm text-app-text-muted mb-4">
                {selectedTechs.size > 0
                  ? `Projects using ${[...selectedTechs].join(', ')}.`
                  : 'High-priority development tracks currently in focus.'}
              </p>
              {techFilteredProjects.length === 0 ? (
                <div className="rounded-2xl border border-app-border bg-app-surface py-12 text-center">
                  <p className="text-sm text-app-text-muted">No projects match all selected technologies.</p>
                  <button
                    onClick={() => setSelectedTechs(new Set())}
                    className="mt-2 text-xs text-accent hover:text-accent-hover transition-colors"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(selectedTechs.size > 0 ? techFilteredProjects : techFilteredProjects.slice(0, 3)).map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      isDemo={isDemo}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
