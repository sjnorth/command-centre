from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.database import get_supabase
from app.schemas.clients import ClientCreate, ClientRead, ClientUpdate

router = APIRouter(prefix="/clients", tags=["clients"])


@router.get("/", response_model=list[ClientRead])
def list_clients(
    limit: int = 50,
    offset: int = 0,
    supabase: Client = Depends(get_supabase),
):
    response = (
        supabase.table("clients")
        .select("*")
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return response.data


@router.get("/{client_id}", response_model=ClientRead)
def get_client(client_id: UUID, supabase: Client = Depends(get_supabase)):
    response = (
        supabase.table("clients")
        .select("*")
        .eq("id", str(client_id))
        .single()
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Client not found")
    return response.data


@router.post("/", response_model=ClientRead, status_code=201)
def create_client(client: ClientCreate, supabase: Client = Depends(get_supabase)):
    response = (
        supabase.table("clients")
        .insert(client.model_dump(exclude_none=True))
        .execute()
    )
    return response.data[0]


@router.patch("/{client_id}", response_model=ClientRead)
def update_client(
    client_id: UUID,
    client: ClientUpdate,
    supabase: Client = Depends(get_supabase),
):
    response = (
        supabase.table("clients")
        .update(client.model_dump(exclude_none=True))
        .eq("id", str(client_id))
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Client not found")
    return response.data[0]


@router.delete("/{client_id}", status_code=204)
def delete_client(client_id: UUID, supabase: Client = Depends(get_supabase)):
    response = (
        supabase.table("clients")
        .delete()
        .eq("id", str(client_id))
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Client not found")
    return None
