"""Deliverable template API endpoints."""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.crud.deliverable_template import deliverable_template as template_crud
from app.crud.company import company as company_crud
from app.schemas.deliverable_template import (
    DeliverableTemplateCreate,
    DeliverableTemplateUpdate,
    DeliverableTemplateResponse,
)

router = APIRouter()


@router.get("/", response_model=List[DeliverableTemplateResponse])
async def get_deliverable_templates(
    company_id: UUID = None,
    project_size: str = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    """Get deliverable templates, optionally filtered by company and/or project size."""
    templates = await template_crud.get_multi(
        db,
        company_id=company_id,
        project_size=project_size,
        skip=skip,
        limit=limit
    )
    return templates


@router.get("/{template_id}", response_model=DeliverableTemplateResponse)
async def get_deliverable_template(
    template_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific deliverable template."""
    template = await template_crud.get(db, template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deliverable template not found"
        )
    return template


@router.post("/", response_model=DeliverableTemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_deliverable_template(
    template_in: DeliverableTemplateCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new deliverable template."""
    # Verify company exists
    company = await company_crud.get(db, template_in.company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )

    # If setting as default, unset other defaults for this company/size combo
    if template_in.is_default:
        await template_crud.unset_defaults(
            db,
            company_id=template_in.company_id,
            project_size=template_in.project_size,
            discipline=template_in.discipline
        )

    template = await template_crud.create(db, obj_in=template_in)
    await db.commit()
    return template


@router.patch("/{template_id}", response_model=DeliverableTemplateResponse)
async def update_deliverable_template(
    template_id: UUID,
    template_in: DeliverableTemplateUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update a deliverable template."""
    template = await template_crud.get(db, template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deliverable template not found"
        )

    # If setting as default, unset other defaults for this company/size combo
    if template_in.is_default:
        await template_crud.unset_defaults(
            db,
            company_id=template.company_id,
            project_size=template.project_size,
            discipline=template.discipline
        )

    template = await template_crud.update(db, db_obj=template, obj_in=template_in)
    await db.commit()
    return template


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_deliverable_template(
    template_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Delete a deliverable template."""
    template = await template_crud.delete(db, id=template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deliverable template not found"
        )
    await db.commit()
