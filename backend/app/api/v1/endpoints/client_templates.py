"""Client template management endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.models.client_template import ClientTemplate
from app.schemas.client_template import (
    ClientTemplateCreate,
    ClientTemplateUpdate,
    ClientTemplateResponse,
    ClientTemplateListResponse,
)

router = APIRouter()


@router.get("/", response_model=ClientTemplateListResponse)
async def list_templates(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
):
    """List all client templates."""
    query = select(ClientTemplate)

    if active_only:
        query = query.where(ClientTemplate.is_active == True)

    # Get total count
    count_query = select(ClientTemplate).where(ClientTemplate.is_active == True) if active_only else select(ClientTemplate)
    result = await db.execute(count_query)
    total = len(result.scalars().all())

    # Get paginated templates
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    templates = result.scalars().all()

    return ClientTemplateListResponse(templates=list(templates), total=total)


@router.post("/", response_model=ClientTemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_template(
    template_in: ClientTemplateCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new client template."""
    # Check if template with same name exists
    result = await db.execute(select(ClientTemplate).where(ClientTemplate.name == template_in.name))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Template with this name already exists"
        )

    template = ClientTemplate(**template_in.dict())
    db.add(template)
    await db.commit()
    await db.refresh(template)

    return template


@router.get("/{template_id}", response_model=ClientTemplateResponse)
async def get_template(
    template_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific client template."""
    result = await db.execute(select(ClientTemplate).where(ClientTemplate.id == template_id))
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )

    return template


@router.put("/{template_id}", response_model=ClientTemplateResponse)
async def update_template(
    template_id: UUID,
    template_in: ClientTemplateUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update a client template."""
    result = await db.execute(select(ClientTemplate).where(ClientTemplate.id == template_id))
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )

    # Check name uniqueness if being updated
    if template_in.name and template_in.name != template.name:
        result = await db.execute(select(ClientTemplate).where(ClientTemplate.name == template_in.name))
        existing = result.scalar_one_or_none()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Template with this name already exists"
            )

    # Update fields
    update_data = template_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(template, field, value)

    await db.commit()
    await db.refresh(template)

    return template


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(
    template_id: UUID,
    hard_delete: bool = False,
    db: AsyncSession = Depends(get_db),
):
    """Delete a client template (soft delete by default)."""
    result = await db.execute(select(ClientTemplate).where(ClientTemplate.id == template_id))
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )

    if hard_delete:
        await db.delete(template)
    else:
        template.is_active = False

    await db.commit()

    return None
