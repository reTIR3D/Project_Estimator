"""Resource CRUD operations."""

from typing import List
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.base import CRUDBase
from app.models.resource import Resource
from app.schemas.resource import ResourceCreate, ResourceUpdate


class CRUDResource(CRUDBase[Resource, ResourceCreate, ResourceUpdate]):
    """CRUD operations for Resource model."""

    async def get_by_project(
        self,
        db: AsyncSession,
        *,
        project_id: UUID
    ) -> List[Resource]:
        """Get all resources for a project."""
        result = await db.execute(
            select(Resource).where(Resource.project_id == project_id)
        )
        return result.scalars().all()

    async def get_by_user(
        self,
        db: AsyncSession,
        *,
        user_id: UUID
    ) -> List[Resource]:
        """Get all resource allocations for a user."""
        result = await db.execute(
            select(Resource).where(Resource.user_id == user_id)
        )
        return result.scalars().all()


resource_crud = CRUDResource(Resource)