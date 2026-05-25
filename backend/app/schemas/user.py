from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr


class UserResponse(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    created_at: datetime
    is_admin: bool = False

    model_config = {"from_attributes": True}
