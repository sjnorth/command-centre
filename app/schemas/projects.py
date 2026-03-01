from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel


class ProjectStatus(str, Enum):
    active = "active"
    on_hold = "on_hold"
    completed = "completed"
    archived = "archived"


class ProjectCreate(BaseModel):
    name: str
    description: str | None = None
    status: ProjectStatus = ProjectStatus.active


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    status: ProjectStatus | None = None


class ProjectRead(BaseModel):
    id: UUID
    name: str
    description: str | None = None
    status: ProjectStatus
    created_at: datetime
    updated_at: datetime
