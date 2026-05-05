from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models.project import Project
from app.models.technology import ProjectTechnology
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate, TechnologyInfo


def _to_response(project: Project) -> ProjectResponse:
    completed = sum(1 for t in project.tasks if t.is_done)
    total = len(project.tasks)
    techs = [TechnologyInfo.model_validate(pt.technology) for pt in project.project_technologies]
    return ProjectResponse(
        id=project.id,
        user_id=project.user_id,
        title=project.title,
        description=project.description,
        status=project.status,
        progress=project.progress,
        repo_name=project.repo_name,
        github_url=project.github_url,
        live_url=project.live_url,
        frontend_url=project.frontend_url,
        backend_url=project.backend_url,
        deployment_platform=project.deployment_platform,
        deployment_status=project.deployment_status,
        start_date=project.start_date,
        target_date=project.target_date,
        created_at=project.created_at,
        updated_at=project.updated_at,
        technologies=techs,
        tasks_completed=completed,
        total_tasks=total,
    )


def _load_project(db: Session) -> list:
    return (
        db.query(Project)
        .options(joinedload(Project.tasks), joinedload(Project.project_technologies).joinedload(ProjectTechnology.technology))
    )


def get_user_projects(db: Session, user: User) -> list[ProjectResponse]:
    projects = (
        _load_project(db)
        .filter(Project.user_id == user.id, Project.deleted_at.is_(None))
        .order_by(Project.updated_at.desc())
        .all()
    )
    return [_to_response(p) for p in projects]


def get_project(db: Session, project_id: UUID, user: User) -> ProjectResponse:
    project = (
        _load_project(db)
        .filter(Project.id == project_id, Project.user_id == user.id, Project.deleted_at.is_(None))
        .first()
    )
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return _to_response(project)


def create_project(db: Session, data: ProjectCreate, user: User) -> ProjectResponse:
    project = Project(user_id=user.id, **data.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return _to_response(project)


def update_project(db: Session, project_id: UUID, data: ProjectUpdate, user: User) -> ProjectResponse:
    project = db.query(Project).filter(
        Project.id == project_id, Project.user_id == user.id, Project.deleted_at.is_(None)
    ).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)

    full = (
        _load_project(db)
        .filter(Project.id == project.id)
        .first()
    )
    return _to_response(full)


def delete_project(db: Session, project_id: UUID, user: User) -> None:
    project = db.query(Project).filter(
        Project.id == project_id, Project.user_id == user.id, Project.deleted_at.is_(None)
    ).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    project.deleted_at = datetime.now(timezone.utc)
    db.commit()
