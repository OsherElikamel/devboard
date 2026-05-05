export type ProjectStatus = 'idea' | 'in_progress' | 'testing' | 'deployed' | 'archived';
export type DeploymentStatus = 'not_deployed' | 'deployed' | 'broken' | 'in_progress';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface TechnologyInfo {
  id: string;
  name: string;
  category: string | null;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  progress: number;
  repo_name: string | null;
  github_url: string | null;
  live_url: string | null;
  frontend_url: string | null;
  backend_url: string | null;
  deployment_platform: string | null;
  deployment_status: DeploymentStatus;
  start_date: string | null;
  target_date: string | null;
  created_at: string;
  updated_at: string;
  technologies: TechnologyInfo[];
  tasks_completed: number;
  total_tasks: number;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  is_done: boolean;
  priority: TaskPriority;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface LearningNote {
  id: string;
  project_id: string;
  title: string;
  content: string;
  topic: string | null;
  created_at: string;
  updated_at: string;
}

export interface Technology {
  id: string;
  name: string;
  category: string | null;
  created_at: string;
}

export interface DashboardSummary {
  total_projects: number;
  projects_by_status: Record<string, number>;
  average_progress: number;
  completed_tasks: number;
  total_tasks: number;
  technologies_used: string[];
  recent_projects: Project[];
}

export type ActivityType = 'comment' | 'task_completed' | 'status_change' | 'deployment' | 'commit';

export interface ActivityItem {
  id: string;
  project_id: string;
  type: ActivityType;
  user_name: string;
  user_avatar_initial: string;
  content: string;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}
