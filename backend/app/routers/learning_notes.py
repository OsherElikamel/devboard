from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.learning_note import LearningNote
from app.models.user import User
from app.schemas.learning_note import LearningNoteCreate, LearningNoteResponse, LearningNoteUpdate
from app.utils.ownership import verify_project_ownership

router = APIRouter(tags=["Learning Notes"])


@router.get("/api/projects/{project_id}/learning-notes", response_model=list[LearningNoteResponse])
def list_notes(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_project_ownership(db, project_id, current_user)
    notes = db.query(LearningNote).filter(LearningNote.project_id == project_id).order_by(LearningNote.created_at.desc()).all()
    return [LearningNoteResponse.model_validate(n) for n in notes]


@router.post("/api/projects/{project_id}/learning-notes", response_model=LearningNoteResponse, status_code=201)
def create_note(
    project_id: UUID,
    data: LearningNoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_project_ownership(db, project_id, current_user)
    note = LearningNote(project_id=project_id, **data.model_dump())
    db.add(note)
    db.commit()
    db.refresh(note)
    return LearningNoteResponse.model_validate(note)


@router.patch("/api/learning-notes/{note_id}", response_model=LearningNoteResponse)
def update_note(
    note_id: UUID,
    data: LearningNoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = db.query(LearningNote).filter(LearningNote.id == note_id).first()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    verify_project_ownership(db, note.project_id, current_user)

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(note, field, value)

    db.commit()
    db.refresh(note)
    return LearningNoteResponse.model_validate(note)


@router.delete("/api/learning-notes/{note_id}", status_code=204)
def delete_note(
    note_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = db.query(LearningNote).filter(LearningNote.id == note_id).first()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    verify_project_ownership(db, note.project_id, current_user)
    db.delete(note)
    db.commit()
