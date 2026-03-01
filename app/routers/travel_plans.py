from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.database import get_supabase
from app.schemas.travel_plans import TravelPlanCreate, TravelPlanRead, TravelPlanUpdate

router = APIRouter(prefix="/travel-plans", tags=["travel plans"])


@router.get("/", response_model=list[TravelPlanRead])
def list_travel_plans(
    limit: int = 50,
    offset: int = 0,
    supabase: Client = Depends(get_supabase),
):
    response = (
        supabase.table("travel_plans")
        .select("*")
        .order("start_date", desc=False)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return response.data


@router.get("/{plan_id}", response_model=TravelPlanRead)
def get_travel_plan(plan_id: UUID, supabase: Client = Depends(get_supabase)):
    response = (
        supabase.table("travel_plans")
        .select("*")
        .eq("id", str(plan_id))
        .single()
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Travel plan not found")
    return response.data


@router.post("/", response_model=TravelPlanRead, status_code=201)
def create_travel_plan(
    plan: TravelPlanCreate, supabase: Client = Depends(get_supabase)
):
    data = plan.model_dump(exclude_none=True)
    for key in ("start_date", "end_date"):
        if key in data:
            data[key] = data[key].isoformat()
    response = supabase.table("travel_plans").insert(data).execute()
    return response.data[0]


@router.patch("/{plan_id}", response_model=TravelPlanRead)
def update_travel_plan(
    plan_id: UUID,
    plan: TravelPlanUpdate,
    supabase: Client = Depends(get_supabase),
):
    data = plan.model_dump(exclude_none=True)
    for key in ("start_date", "end_date"):
        if key in data:
            data[key] = data[key].isoformat()
    response = (
        supabase.table("travel_plans")
        .update(data)
        .eq("id", str(plan_id))
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Travel plan not found")
    return response.data[0]


@router.delete("/{plan_id}", status_code=204)
def delete_travel_plan(plan_id: UUID, supabase: Client = Depends(get_supabase)):
    response = (
        supabase.table("travel_plans")
        .delete()
        .eq("id", str(plan_id))
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Travel plan not found")
    return None
