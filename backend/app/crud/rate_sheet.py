"""CRUD operations for RateSheet."""

from typing import List, Optional
from uuid import UUID
import uuid
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.base import CRUDBase
from app.models.rate_sheet import RateSheet
from app.schemas.rate_sheet import RateSheetCreate, RateSheetUpdate, RateSheetClone


class CRUDRateSheet(CRUDBase[RateSheet, RateSheetCreate, RateSheetUpdate]):
    """CRUD operations for RateSheet model."""

    async def get_by_company(
        self,
        db: AsyncSession,
        company_id: UUID,
        *,
        skip: int = 0,
        limit: int = 100,
        active_only: bool = True
    ) -> List[RateSheet]:
        """Get all rate sheets for a company."""
        query = select(RateSheet).where(RateSheet.company_id == company_id)

        if active_only:
            query = query.where(RateSheet.is_active == True)

        query = query.order_by(RateSheet.is_default.desc(), RateSheet.name).offset(skip).limit(limit)

        result = await db.execute(query)
        return result.scalars().all()

    async def get_default(
        self,
        db: AsyncSession,
        company_id: UUID
    ) -> Optional[RateSheet]:
        """Get the default rate sheet for a company."""
        result = await db.execute(
            select(RateSheet).where(
                and_(
                    RateSheet.company_id == company_id,
                    RateSheet.is_default == True,
                    RateSheet.is_active == True
                )
            )
        )
        return result.scalar_one_or_none()

    async def set_default(
        self,
        db: AsyncSession,
        *,
        rate_sheet_id: UUID
    ) -> Optional[RateSheet]:
        """
        Set a rate sheet as the default for its company.
        Unsets any other default rate sheets for the same company.
        """
        rate_sheet = await self.get(db, rate_sheet_id)
        if not rate_sheet:
            return None

        # Unset other defaults for this company
        result = await db.execute(
            select(RateSheet).where(
                and_(
                    RateSheet.company_id == rate_sheet.company_id,
                    RateSheet.is_default == True,
                    RateSheet.id != rate_sheet_id
                )
            )
        )
        other_defaults = result.scalars().all()
        for other in other_defaults:
            other.is_default = False
            db.add(other)

        # Set this one as default
        rate_sheet.is_default = True
        db.add(rate_sheet)
        await db.flush()
        await db.refresh(rate_sheet)

        return rate_sheet

    async def clone(
        self,
        db: AsyncSession,
        *,
        source_id: UUID,
        clone_data: RateSheetClone
    ) -> Optional[RateSheet]:
        """
        Clone a rate sheet to same or different company.

        Args:
            db: Database session
            source_id: ID of rate sheet to clone
            clone_data: Clone configuration

        Returns:
            Cloned rate sheet instance
        """
        # Get source rate sheet
        source = await self.get(db, source_id)
        if not source:
            return None

        # Create new rate sheet
        new_rate_sheet = RateSheet(
            id=uuid.uuid4(),
            company_id=clone_data.target_company_id or source.company_id,
            name=clone_data.new_name,
            description=clone_data.new_description or source.description,
            rates=source.rates.copy() if source.rates else {},
            is_default=False,  # Never clone as default
            is_active=True,
        )

        db.add(new_rate_sheet)
        await db.flush()
        await db.refresh(new_rate_sheet)

        return new_rate_sheet


# Create instance
rate_sheet = CRUDRateSheet(RateSheet)
