from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class LearningNoteCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1, max_length=10000)
    topic: str | None = Field(default=None, max_length=100)


class LearningNoteUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    content: str | None = Field(default=None, min_length=1, max_length=10000)
    topic: str | None = Field(default=None, max_length=100)


class LearningNoteResponse(BaseModel):
    id: UUID
    project_id: UUID
    title: str
    content: str
    topic: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
