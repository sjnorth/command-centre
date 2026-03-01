from datetime import date, datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel


class ActionItemStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class ActionItemPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    urgent = "urgent"


class ActionItemSource(str, Enum):
    manual = "manual"
    reflection = "reflection"
    ai_generated = "ai_generated"


class ActionItemCreate(BaseModel):
    title: str
    description: str | None = None
    status: ActionItemStatus = ActionItemStatus.pending
    priority: ActionItemPriority = ActionItemPriority.medium
    due_date: date | None = None
    source: ActionItemSource = ActionItemSource.manual
    reflection_id: UUID | None = None
    project_id: UUID | None = None


class ActionItemUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: ActionItemStatus | None = None
    priority: ActionItemPriority | None = None
    due_date: date | None = None
    source: ActionItemSource | None = None
    reflection_id: UUID | None = None
    project_id: UUID | None = None


class ActionItemRead(BaseModel):
    id: UUID
    title: str
    description: str | None = None
    status: ActionItemStatus
    priority: ActionItemPriority
    due_date: date | None = None
    source: ActionItemSource
    reflection_id: UUID | None = None
    project_id: UUID | None = None
    created_at: datetime
    updated_at: datetime
