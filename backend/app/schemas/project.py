from datetime import date, datetime
from enum import Enum
from typing import Annotated
from uuid import UUID

from pydantic import AfterValidator, BaseModel, Field


def _require_http_url(value: str | None) -> str | None:
    if not value:
        return None
    if not value.startswith(("http://", "https://")):
        raise ValueError("URL must start with http:// or https://")
    return value


HttpUrlStr = Annotated[str | None, Field(max_length=500), AfterValidator(_require_http_url)]


class ProjectStatus(str, Enum):
    idea = "idea"
    in_progress = "in_progress"
    testing = "testing"
    deployed = "deployed"
    archived = "archived"


class DeploymentStatus(str, Enum):
    not_deployed = "not_deployed"
    deployed = "deployed"
    broken = "broken"
    in_progress = "in_progress"


class ProjectCreate(BaseModel):
    title: str = Field(min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=2000)
    status: ProjectStatus = ProjectStatus.idea
    repo_name: str | None = Field(default=None, max_length=200)
    github_url: HttpUrlStr = None
    live_url: HttpUrlStr = None
    frontend_url: HttpUrlStr = None
    backend_url: HttpUrlStr = None
    deployment_platform: str | None = Field(default=None, max_length=50)
    deployment_status: DeploymentStatus = DeploymentStatus.not_deployed
    start_date: date | None = None
    target_date: date | None = None


class ProjectUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=2000)
    status: ProjectStatus | None = None
    repo_name: str | None = Field(default=None, max_length=200)
    github_url: HttpUrlStr = None
    live_url: HttpUrlStr = None
    frontend_url: HttpUrlStr = None
    backend_url: HttpUrlStr = None
    deployment_platform: str | None = Field(default=None, max_length=50)
    deployment_status: DeploymentStatus | None = None
    start_date: date | None = None
    target_date: date | None = None


class TechnologyInfo(BaseModel):
    id: UUID
    name: str
    category: str | None = None

    model_config = {"from_attributes": True}


class ProjectResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    description: str | None = None
    status: str
    progress: int
    repo_name: str | None = None
    github_url: str | None = None
    live_url: str | None = None
    frontend_url: str | None = None
    backend_url: str | None = None
    deployment_platform: str | None = None
    deployment_status: str
    start_date: date | None = None
    target_date: date | None = None
    created_at: datetime
    updated_at: datetime
    technologies: list[TechnologyInfo] = []
    tasks_completed: int = 0
    total_tasks: int = 0

    model_config = {"from_attributes": True}
