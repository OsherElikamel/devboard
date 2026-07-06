import api from './api';
import { normalizeProject } from '../utils/format';
import type { ActivityItem, Comment, DashboardSummary, Project, Task } from '../types';
import type { ProjectCreateInput, ProjectUpdateInput } from './projects';
import type { TaskCreateInput, TaskUpdateInput } from './tasks';

/** In-memory demo data store.
 *
 *  Guest mode reads seed data from the public /api/demo endpoints once,
 *  then serves reads and applies mutations locally. This lets the demo
 *  behave exactly like a real account (create, edit, delete) without
 *  persisting anything — everything resets when the session ends.
 */

export function isDemoMode(): boolean {
  return localStorage.getItem('devboard_demo') === 'true';
}

let seq = 0;
const newId = (prefix: string) => `demo-${prefix}-${++seq}`;
const isLocalId = (id: string) => id.startsWith('demo-');
const now = () => new Date().toISOString();

let projects: Project[] | null = null;
const tasksByProject = new Map<string, Task[]>();
const activityByProject = new Map<string, ActivityItem[]>();
const commentsByTask = new Map<string, Comment[]>();

export function resetDemoStore(): void {
  projects = null;
  tasksByProject.clear();
  activityByProject.clear();
  commentsByTask.clear();
}

async function ensureProjects(): Promise<Project[]> {
  if (!projects) {
    const res = await api.get('/demo/projects');
    projects = (res.data as Record<string, unknown>[]).map(normalizeProject);
  }
  return projects;
}

async function ensureTasks(projectId: string): Promise<Task[]> {
  if (!tasksByProject.has(projectId)) {
    if (isLocalId(projectId)) {
      tasksByProject.set(projectId, []);
    } else {
      const res = await api.get(`/demo/projects/${projectId}/tasks`);
      tasksByProject.set(projectId, res.data as Task[]);
    }
  }
  return tasksByProject.get(projectId)!;
}

async function ensureActivity(projectId: string): Promise<ActivityItem[]> {
  if (!activityByProject.has(projectId)) {
    if (isLocalId(projectId)) {
      activityByProject.set(projectId, []);
    } else {
      const res = await api.get(`/demo/projects/${projectId}/activity`).catch(() => ({ data: [] }));
      activityByProject.set(projectId, res.data as ActivityItem[]);
    }
  }
  return activityByProject.get(projectId)!;
}

async function ensureTaskComments(taskId: string): Promise<Comment[]> {
  if (!commentsByTask.has(taskId)) {
    if (isLocalId(taskId)) {
      commentsByTask.set(taskId, []);
    } else {
      const res = await api.get(`/demo/tasks/${taskId}/comments`).catch(() => ({ data: [] }));
      commentsByTask.set(taskId, res.data as Comment[]);
    }
  }
  return commentsByTask.get(taskId)!;
}

function recountProject(projectId: string): void {
  const project = projects?.find((p) => p.id === projectId);
  const tasks = tasksByProject.get(projectId);
  if (!project || !tasks) return;
  project.total_tasks = tasks.length;
  project.tasks_completed = tasks.filter((t) => t.is_done).length;
  project.progress = tasks.length ? Math.round((project.tasks_completed / tasks.length) * 100) : 0;
  project.updated_at = now();
}

function byUpdatedDesc(a: Project, b: Project): number {
  return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
}

export const demoStore = {
  async listProjects(): Promise<Project[]> {
    return [...(await ensureProjects())].sort(byUpdatedDesc);
  },

  async getProject(id: string): Promise<Project> {
    const project = (await ensureProjects()).find((p) => p.id === id);
    if (!project) throw new Error('Demo project not found');
    return { ...project };
  },

  async createProject(data: ProjectCreateInput): Promise<Project> {
    await ensureProjects();
    const project: Project = {
      id: newId('p'),
      user_id: 'demo',
      title: data.title,
      description: data.description ?? null,
      status: data.status ?? 'idea',
      progress: 0,
      repo_name: null,
      github_url: data.github_url ?? null,
      live_url: null,
      frontend_url: null,
      backend_url: null,
      deployment_platform: null,
      deployment_status: 'not_deployed',
      start_date: data.start_date ?? null,
      target_date: data.target_date ?? null,
      created_at: now(),
      updated_at: now(),
      technologies: [],
      tasks_completed: 0,
      total_tasks: 0,
    };
    projects!.unshift(project);
    tasksByProject.set(project.id, []);
    activityByProject.set(project.id, []);
    return { ...project };
  },

  async updateProject(id: string, patch: ProjectUpdateInput): Promise<Project> {
    const project = (await ensureProjects()).find((p) => p.id === id);
    if (!project) throw new Error('Demo project not found');
    Object.assign(project, patch, { updated_at: now() });
    return { ...project };
  },

  async deleteProject(id: string): Promise<void> {
    await ensureProjects();
    projects = projects!.filter((p) => p.id !== id);
    tasksByProject.delete(id);
    activityByProject.delete(id);
  },

  async listTasks(projectId: string): Promise<Task[]> {
    return [...(await ensureTasks(projectId))];
  },

  async listTaskGroups(): Promise<{ project: Project; tasks: Task[] }[]> {
    const all = await this.listProjects();
    const groups = await Promise.all(
      all.map(async (project) => ({ project, tasks: await this.listTasks(project.id) })),
    );
    return groups.filter((g) => g.tasks.length > 0);
  },

  async createTask(projectId: string, data: TaskCreateInput): Promise<Task> {
    const tasks = await ensureTasks(projectId);
    const task: Task = {
      id: newId('t'),
      project_id: projectId,
      title: data.title,
      description: data.description ?? null,
      is_done: false,
      priority: data.priority ?? 'medium',
      due_date: data.due_date ?? null,
      created_at: now(),
      updated_at: now(),
    };
    tasks.unshift(task);
    recountProject(projectId);
    return { ...task };
  },

  async updateTask(taskId: string, patch: TaskUpdateInput): Promise<Task> {
    for (const [projectId, tasks] of tasksByProject) {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        Object.assign(task, patch, { updated_at: now() });
        recountProject(projectId);
        return { ...task };
      }
    }
    throw new Error('Demo task not found');
  },

  async deleteTask(taskId: string): Promise<void> {
    for (const [projectId, tasks] of tasksByProject) {
      if (tasks.some((t) => t.id === taskId)) {
        tasksByProject.set(projectId, tasks.filter((t) => t.id !== taskId));
        recountProject(projectId);
        return;
      }
    }
  },

  async listActivity(projectId: string): Promise<ActivityItem[]> {
    return [...(await ensureActivity(projectId))];
  },

  async addProjectComment(projectId: string, content: string): Promise<void> {
    const activity = await ensureActivity(projectId);
    activity.unshift({
      id: newId('a'),
      project_id: projectId,
      type: 'comment',
      user_name: 'Guest',
      user_avatar_initial: 'G',
      content,
      created_at: now(),
    });
  },

  async listTaskComments(taskId: string): Promise<Comment[]> {
    return [...(await ensureTaskComments(taskId))];
  },

  async addTaskComment(taskId: string, content: string): Promise<Comment> {
    const comments = await ensureTaskComments(taskId);
    const comment: Comment = {
      id: newId('c'),
      task_id: taskId,
      user_id: 'demo',
      user_name: 'Guest',
      content,
      created_at: now(),
      updated_at: now(),
    };
    comments.push(comment);
    return { ...comment };
  },

  async getDashboardSummary(): Promise<DashboardSummary> {
    const all = await this.listProjects();
    const statuses: Record<string, number> = { idea: 0, in_progress: 0, testing: 0, deployed: 0, archived: 0 };
    const techs = new Set<string>();
    let totalProgress = 0;
    let completed = 0;
    let total = 0;

    for (const p of all) {
      statuses[p.status] = (statuses[p.status] || 0) + 1;
      totalProgress += p.progress;
      completed += p.tasks_completed;
      total += p.total_tasks;
      for (const t of p.technologies) techs.add(t.name);
    }

    return {
      total_projects: all.length,
      projects_by_status: statuses,
      average_progress: all.length ? Math.round(totalProgress / all.length) : 0,
      completed_tasks: completed,
      total_tasks: total,
      technologies_used: [...techs].sort(),
      recent_projects: all.slice(0, 5),
    };
  },
};
