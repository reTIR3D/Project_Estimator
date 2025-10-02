"""CRUD operations for deliverable templates."""

from typing import List, Optional
from uuid import UUID
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.base import CRUDBase
from app.models.deliverable_template import DeliverableTemplate
from app.schemas.deliverable_template import DeliverableTemplateCreate, DeliverableTemplateUpdate


class CRUDDeliverableTemplate(CRUDBase[DeliverableTemplate, DeliverableTemplateCreate, DeliverableTemplateUpdate]):
    """CRUD operations for DeliverableTemplate."""

    async def get_multi(
        self,
        db: AsyncSession,
        *,
        company_id: Optional[UUID] = None,
        project_size: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[DeliverableTemplate]:
        """Get deliverable templates with optional filters."""
        query = select(self.model)

        if company_id:
            query = query.where(self.model.company_id == company_id)
        if project_size:
            query = query.where(self.model.project_size == project_size)

        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()

    async def get_by_company_and_size(
        self,
        db: AsyncSession,
        company_id: UUID,
        project_size: str,
        discipline: Optional[str] = None,
    ) -> List[DeliverableTemplate]:
        """Get templates for a specific company and project size."""
        query = select(self.model).where(
            self.model.company_id == company_id,
            self.model.project_size == project_size
        )

        if discipline:
            # Get templates for this discipline or null (applies to all)
            query = query.where(
                (self.model.discipline == discipline) |
                (self.model.discipline == None)
            )

        result = await db.execute(query)
        return result.scalars().all()

    async def get_default_template(
        self,
        db: AsyncSession,
        company_id: UUID,
        project_size: str,
        discipline: Optional[str] = None,
    ) -> Optional[DeliverableTemplate]:
        """Get the default template for a company/size/discipline combo."""
        query = select(self.model).where(
            self.model.company_id == company_id,
            self.model.project_size == project_size,
            self.model.is_default == True
        )

        if discipline:
            query = query.where(
                (self.model.discipline == discipline) |
                (self.model.discipline == None)
            )

        result = await db.execute(query)
        return result.scalars().first()

    async def unset_defaults(
        self,
        db: AsyncSession,
        company_id: UUID,
        project_size: str,
        discipline: Optional[str] = None,
    ) -> None:
        """Unset is_default for existing templates with same company/size/discipline."""
        query = (
            update(self.model)
            .where(
                self.model.company_id == company_id,
                self.model.project_size == project_size,
                self.model.is_default == True
            )
            .values(is_default=False)
        )

        if discipline:
            query = query.where(self.model.discipline == discipline)
        else:
            query = query.where(self.model.discipline == None)

        await db.execute(query)


deliverable_template = CRUDDeliverableTemplate(DeliverableTemplate)
