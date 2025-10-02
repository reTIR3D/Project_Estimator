"""CRUD operations for project size settings."""

from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.base import CRUDBase
from app.models.project_size_settings import ProjectSizeSettings
from app.schemas.project_size_settings import ProjectSizeSettingsCreate, ProjectSizeSettingsUpdate


class CRUDProjectSizeSettings(CRUDBase[ProjectSizeSettings, ProjectSizeSettingsCreate, ProjectSizeSettingsUpdate]):
    """CRUD operations for ProjectSizeSettings."""

    async def get_active_settings(self, db: AsyncSession) -> Optional[ProjectSizeSettings]:
        """Get the active project size settings."""
        query = select(self.model).where(self.model.is_active == True)
        result = await db.execute(query)
        return result.scalars().first()

    async def get_or_create_default(self, db: AsyncSession) -> ProjectSizeSettings:
        """Get active settings or create default if none exists."""
        settings = await self.get_active_settings(db)
        if not settings:
            # Create default settings
            default_settings = ProjectSizeSettingsCreate(
                small_min_hours=0,
                small_max_hours=500,
                medium_min_hours=501,
                medium_max_hours=2000,
                large_min_hours=2001,
                large_max_hours=10000,
                phase_gate_recommendation_hours=5000,
                auto_adjust_project_size=False,
                warn_on_size_mismatch=True,
                recommend_phase_gate=True,
                is_active=True
            )
            settings = await self.create(db, obj_in=default_settings)
            await db.commit()
        return settings


project_size_settings = CRUDProjectSizeSettings(ProjectSizeSettings)
