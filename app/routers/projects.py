from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.database import get_supabase
from app.schemas.clients import ClientRead
from app.schemas.projects import ProjectCreate, ProjectRead, ProjectUpdate

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("/", response_model=list[ProjectRead])
def list_projects(
    limit: int = 50,
    offset: int = 0,
    supabase: Client = Depends(get_supabase),
):
    response = (
        supabase.table("projects")
        .select("*")
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return response.data


@router.get("/{project_id}", response_model=ProjectRead)
def get_project(project_id: UUID, supabase: Client = Depends(get_supabase)):
    response = (
        supabase.table("projects")
        .select("*")
        .eq("id", str(project_id))
        .single()
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Project not found")
    return response.data


@router.post("/", response_model=ProjectRead, status_code=201)
def create_project(project: ProjectCreate, supabase: Client = Depends(get_supabase)):
    response = (
        supabase.table("projects")
        .insert(project.model_dump(exclude_none=True))
        .execute()
    )
    return response.data[0]


@router.patch("/{project_id}", response_model=ProjectRead)
def update_project(
    project_id: UUID,
    project: ProjectUpdate,
    supabase: Client = Depends(get_supabase),
):
    response = (
        supabase.table("projects")
        .update(project.model_dump(exclude_none=True))
        .eq("id", str(project_id))
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Project not found")
    return response.data[0]


@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: UUID, supabase: Client = Depends(get_supabase)):
    response = (
        supabase.table("projects")
        .delete()
        .eq("id", str(project_id))
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Project not found")
    return None


# --- Project-Client junction endpoints ---


@router.get("/{project_id}/clients", response_model=list[ClientRead])
def get_project_clients(project_id: UUID, supabase: Client = Depends(get_supabase)):
    response = (
        supabase.table("project_clients")
        .select("client_id, clients(*)")
        .eq("project_id", str(project_id))
        .execute()
    )
    return [row["clients"] for row in response.data]


@router.post("/{project_id}/clients/{client_id}", status_code=201)
def link_client_to_project(
    project_id: UUID,
    client_id: UUID,
    supabase: Client = Depends(get_supabase),
):
    supabase.table("project_clients").insert(
        {"project_id": str(project_id), "client_id": str(client_id)}
    ).execute()
    return {"project_id": str(project_id), "client_id": str(client_id)}


@router.delete("/{project_id}/clients/{client_id}", status_code=204)
def unlink_client_from_project(
    project_id: UUID,
    client_id: UUID,
    supabase: Client = Depends(get_supabase),
):
    supabase.table("project_clients").delete().eq(
        "project_id", str(project_id)
    ).eq("client_id", str(client_id)).execute()
    return None
