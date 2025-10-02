"""Company API endpoints."""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.crud.company import company as company_crud
from app.crud.industry import industry as industry_crud
from app.crud.rate_sheet import rate_sheet as rate_sheet_crud
from app.schemas.company import (
    CompanyCreate,
    CompanyUpdate,
    CompanyResponse,
    CompanyClone,
)
from app.schemas.rate_sheet import RateSheetResponse

router = APIRouter()


@router.get("/", response_model=List[CompanyResponse])
async def get_companies(
    industry_id: UUID = None,
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
):
    """Get companies, optionally filtered by industry."""
    if industry_id:
        companies = await company_crud.get_by_industry(
            db, industry_id, skip=skip, limit=limit, active_only=active_only
        )
    else:
        companies = await company_crud.get_multi(db, skip=skip, limit=limit)

    # Add rate sheet count to each company
    result = []
    for comp in companies:
        count = await company_crud.get_rate_sheet_count(db, comp.id)
        comp_dict = CompanyResponse.model_validate(comp).model_dump()
        comp_dict['rate_sheet_count'] = count
        result.append(CompanyResponse(**comp_dict))

    return result


@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(
    company_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific company."""
    company = await company_crud.get(db, company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    return company


@router.get("/{company_id}/rate-sheets", response_model=List[RateSheetResponse])
async def get_company_rate_sheets(
    company_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get all rate sheets for a company."""
    # Verify company exists
    company = await company_crud.get(db, company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )

    rate_sheets = await rate_sheet_crud.get_by_company(db, company_id)
    return rate_sheets


@router.post("/", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
async def create_company(
    company_in: CompanyCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new company."""
    # Verify industry exists
    industry = await industry_crud.get(db, company_in.industry_id)
    if not industry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Industry not found"
        )

    # Check if company code already exists (if provided)
    if company_in.code:
        existing = await company_crud.get_by_code(db, company_in.code)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Company with this code already exists"
            )

    company = await company_crud.create(db, obj_in=company_in)
    await db.commit()
    return company


@router.patch("/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_id: UUID,
    company_in: CompanyUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update a company."""
    company = await company_crud.get(db, company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )

    # Verify new industry exists if being changed
    if company_in.industry_id:
        industry = await industry_crud.get(db, company_in.industry_id)
        if not industry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Industry not found"
            )

    # Check if new code conflicts with existing company
    if company_in.code and company_in.code != company.code:
        existing = await company_crud.get_by_code(db, company_in.code)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Company with this code already exists"
            )

    company = await company_crud.update(db, db_obj=company, obj_in=company_in)
    await db.commit()
    return company


@router.post("/{company_id}/clone", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
async def clone_company(
    company_id: UUID,
    clone_data: CompanyClone,
    db: AsyncSession = Depends(get_db),
):
    """Clone a company with optional rate sheets."""
    # Verify source company exists
    source = await company_crud.get(db, company_id)
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source company not found"
        )

    # Verify target industry exists if specified
    if clone_data.target_industry_id:
        industry = await industry_crud.get(db, clone_data.target_industry_id)
        if not industry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target industry not found"
            )

    # Check if new code conflicts (if provided)
    if clone_data.new_code:
        existing = await company_crud.get_by_code(db, clone_data.new_code)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Company with this code already exists"
            )

    company = await company_crud.clone(db, source_id=company_id, clone_data=clone_data)
    await db.commit()
    return company


@router.delete("/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_company(
    company_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Delete a company permanently."""
    # Check if company has rate sheets
    count = await company_crud.get_rate_sheet_count(db, company_id)
    if count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete company with {count} rate sheets. Set inactive or delete rate sheets first."
        )

    company = await company_crud.delete(db, id=company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    await db.commit()
