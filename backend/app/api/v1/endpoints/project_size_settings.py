"""Project size settings API endpoints."""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.crud.project_size_settings import project_size_settings as settings_crud
from app.schemas.project_size_settings import (
    ProjectSizeSettingsCreate,
    ProjectSizeSettingsUpdate,
    ProjectSizeSettingsResponse,
    SizeRecommendation,
)

router = APIRouter()


@router.get("/", response_model=ProjectSizeSettingsResponse)
async def get_project_size_settings(
    db: AsyncSession = Depends(get_db),
):
    """Get the active project size settings (or create default if none exists)."""
    settings = await settings_crud.get_or_create_default(db)
    return settings


@router.post("/", response_model=ProjectSizeSettingsResponse, status_code=status.HTTP_201_CREATED)
async def create_project_size_settings(
    settings_in: ProjectSizeSettingsCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create new project size settings."""
    # If setting as active, deactivate others
    if settings_in.is_active:
        existing = await settings_crud.get_active_settings(db)
        if existing:
            await settings_crud.update(db, db_obj=existing, obj_in={"is_active": False})

    settings = await settings_crud.create(db, obj_in=settings_in)
    await db.commit()
    return settings


@router.patch("/{settings_id}", response_model=ProjectSizeSettingsResponse)
async def update_project_size_settings(
    settings_id: UUID,
    settings_in: ProjectSizeSettingsUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update project size settings."""
    settings = await settings_crud.get(db, settings_id)
    if not settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project size settings not found"
        )

    settings = await settings_crud.update(db, db_obj=settings, obj_in=settings_in)
    await db.commit()
    return settings


@router.post("/recommend", response_model=SizeRecommendation)
async def get_size_recommendation(
    current_size: str,
    total_hours: int,
    db: AsyncSession = Depends(get_db),
):
    """Get size recommendation based on total hours."""
    settings = await settings_crud.get_or_create_default(db)

    recommended_size = settings.get_size_for_hours(total_hours)
    is_appropriate = settings.is_size_appropriate(current_size, total_hours)

    message = None
    if not is_appropriate:
        if current_size == 'SMALL' and recommended_size != 'SMALL':
            message = f"⚠️ This project has {total_hours} hours. Consider changing from SMALL to {recommended_size}."
        elif current_size == 'MEDIUM' and recommended_size in ['LARGE', 'PHASE_GATE']:
            message = f"⚠️ This project has {total_hours} hours. Consider changing from MEDIUM to {recommended_size}."
        elif current_size == 'LARGE' and recommended_size == 'PHASE_GATE':
            message = f"⚠️ This project has {total_hours} hours. Consider changing from LARGE to PHASE_GATE."
        elif recommended_size == 'SMALL' and current_size != 'SMALL':
            message = f"💡 This project only has {total_hours} hours. You could classify it as SMALL."

    return SizeRecommendation(
        current_size=current_size,
        total_hours=total_hours,
        recommended_size=recommended_size,
        is_appropriate=is_appropriate,
        message=message
    )
