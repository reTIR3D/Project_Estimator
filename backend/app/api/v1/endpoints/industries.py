"""Industry API endpoints."""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.crud.industry import industry as industry_crud
from app.crud.company import company as company_crud
from app.schemas.industry import (
    IndustryCreate,
    IndustryUpdate,
    IndustryResponse,
)
from app.schemas.company import CompanyResponse

router = APIRouter()


@router.get("/", response_model=List[IndustryResponse])
async def get_industries(
    skip: int = 0,
    limit: int = 100,
    include_archived: bool = False,
    db: AsyncSession = Depends(get_db),
):
    """Get all industries."""
    if include_archived:
        industries = await industry_crud.get_multi(db, skip=skip, limit=limit)
    else:
        industries = await industry_crud.get_active(db, skip=skip, limit=limit)

    # Add company count to each industry
    result = []
    for ind in industries:
        count = await industry_crud.get_company_count(db, ind.id)
        ind_dict = IndustryResponse.from_orm(ind).dict()
        ind_dict['company_count'] = count
        result.append(IndustryResponse(**ind_dict))

    return result


@router.get("/{industry_id}", response_model=IndustryResponse)
async def get_industry(
    industry_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific industry."""
    industry = await industry_crud.get(db, industry_id)
    if not industry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Industry not found"
        )
    return industry


@router.get("/{industry_id}/companies", response_model=List[CompanyResponse])
async def get_industry_companies(
    industry_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get all companies in an industry."""
    # Verify industry exists
    industry = await industry_crud.get(db, industry_id)
    if not industry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Industry not found"
        )

    companies = await company_crud.get_by_industry(db, industry_id)

    # Add rate sheet count to each company
    result = []
    for comp in companies:
        count = await company_crud.get_rate_sheet_count(db, comp.id)
        comp_dict = CompanyResponse.from_orm(comp).dict()
        comp_dict['rate_sheet_count'] = count
        result.append(CompanyResponse(**comp_dict))

    return result


@router.post("/", response_model=IndustryResponse, status_code=status.HTTP_201_CREATED)
async def create_industry(
    industry_in: IndustryCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new industry."""
    # Check if industry with same name already exists
    existing = await industry_crud.get_by_name(db, industry_in.name)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Industry with this name already exists"
        )

    industry = await industry_crud.create(db, obj_in=industry_in)
    await db.commit()
    return industry


@router.patch("/{industry_id}", response_model=IndustryResponse)
async def update_industry(
    industry_id: UUID,
    industry_in: IndustryUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update an industry."""
    industry = await industry_crud.get(db, industry_id)
    if not industry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Industry not found"
        )

    # Check if new name conflicts with existing industry
    if industry_in.name and industry_in.name != industry.name:
        existing = await industry_crud.get_by_name(db, industry_in.name)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Industry with this name already exists"
            )

    industry = await industry_crud.update(db, db_obj=industry, obj_in=industry_in)
    await db.commit()
    return industry


@router.post("/{industry_id}/archive", response_model=IndustryResponse)
async def archive_industry(
    industry_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Archive an industry (soft delete)."""
    industry = await industry_crud.archive(db, id=industry_id)
    if not industry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Industry not found"
        )
    await db.commit()
    return industry


@router.post("/{industry_id}/unarchive", response_model=IndustryResponse)
async def unarchive_industry(
    industry_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Unarchive an industry."""
    industry = await industry_crud.unarchive(db, id=industry_id)
    if not industry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Industry not found"
        )
    await db.commit()
    return industry


@router.delete("/{industry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_industry(
    industry_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Delete an industry permanently."""
    # Check if industry has companies
    count = await industry_crud.get_company_count(db, industry_id)
    if count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete industry with {count} companies. Archive instead or delete companies first."
        )

    industry = await industry_crud.delete(db, id=industry_id)
    if not industry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Industry not found"
        )
    await db.commit()
