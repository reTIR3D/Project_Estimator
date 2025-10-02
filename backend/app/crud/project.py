"""Project CRUD operations."""

from typing import List, Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.base import CRUDBase
from app.models.project import Project, ProjectStatus
from app.schemas.project import ProjectCreate, ProjectUpdate


class CRUDProject(CRUDBase[Project, ProjectCreate, ProjectUpdate]):
    """CRUD operations for Project model."""

    async def get_by_code(
        self,
        db: AsyncSession,
        *,
        project_code: str
    ) -> Optional[Project]:
        """Get project by project code."""
        result = await db.execute(
            select(Project).where(Project.project_code == project_code)
        )
        return result.scalar_one_or_none()

    async def get_by_user(
        self,
        db: AsyncSession,
        *,
        user_id: UUID,
        skip: int = 0,
        limit: int = 100
    ) -> List[Project]:
        """Get projects created by user."""
        result = await db.execute(
            select(Project)
            .where(Project.created_by == user_id)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def get_by_status(
        self,
        db: AsyncSession,
        *,
        status: ProjectStatus,
        skip: int = 0,
        limit: int = 100
    ) -> List[Project]:
        """Get projects by status."""
        result = await db.execute(
            select(Project)
            .where(Project.status == status)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()


project_crud = CRUDProject(Project)