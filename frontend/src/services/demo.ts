import api from './api';
import { normalizeProject } from '../utils/format';
import type { ActivityItem, Comment, DashboardSummary, LearningNote, Project, Task, Technology } from '../types';
import type { ProjectCreateInput, ProjectUpdateInput } from './projects';
import type { TaskCreateInput, TaskUpdateInput } from './tasks';
import type { LearningNoteCreateInput, LearningNoteUpdateInput } from './learningNotes';

/** In-memory demo data store.
 *
 *  Guest mode reads seed data from the public /api/demo endpoints once,
 *  then serves reads and applies mutations locally. This lets the demo
 *  behave exactly like a real account (create, edit, delete) without
 *  persisting anything; everything resets when the session ends.
 */

export function isDemoMode(): boolean {
  return localStorage.getItem('devboard_demo') === 'true';
}

let seq = 0;
const newId = (prefix: string) => `demo-${prefix}-${++seq}`;
const isLocalId = (id: string) => id.startsWith('demo-');
const now = () => new Date().toISOString();

const DEMO_TECH_NAMES: [string, string][] = [
  ['React', 'frontend'], ['TypeScript', 'frontend'], ['Vite', 'frontend'],
  ['Tailwind CSS', 'frontend'], ['CSS', 'frontend'],
  ['Python', 'backend'], ['FastAPI', 'backend'], ['Node.js', 'backend'],
  ['PostgreSQL', 'database'], ['MongoDB', 'database'],
  ['Docker', 'devops'], ['JWT', 'backend'],
];

function buildTechCatalog(): Technology[] {
  return DEMO_TECH_NAMES.map(([name, category], i) => ({
    id: `demo-tech-${i}`,
    name,
    category,
    created_at: now(),
  }));
}

let projects: Project[] | null = null;
let techCatalog: Technology[] | null = null;
const tasksByProject = new Map<string, Task[]>();
const activityByProject = new Map<string, ActivityItem[]>();
const commentsByTask = new Map<string, Comment[]>();
const notesByProject = new Map<string, LearningNote[]>();

export function resetDemoStore(): void {
  projects = null;
  techCatalog = null;
  tasksByProject.clear();
  activityByProject.clear();
  commentsByTask.clear();
  notesByProject.clear();
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

async function ensureNotes(projectId: string): Promise<LearningNote[]> {
  if (!notesByProject.has(projectId)) {
    if (isLocalId(projectId)) {
      notesByProject.set(projectId, []);
    } else {
      const res = await api.get(`/demo/projects/${projectId}/learning-notes`).catch(() => ({ data: [] }));
      notesByProject.set(projectId, res.data as LearningNote[]);
    }
  }
  return notesByProject.get(projectId)!;
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

  listTechnologies(): Promise<Technology[]> {
    techCatalog ??= buildTechCatalog();
    return Promise.resolve([...techCatalog]);
  },

  createTechnology(name: string): Promise<Technology> {
    techCatalog ??= buildTechCatalog();
    const tech: Technology = { id: newId('tech'), name, category: null, created_at: now() };
    techCatalog.push(tech);
    return Promise.resolve({ ...tech });
  },

  async attachTechnology(projectId: string, technologyId: string): Promise<void> {
    techCatalog ??= buildTechCatalog();
    const project = (await ensureProjects()).find((p) => p.id === projectId);
    const tech = techCatalog.find((t) => t.id === technologyId);
    if (!project || !tech) return;
    if (!project.technologies.some((t) => t.name === tech.name)) {
      project.technologies.push({ id: tech.id, name: tech.name, category: tech.category });
      project.updated_at = now();
    }
  },

  async detachTechnology(projectId: string, technologyId: string): Promise<void> {
    const project = (await ensureProjects()).find((p) => p.id === projectId);
    if (!project) return;
    // Seeded demo projects carry index-based tech ids, so match by
    // catalog name as well as by id.
    const catalogName = techCatalog?.find((t) => t.id === technologyId)?.name;
    project.technologies = project.technologies.filter(
      (t) => t.id !== technologyId && (catalogName === undefined || t.name !== catalogName),
    );
    project.updated_at = now();
  },

  async listNotes(projectId: string): Promise<LearningNote[]> {
    return [...(await ensureNotes(projectId))];
  },

  async createNote(projectId: string, data: LearningNoteCreateInput): Promise<LearningNote> {
    const notes = await ensureNotes(projectId);
    const note: LearningNote = {
      id: newId('n'),
      project_id: projectId,
      title: data.title,
      content: data.content,
      topic: data.topic ?? null,
      created_at: now(),
      updated_at: now(),
    };
    notes.unshift(note);
    return { ...note };
  },

  async updateNote(noteId: string, patch: LearningNoteUpdateInput): Promise<LearningNote> {
    for (const notes of notesByProject.values()) {
      const note = notes.find((n) => n.id === noteId);
      if (note) {
        Object.assign(note, patch, { updated_at: now() });
        return { ...note };
      }
    }
    throw new Error('Demo note not found');
  },

  async deleteNote(noteId: string): Promise<void> {
    for (const [projectId, notes] of notesByProject) {
      if (notes.some((n) => n.id === noteId)) {
        notesByProject.set(projectId, notes.filter((n) => n.id !== noteId));
        return;
      }
    }
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
