from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.database import get_supabase
from app.schemas.action_items import (
    ActionItemCreate,
    ActionItemPriority,
    ActionItemRead,
    ActionItemStatus,
    ActionItemUpdate,
)

router = APIRouter(prefix="/action-items", tags=["action items"])


@router.get("/", response_model=list[ActionItemRead])
def list_action_items(
    limit: int = 50,
    offset: int = 0,
    status: ActionItemStatus | None = None,
    priority: ActionItemPriority | None = None,
    project_id: UUID | None = None,
    supabase: Client = Depends(get_supabase),
):
    query = (
        supabase.table("action_items").select("*").order("created_at", desc=True)
    )
    if status:
        query = query.eq("status", status.value)
    if priority:
        query = query.eq("priority", priority.value)
    if project_id:
        query = query.eq("project_id", str(project_id))
    response = query.range(offset, offset + limit - 1).execute()
    return response.data


@router.get("/{item_id}", response_model=ActionItemRead)
def get_action_item(item_id: UUID, supabase: Client = Depends(get_supabase)):
    response = (
        supabase.table("action_items")
        .select("*")
        .eq("id", str(item_id))
        .single()
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Action item not found")
    return response.data


@router.post("/", response_model=ActionItemRead, status_code=201)
def create_action_item(
    item: ActionItemCreate, supabase: Client = Depends(get_supabase)
):
    data = item.model_dump(exclude_none=True)
    for key in ("reflection_id", "project_id"):
        if key in data:
            data[key] = str(data[key])
    if "due_date" in data:
        data["due_date"] = data["due_date"].isoformat()
    response = supabase.table("action_items").insert(data).execute()
    return response.data[0]


@router.patch("/{item_id}", response_model=ActionItemRead)
def update_action_item(
    item_id: UUID,
    item: ActionItemUpdate,
    supabase: Client = Depends(get_supabase),
):
    data = item.model_dump(exclude_none=True)
    for key in ("reflection_id", "project_id"):
        if key in data:
            data[key] = str(data[key])
    if "due_date" in data:
        data["due_date"] = data["due_date"].isoformat()
    response = (
        supabase.table("action_items")
        .update(data)
        .eq("id", str(item_id))
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Action item not found")
    return response.data[0]


@router.delete("/{item_id}", status_code=204)
def delete_action_item(item_id: UUID, supabase: Client = Depends(get_supabase)):
    response = (
        supabase.table("action_items")
        .delete()
        .eq("id", str(item_id))
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Action item not found")
    return None
