from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.project import Project
from app.models.task import Task
from app.models.user import User

router = APIRouter(prefix="/api/admin", tags=["Admin"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not settings.ADMIN_EMAIL or current_user.email != settings.ADMIN_EMAIL:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


@router.get("/stats")
def admin_stats(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    total_users = db.query(func.count(User.id)).scalar()
    total_projects = db.query(func.count(Project.id)).filter(Project.deleted_at.is_(None)).scalar()
    total_tasks = db.query(func.count(Task.id)).scalar()
    completed_tasks = db.query(func.count(Task.id)).filter(Task.is_done.is_(True)).scalar()

    return {
        "total_users": total_users,
        "total_projects": total_projects,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
    }


@router.get("/users")
def admin_list_users(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    project_counts = (
        db.query(Project.user_id, func.count(Project.id).label("count"))
        .filter(Project.deleted_at.is_(None))
        .group_by(Project.user_id)
        .subquery()
    )
    users = db.query(User).order_by(User.created_at.desc()).all()
    count_map = {row.user_id: row.count for row in db.query(project_counts).all()}
    return [
        {
            "id": str(u.id),
            "name": u.name,
            "email": u.email,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "project_count": count_map.get(u.id, 0),
        }
        for u in users
    ]


@router.delete("/users/{user_id}", status_code=204)
def admin_delete_user(user_id: UUID, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    db.delete(user)
    db.commit()


@router.get("/projects")
def admin_list_projects(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    task_counts = (
        db.query(Task.project_id, func.count(Task.id).label("count"))
        .group_by(Task.project_id)
        .subquery()
    )
    projects = (
        db.query(Project, User.name, User.email, task_counts.c.count)
        .join(User, Project.user_id == User.id)
        .outerjoin(task_counts, Project.id == task_counts.c.project_id)
        .filter(Project.deleted_at.is_(None))
        .order_by(Project.updated_at.desc())
        .all()
    )
    return [
        {
            "id": str(p.id),
            "title": p.title,
            "status": p.status,
            "owner_name": owner_name,
            "owner_email": owner_email,
            "task_count": tc or 0,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "updated_at": p.updated_at.isoformat() if p.updated_at else None,
        }
        for p, owner_name, owner_email, tc in projects
    ]


@router.delete("/projects/{project_id}", status_code=204)
def admin_delete_project(project_id: UUID, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
