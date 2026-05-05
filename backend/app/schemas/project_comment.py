from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ProjectCommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=5000)


class ProjectCommentResponse(BaseModel):
    id: UUID
    project_id: UUID
    user_id: UUID
    user_name: str
    content: str
    created_at: datetime
