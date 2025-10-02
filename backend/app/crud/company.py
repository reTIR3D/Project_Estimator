"""CRUD operations for Company."""

from typing import List, Optional
from uuid import UUID
import uuid
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.crud.base import CRUDBase
from app.models.company import Company
from app.models.rate_sheet import RateSheet
from app.schemas.company import CompanyCreate, CompanyUpdate, CompanyClone


class CRUDCompany(CRUDBase[Company, CompanyCreate, CompanyUpdate]):
    """CRUD operations for Company model."""

    async def get_by_industry(
        self,
        db: AsyncSession,
        industry_id: UUID,
        *,
        skip: int = 0,
        limit: int = 100,
        active_only: bool = True
    ) -> List[Company]:
        """Get all companies in an industry."""
        query = select(Company).where(Company.industry_id == industry_id)

        if active_only:
            query = query.where(Company.is_active == True)

        query = query.order_by(Company.name).offset(skip).limit(limit)

        result = await db.execute(query)
        return result.scalars().all()

    async def get_with_rate_sheets(
        self,
        db: AsyncSession,
        id: UUID
    ) -> Optional[Company]:
        """Get company with all its rate sheets loaded."""
        result = await db.execute(
            select(Company)
            .options(selectinload(Company.rate_sheets))
            .where(Company.id == id)
        )
        return result.scalar_one_or_none()

    async def get_by_code(
        self,
        db: AsyncSession,
        code: str
    ) -> Optional[Company]:
        """Get company by code."""
        result = await db.execute(
            select(Company).where(Company.code == code)
        )
        return result.scalar_one_or_none()

    async def get_rate_sheet_count(
        self,
        db: AsyncSession,
        company_id: UUID
    ) -> int:
        """Get count of rate sheets for a company."""
        result = await db.execute(
            select(func.count(RateSheet.id))
            .where(RateSheet.company_id == company_id)
        )
        return result.scalar() or 0

    async def clone(
        self,
        db: AsyncSession,
        *,
        source_id: UUID,
        clone_data: CompanyClone
    ) -> Optional[Company]:
        """
        Clone a company with optional rate sheets.

        Args:
            db: Database session
            source_id: ID of company to clone
            clone_data: Clone configuration

        Returns:
            Cloned company instance
        """
        # Get source company with rate sheets
        source = await self.get_with_rate_sheets(db, source_id)
        if not source:
            return None

        # Create new company
        new_company = Company(
            id=uuid.uuid4(),
            industry_id=clone_data.target_industry_id or source.industry_id,
            name=clone_data.new_name,
            code=clone_data.new_code,
            description=source.description,
            contact_name=source.contact_name,
            contact_email=source.contact_email,
            contact_phone=source.contact_phone,
            client_type=source.client_type,
            is_active=True,
        )

        db.add(new_company)
        await db.flush()
        await db.refresh(new_company)

        # Clone rate sheets if requested
        if clone_data.clone_rate_sheets and source.rate_sheets:
            for rate_sheet in source.rate_sheets:
                new_rate_sheet = RateSheet(
                    id=uuid.uuid4(),
                    company_id=new_company.id,
                    name=rate_sheet.name,
                    description=rate_sheet.description,
                    rates=rate_sheet.rates.copy() if rate_sheet.rates else {},
                    is_default=rate_sheet.is_default,
                    is_active=rate_sheet.is_active,
                )
                db.add(new_rate_sheet)

            await db.flush()

        return new_company


# Create instance
company = CRUDCompany(Company)
