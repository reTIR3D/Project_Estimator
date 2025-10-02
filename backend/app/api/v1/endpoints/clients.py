"""Client management endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.models.client import Client
from app.schemas.client import (
    ClientCreate,
    ClientUpdate,
    ClientResponse,
    ClientListResponse,
    RateSheetUpdate,
)

router = APIRouter()


@router.get("/", response_model=ClientListResponse)
async def list_clients(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
):
    """List all clients."""
    query = select(Client)

    if active_only:
        query = query.where(Client.is_active == True)

    # Get total count
    count_query = select(Client).where(Client.is_active == True) if active_only else select(Client)
    result = await db.execute(count_query)
    total = len(result.scalars().all())

    # Get paginated clients
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    clients = result.scalars().all()

    return ClientListResponse(clients=list(clients), total=total)


@router.post("/", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
async def create_client(
    client_in: ClientCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new client."""
    # Check if client with same name exists
    result = await db.execute(select(Client).where(Client.name == client_in.name))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Client with this name already exists"
        )

    # Check if code is unique if provided
    if client_in.code:
        result = await db.execute(select(Client).where(Client.code == client_in.code))
        existing_code = result.scalar_one_or_none()
        if existing_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Client with this code already exists"
            )

    client = Client(**client_in.dict())
    db.add(client)
    await db.commit()
    await db.refresh(client)

    return client


@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(
    client_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific client."""
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )

    return client


@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: UUID,
    client_in: ClientUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update a client."""
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )

    # Check name uniqueness if being updated
    if client_in.name and client_in.name != client.name:
        result = await db.execute(select(Client).where(Client.name == client_in.name))
        existing = result.scalar_one_or_none()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Client with this name already exists"
            )

    # Check code uniqueness if being updated
    if client_in.code and client_in.code != client.code:
        result = await db.execute(select(Client).where(Client.code == client_in.code))
        existing_code = result.scalar_one_or_none()
        if existing_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Client with this code already exists"
            )

    # Update fields
    update_data = client_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(client, field, value)

    await db.commit()
    await db.refresh(client)

    return client


@router.patch("/{client_id}/rates", response_model=ClientResponse)
async def update_rate_sheet(
    client_id: UUID,
    rates_in: RateSheetUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update client rate sheet."""
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )

    client.custom_rates = rates_in.custom_rates
    await db.commit()
    await db.refresh(client)

    return client


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(
    client_id: UUID,
    hard_delete: bool = False,
    db: AsyncSession = Depends(get_db),
):
    """Delete a client (soft delete by default)."""
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )

    if hard_delete:
        await db.delete(client)
    else:
        client.is_active = False

    await db.commit()

    return None
