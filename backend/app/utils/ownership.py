from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.project import Project
from app.models.user import User


def verify_project_ownership(db: Session, project_id: UUID, user: User) -> Project:
    project = db.query(Project).filter(
        Project.id == project_id, Project.user_id == user.id, Project.deleted_at.is_(None)
    ).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project
