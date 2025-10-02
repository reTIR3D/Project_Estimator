"""CRUD operations for Industry."""

from typing import List, Optional
from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.crud.base import CRUDBase
from app.models.industry import Industry
from app.models.company import Company
from app.schemas.industry import IndustryCreate, IndustryUpdate


class CRUDIndustry(CRUDBase[Industry, IndustryCreate, IndustryUpdate]):
    """CRUD operations for Industry model."""

    async def get_active(
        self,
        db: AsyncSession,
        *,
        skip: int = 0,
        limit: int = 100
    ) -> List[Industry]:
        """Get all active (non-archived) industries."""
        result = await db.execute(
            select(Industry)
            .where(Industry.is_archived == False)
            .order_by(Industry.display_order, Industry.name)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def get_with_companies(
        self,
        db: AsyncSession,
        id: UUID
    ) -> Optional[Industry]:
        """Get industry with all its companies loaded."""
        result = await db.execute(
            select(Industry)
            .options(selectinload(Industry.companies))
            .where(Industry.id == id)
        )
        return result.scalar_one_or_none()

    async def get_by_name(
        self,
        db: AsyncSession,
        name: str
    ) -> Optional[Industry]:
        """Get industry by name."""
        result = await db.execute(
            select(Industry).where(Industry.name == name)
        )
        return result.scalar_one_or_none()

    async def archive(
        self,
        db: AsyncSession,
        *,
        id: UUID
    ) -> Optional[Industry]:
        """Archive an industry (soft delete)."""
        industry = await self.get(db, id=id)
        if industry:
            industry.is_archived = True
            db.add(industry)
            await db.flush()
            await db.refresh(industry)
        return industry

    async def unarchive(
        self,
        db: AsyncSession,
        *,
        id: UUID
    ) -> Optional[Industry]:
        """Unarchive an industry."""
        industry = await self.get(db, id=id)
        if industry:
            industry.is_archived = False
            db.add(industry)
            await db.flush()
            await db.refresh(industry)
        return industry

    async def get_company_count(
        self,
        db: AsyncSession,
        industry_id: UUID
    ) -> int:
        """Get count of companies in an industry."""
        result = await db.execute(
            select(func.count(Company.id))
            .where(Company.industry_id == industry_id)
        )
        return result.scalar() or 0


# Create instance
industry = CRUDIndustry(Industry)
