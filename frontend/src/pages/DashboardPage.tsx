import { useEffect, useState } from 'react';
import { FolderKanban, Rocket, Activity, TrendingUp } from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import StatCard from '../components/dashboard/StatCard';
import DonutChart from '../components/charts/DonutChart';
import ProjectCard from '../components/projects/ProjectCard';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { normalizeProject } from '../utils/format';
import type { DashboardSummary } from '../types';

export default function DashboardPage() {
  const { user, isDemo } = useAuth();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint = isDemo ? '/demo/dashboard' : '/dashboard/summary';
    api.get(endpoint)
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isDemo]);

  const greeting = isDemo ? 'Welcome, Guest' : `Welcome back, ${user?.name || 'Developer'}`;

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
              <StatCard label="Total Projects" value={data.total_projects} icon={FolderKanban} subtitle={`+${data.projects_by_status.in_progress || 0} this month`} />
              <StatCard label="Active Projects" value={data.projects_by_status.in_progress || 0} icon={Activity} subtitle="Current Sprints" />
              <StatCard label="Deployed" value={data.projects_by_status.deployed || 0} icon={Rocket} subtitle="Live Production" />
              <StatCard label="Avg Progress" value={`${data.average_progress}%`} icon={TrendingUp} subtitle={`+${Math.min(data.average_progress, 15)}% vs last week`} accent />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl p-6 border border-app-border bg-app-surface">
                <h3 className="text-lg font-semibold text-app-text mb-1">Project Status Distribution</h3>
                <p className="text-sm text-app-text-muted mb-4">Real-time health across lifecycle stages.</p>
                <DonutChart data={data.projects_by_status} />
              </div>

              <div className="rounded-2xl p-6 border border-app-border bg-app-surface">
                <h3 className="text-lg font-semibold text-app-text mb-4">Technologies Used</h3>
                <div className="flex flex-wrap gap-2">
                  {data.technologies_used.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1.5 rounded-full text-xs font-[family-name:var(--font-tech)] border border-app-border text-app-text-secondary hover:border-accent/50 hover:text-accent transition-colors cursor-default"
                    >
                      {tech}
                    </span>
                  ))}
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
              <h3 className="text-lg font-semibold text-app-text mb-4">Featured Projects</h3>
              <p className="text-sm text-app-text-muted mb-4">High-priority development tracks currently in focus.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.recent_projects.slice(0, 3).map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={normalizeProject(project as unknown as Record<string, unknown>)}
                    isDemo={isDemo}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
