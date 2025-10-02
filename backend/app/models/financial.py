"""Financial model."""

import enum
from sqlalchemy import Column, Enum, Float, ForeignKey, JSON, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base


class CostCategory(str, enum.Enum):
    """Cost category."""

    LABOR = "labor"
    OVERHEAD = "overhead"
    MATERIALS = "materials"
    EQUIPMENT = "equipment"
    SUBCONTRACTOR = "subcontractor"
    TRAVEL = "travel"
    CONTINGENCY = "contingency"
    MANAGEMENT_RESERVE = "management_reserve"


class FinancialBreakdown(Base):
    """Financial breakdown for project."""

    __tablename__ = "financial_breakdowns"

    # Project reference
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False, unique=True)

    # Currency
    currency = Column(String(3), default="USD")

    # Labor costs
    labor_cost = Column(Numeric(15, 2), nullable=False, default=0)
    overhead_cost = Column(Numeric(15, 2), nullable=False, default=0)

    # Direct costs
    materials_cost = Column(Numeric(15, 2), default=0)
    equipment_cost = Column(Numeric(15, 2), default=0)
    subcontractor_cost = Column(Numeric(15, 2), default=0)
    travel_cost = Column(Numeric(15, 2), default=0)

    # Subtotals
    direct_cost = Column(Numeric(15, 2), nullable=False)
    indirect_cost = Column(Numeric(15, 2), nullable=False)

    # Markup and margin
    markup_percent = Column(Float, default=0)
    markup_amount = Column(Numeric(15, 2), default=0)

    # Reserves
    contingency_percent = Column(Float, default=15.0)
    contingency_amount = Column(Numeric(15, 2), default=0)
    management_reserve_percent = Column(Float, default=10.0)
    management_reserve_amount = Column(Numeric(15, 2), default=0)

    # Total
    total_cost = Column(Numeric(15, 2), nullable=False)
    total_price = Column(Numeric(15, 2), nullable=False)

    # Breakdown by role (stored as JSON)
    cost_by_role = Column(JSON, default={})

    # Breakdown by phase (stored as JSON)
    cost_by_phase = Column(JSON, default={})

    # Cash flow projection (stored as JSON)
    cash_flow = Column(JSON, default=[])

    # Relationships
    project = relationship("Project", back_populates="financial_breakdown")