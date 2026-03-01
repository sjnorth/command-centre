from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel


class TravelPlanCreate(BaseModel):
    destination: str
    start_date: date | None = None
    end_date: date | None = None
    purpose: str | None = None
    notes: str | None = None


class TravelPlanUpdate(BaseModel):
    destination: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    purpose: str | None = None
    notes: str | None = None


class TravelPlanRead(BaseModel):
    id: UUID
    destination: str
    start_date: date | None = None
    end_date: date | None = None
    purpose: str | None = None
    notes: str | None = None
    created_at: datetime
    updated_at: datetime
