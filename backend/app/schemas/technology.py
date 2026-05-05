from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, Field


class TechnologyCategory(str, Enum):
    frontend = "frontend"
    backend = "backend"
    database = "database"
    devops = "devops"
    testing = "testing"
    other = "other"


class TechnologyCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    category: TechnologyCategory | None = None


class TechnologyResponse(BaseModel):
    id: UUID
    name: str
    category: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AttachTechnologiesRequest(BaseModel):
    technology_ids: list[UUID]
