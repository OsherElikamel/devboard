from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate
from app.services.task_service import create_task, delete_task, get_tasks, update_task

router = APIRouter(tags=["Tasks"])


@router.get("/api/projects/{project_id}/tasks", response_model=list[TaskResponse])
def list_tasks(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_tasks(db, project_id, current_user)


@router.post("/api/projects/{project_id}/tasks", response_model=TaskResponse, status_code=201)
def create(
    project_id: UUID,
    data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_task(db, project_id, data, current_user)


@router.patch("/api/tasks/{task_id}", response_model=TaskResponse)
def update(
    task_id: UUID,
    data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_task(db, task_id, data, current_user)


@router.delete("/api/tasks/{task_id}", status_code=204)
def delete(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_task(db, task_id, current_user)
