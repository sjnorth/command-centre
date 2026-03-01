import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.database import get_supabase
from app.schemas.analysis import AnalysisResponse
from app.schemas.reflections import ReflectionCreate, ReflectionRead, ReflectionUpdate
from app.services.claude import analyze_reflection

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/reflections", tags=["reflections"])


@router.get("/", response_model=list[ReflectionRead])
def list_reflections(
    limit: int = 50,
    offset: int = 0,
    project_id: UUID | None = None,
    client_id: UUID | None = None,
    supabase: Client = Depends(get_supabase),
):
    query = supabase.table("reflections").select("*").order("created_at", desc=True)
    if project_id:
        query = query.eq("project_id", str(project_id))
    if client_id:
        query = query.eq("client_id", str(client_id))
    response = query.range(offset, offset + limit - 1).execute()
    return response.data


@router.get("/{reflection_id}", response_model=ReflectionRead)
def get_reflection(reflection_id: UUID, supabase: Client = Depends(get_supabase)):
    response = (
        supabase.table("reflections")
        .select("*")
        .eq("id", str(reflection_id))
        .single()
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Reflection not found")
    return response.data


@router.post("/", response_model=ReflectionRead, status_code=201)
def create_reflection(
    reflection: ReflectionCreate, supabase: Client = Depends(get_supabase)
):
    data = reflection.model_dump(exclude_none=True)
    # Convert UUIDs to strings for Supabase
    for key in ("project_id", "client_id"):
        if key in data:
            data[key] = str(data[key])
    response = supabase.table("reflections").insert(data).execute()
    return response.data[0]


@router.patch("/{reflection_id}", response_model=ReflectionRead)
def update_reflection(
    reflection_id: UUID,
    reflection: ReflectionUpdate,
    supabase: Client = Depends(get_supabase),
):
    data = reflection.model_dump(exclude_none=True)
    for key in ("project_id", "client_id"):
        if key in data:
            data[key] = str(data[key])
    response = (
        supabase.table("reflections")
        .update(data)
        .eq("id", str(reflection_id))
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Reflection not found")
    return response.data[0]


@router.delete("/{reflection_id}", status_code=204)
def delete_reflection(reflection_id: UUID, supabase: Client = Depends(get_supabase)):
    response = (
        supabase.table("reflections")
        .delete()
        .eq("id", str(reflection_id))
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Reflection not found")
    return None


@router.post("/{reflection_id}/analyze", response_model=AnalysisResponse)
def analyze_reflection_endpoint(
    reflection_id: UUID,
    supabase: Client = Depends(get_supabase),
):
    # 1. Fetch the reflection
    reflection_resp = (
        supabase.table("reflections")
        .select("*")
        .eq("id", str(reflection_id))
        .single()
        .execute()
    )
    if not reflection_resp.data:
        raise HTTPException(status_code=404, detail="Reflection not found")
    reflection = reflection_resp.data

    # 2. Fetch project and client names for context
    project_name: str | None = None
    client_name: str | None = None

    if reflection.get("project_id"):
        project_resp = (
            supabase.table("projects")
            .select("name")
            .eq("id", reflection["project_id"])
            .single()
            .execute()
        )
        if project_resp.data:
            project_name = project_resp.data["name"]

    if reflection.get("client_id"):
        client_resp = (
            supabase.table("clients")
            .select("name")
            .eq("id", reflection["client_id"])
            .single()
            .execute()
        )
        if client_resp.data:
            client_name = client_resp.data["name"]

    # 3. Call Claude API
    try:
        result = analyze_reflection(
            content=reflection["content"],
            project_name=project_name,
            client_name=client_name,
        )
    except Exception as exc:
        logger.exception("Claude API analysis failed")
        raise HTTPException(
            status_code=502,
            detail=f"Analysis failed: {exc}",
        ) from exc

    # 4. Update reflection with sentiment and summary
    update_resp = (
        supabase.table("reflections")
        .update({"sentiment": result.sentiment, "summary": result.summary})
        .eq("id", str(reflection_id))
        .execute()
    )
    updated_reflection = update_resp.data[0]

    # 5. Create action items
    created_items: list[dict] = []
    for item in result.action_items:
        action_data = {
            "title": item.title,
            "description": item.description,
            "priority": item.priority,
            "source": "ai_generated",
            "reflection_id": str(reflection_id),
        }
        if reflection.get("project_id"):
            action_data["project_id"] = reflection["project_id"]
        item_resp = (
            supabase.table("action_items").insert(action_data).execute()
        )
        created_items.append(item_resp.data[0])

    return AnalysisResponse(
        reflection=updated_reflection,
        action_items=created_items,
    )
