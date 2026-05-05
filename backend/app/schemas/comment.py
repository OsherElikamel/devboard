from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class CommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=5000)


class CommentResponse(BaseModel):
    id: UUID
    task_id: UUID
    user_id: UUID
    user_name: str = ""
    content: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
