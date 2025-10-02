"""Rate sheet API endpoints."""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.crud.rate_sheet import rate_sheet as rate_sheet_crud
from app.crud.company import company as company_crud
from app.schemas.rate_sheet import (
    RateSheetCreate,
    RateSheetUpdate,
    RateSheetResponse,
    RateSheetClone,
)

router = APIRouter()


@router.get("/", response_model=List[RateSheetResponse])
async def get_rate_sheets(
    company_id: UUID = None,
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
):
    """Get rate sheets, optionally filtered by company."""
    if company_id:
        rate_sheets = await rate_sheet_crud.get_by_company(
            db, company_id, skip=skip, limit=limit, active_only=active_only
        )
    else:
        rate_sheets = await rate_sheet_crud.get_multi(db, skip=skip, limit=limit)

    # Convert to Pydantic models to ensure proper serialization including rate_entries
    result = []
    for rs in rate_sheets:
        validated = RateSheetResponse.model_validate(rs)
        print(f"Validated model has rate_entries: {hasattr(validated, 'rate_entries')}")
        print(f"Rate entries length: {len(validated.rate_entries) if validated.rate_entries else 0}")
        result.append(validated)
    return result


@router.get("/{rate_sheet_id}", response_model=RateSheetResponse)
async def get_rate_sheet(
    rate_sheet_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific rate sheet."""
    rate_sheet = await rate_sheet_crud.get(db, rate_sheet_id)
    if not rate_sheet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rate sheet not found"
        )
    return rate_sheet


@router.get("/company/{company_id}/default", response_model=RateSheetResponse)
async def get_default_rate_sheet(
    company_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get the default rate sheet for a company."""
    rate_sheet = await rate_sheet_crud.get_default(db, company_id)
    if not rate_sheet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No default rate sheet found for this company"
        )
    return rate_sheet


@router.post("/", response_model=RateSheetResponse, status_code=status.HTTP_201_CREATED)
async def create_rate_sheet(
    rate_sheet_in: RateSheetCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new rate sheet."""
    # Verify company exists
    company = await company_crud.get(db, rate_sheet_in.company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )

    rate_sheet = await rate_sheet_crud.create(db, obj_in=rate_sheet_in)

    # If this is set as default, unset others
    if rate_sheet_in.is_default:
        await rate_sheet_crud.set_default(db, rate_sheet_id=rate_sheet.id)

    await db.commit()
    return rate_sheet


@router.patch("/{rate_sheet_id}", response_model=RateSheetResponse)
async def update_rate_sheet(
    rate_sheet_id: UUID,
    rate_sheet_in: RateSheetUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update a rate sheet."""
    rate_sheet = await rate_sheet_crud.get(db, rate_sheet_id)
    if not rate_sheet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rate sheet not found"
        )

    rate_sheet = await rate_sheet_crud.update(db, db_obj=rate_sheet, obj_in=rate_sheet_in)

    # If setting as default, unset others
    if rate_sheet_in.is_default:
        await rate_sheet_crud.set_default(db, rate_sheet_id=rate_sheet.id)

    await db.commit()
    return rate_sheet


@router.post("/{rate_sheet_id}/set-default", response_model=RateSheetResponse)
async def set_default_rate_sheet(
    rate_sheet_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Set a rate sheet as the default for its company."""
    rate_sheet = await rate_sheet_crud.set_default(db, rate_sheet_id=rate_sheet_id)
    if not rate_sheet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rate sheet not found"
        )
    await db.commit()
    return rate_sheet


@router.post("/{rate_sheet_id}/clone", response_model=RateSheetResponse, status_code=status.HTTP_201_CREATED)
async def clone_rate_sheet(
    rate_sheet_id: UUID,
    clone_data: RateSheetClone,
    db: AsyncSession = Depends(get_db),
):
    """Clone a rate sheet to same or different company."""
    # Verify source rate sheet exists
    source = await rate_sheet_crud.get(db, rate_sheet_id)
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source rate sheet not found"
        )

    # Verify target company exists if specified
    if clone_data.target_company_id:
        company = await company_crud.get(db, clone_data.target_company_id)
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target company not found"
            )

    rate_sheet = await rate_sheet_crud.clone(db, source_id=rate_sheet_id, clone_data=clone_data)
    await db.commit()
    return rate_sheet


@router.delete("/{rate_sheet_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_rate_sheet(
    rate_sheet_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Delete a rate sheet permanently."""
    rate_sheet = await rate_sheet_crud.delete(db, id=rate_sheet_id)
    if not rate_sheet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rate sheet not found"
        )
    await db.commit()
