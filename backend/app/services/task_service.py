from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.task import Task
from app.models.user import User
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate
from app.utils.ownership import verify_project_ownership


def get_tasks(db: Session, project_id: UUID, user: User) -> list[TaskResponse]:
    verify_project_ownership(db, project_id, user)
    tasks = db.query(Task).filter(Task.project_id == project_id).order_by(Task.created_at.desc()).all()
    return [TaskResponse.model_validate(t) for t in tasks]


def create_task(db: Session, project_id: UUID, data: TaskCreate, user: User) -> TaskResponse:
    verify_project_ownership(db, project_id, user)
    task = Task(project_id=project_id, **data.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return TaskResponse.model_validate(task)


def update_task(db: Session, task_id: UUID, data: TaskUpdate, user: User) -> TaskResponse:
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    verify_project_ownership(db, task.project_id, user)

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return TaskResponse.model_validate(task)


def delete_task(db: Session, task_id: UUID, user: User) -> None:
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    verify_project_ownership(db, task.project_id, user)

    db.delete(task)
    db.commit()
