"""Deliverable CRUD operations."""

from typing import List
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.base import CRUDBase
from app.models.deliverable import Deliverable
from app.schemas.deliverable import DeliverableCreate, DeliverableUpdate


class CRUDDeliverable(CRUDBase[Deliverable, DeliverableCreate, DeliverableUpdate]):
    """CRUD operations for Deliverable model."""

    async def get_by_project(
        self,
        db: AsyncSession,
        *,
        project_id: UUID
    ) -> List[Deliverable]:
        """Get all deliverables for a project."""
        result = await db.execute(
            select(Deliverable)
            .where(Deliverable.project_id == project_id)
            .order_by(Deliverable.sequence_number)
        )
        return result.scalars().all()


deliverable_crud = CRUDDeliverable(Deliverable)