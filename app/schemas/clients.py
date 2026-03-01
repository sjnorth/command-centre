from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ClientCreate(BaseModel):
    name: str
    email: str | None = None
    phone: str | None = None
    company: str | None = None
    notes: str | None = None


class ClientUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    company: str | None = None
    notes: str | None = None


class ClientRead(BaseModel):
    id: UUID
    name: str
    email: str | None = None
    phone: str | None = None
    company: str | None = None
    notes: str | None = None
    created_at: datetime
    updated_at: datetime
