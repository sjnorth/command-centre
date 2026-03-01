from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ReflectionCreate(BaseModel):
    content: str
    project_id: UUID | None = None
    client_id: UUID | None = None
    sentiment: str | None = None
    summary: str | None = None


class ReflectionUpdate(BaseModel):
    content: str | None = None
    project_id: UUID | None = None
    client_id: UUID | None = None
    sentiment: str | None = None
    summary: str | None = None


class ReflectionRead(BaseModel):
    id: UUID
    content: str
    project_id: UUID | None = None
    client_id: UUID | None = None
    sentiment: str | None = None
    summary: str | None = None
    created_at: datetime
    updated_at: datetime
