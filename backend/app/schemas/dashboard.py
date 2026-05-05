from pydantic import BaseModel

from app.schemas.project import ProjectResponse


class DashboardSummary(BaseModel):
    total_projects: int
    projects_by_status: dict[str, int]
    average_progress: int
    completed_tasks: int
    total_tasks: int
    technologies_used: list[str]
    recent_projects: list[ProjectResponse]
