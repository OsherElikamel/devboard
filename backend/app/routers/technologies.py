from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.technology import ProjectTechnology, Technology
from app.models.user import User
from app.utils.ownership import verify_project_ownership
from app.schemas.technology import AttachTechnologiesRequest, TechnologyCreate, TechnologyResponse

router = APIRouter(tags=["Technologies"])


@router.get("/api/technologies", response_model=list[TechnologyResponse])
def list_technologies(db: Session = Depends(get_db)):
    return db.query(Technology).order_by(Technology.name).all()


@router.post("/api/technologies", response_model=TechnologyResponse, status_code=201)
def create_technology(
    data: TechnologyCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    existing = db.query(Technology).filter(Technology.name == data.name).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Technology already exists")
    tech = Technology(**data.model_dump())
    db.add(tech)
    db.commit()
    db.refresh(tech)
    return tech


@router.post("/api/projects/{project_id}/technologies", status_code=201)
def attach_technologies(
    project_id: UUID,
    data: AttachTechnologiesRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_project_ownership(db, project_id, current_user)

    for tech_id in data.technology_ids:
        exists = db.query(ProjectTechnology).filter(
            ProjectTechnology.project_id == project_id, ProjectTechnology.technology_id == tech_id
        ).first()
        if not exists:
            db.add(ProjectTechnology(project_id=project_id, technology_id=tech_id))

    db.commit()
    return {"detail": "Technologies attached"}


@router.delete("/api/projects/{project_id}/technologies/{technology_id}", status_code=204)
def detach_technology(
    project_id: UUID,
    technology_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_project_ownership(db, project_id, current_user)

    link = db.query(ProjectTechnology).filter(
        ProjectTechnology.project_id == project_id, ProjectTechnology.technology_id == technology_id
    ).first()
    if link:
        db.delete(link)
        db.commit()
