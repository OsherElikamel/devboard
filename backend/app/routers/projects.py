from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.project_comment import ProjectComment
from app.models.user import User
from app.utils.ownership import verify_project_ownership
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from app.schemas.project_comment import ProjectCommentCreate, ProjectCommentResponse
from app.services.project_service import (
    create_project,
    delete_project,
    get_project,
    get_user_projects,
    update_project,
)

router = APIRouter(prefix="/api/projects", tags=["Projects"])


@router.get("", response_model=list[ProjectResponse])
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_user_projects(db, current_user)


@router.post("", response_model=ProjectResponse, status_code=201)
def create(
    data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_project(db, data, current_user)


@router.get("/{project_id}", response_model=ProjectResponse)
def detail(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_project(db, project_id, current_user)


@router.patch("/{project_id}", response_model=ProjectResponse)
def update(
    project_id: UUID,
    data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_project(db, project_id, data, current_user)


@router.delete("/{project_id}", status_code=204)
def delete(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_project(db, project_id, current_user)


@router.post("/{project_id}/comments", response_model=ProjectCommentResponse, status_code=201)
def create_comment(
    project_id: UUID,
    data: ProjectCommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_project_ownership(db, project_id, current_user)
    comment = ProjectComment(project_id=project_id, user_id=current_user.id, content=data.content)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return ProjectCommentResponse(
        id=comment.id,
        project_id=comment.project_id,
        user_id=comment.user_id,
        user_name=current_user.name,
        content=comment.content,
        created_at=comment.created_at,
    )


@router.get("/{project_id}/comments", response_model=list[ProjectCommentResponse])
def list_comments(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_project_ownership(db, project_id, current_user)
    comments = (
        db.query(ProjectComment)
        .options(joinedload(ProjectComment.user))
        .filter(ProjectComment.project_id == project_id)
        .order_by(ProjectComment.created_at.desc())
        .all()
    )
    return [
        ProjectCommentResponse(
            id=c.id, project_id=c.project_id, user_id=c.user_id,
            user_name=c.user.name, content=c.content, created_at=c.created_at,
        )
        for c in comments
    ]


@router.get("/{project_id}/activity")
def project_activity(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_project_ownership(db, project_id, current_user)
    comments = (
        db.query(ProjectComment)
        .options(joinedload(ProjectComment.user))
        .filter(ProjectComment.project_id == project_id)
        .order_by(ProjectComment.created_at.desc())
        .all()
    )
    return [
        {
            "id": str(c.id),
            "project_id": str(c.project_id),
            "type": "comment",
            "user_name": c.user.name,
            "user_avatar_initial": c.user.name[0].upper(),
            "content": c.content,
            "created_at": c.created_at.isoformat(),
        }
        for c in comments
    ]
