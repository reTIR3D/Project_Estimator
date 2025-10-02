"""Estimation schemas."""

from typing import Dict, Optional, List, Any
from pydantic import Field

from app.schemas.base import BaseSchema
from app.models.project import ProjectSize, ClientProfile


class EstimationRequest(BaseSchema):
    """Schema for estimation request."""

    project_size: ProjectSize
    complexity_factors: Dict[str, bool] = Field(default_factory=dict)
    client_profile: ClientProfile
    resource_availability: Dict[str, float] = Field(default_factory=dict)
    contingency_percent: float = Field(default=15.0, ge=0, le=100)
    overhead_percent: float = Field(default=10.0, ge=0, le=100)
    base_hours_override: Optional[int] = Field(None, description="Override base hours with deliverables total")
    client_complexity: int = Field(default=5, ge=1, le=10, description="Client complexity rating (1-10)")


class EstimationResponse(BaseSchema):
    """Schema for estimation response."""

    base_hours: int
    complexity_multiplier: float
    client_multiplier: float
    adjusted_hours: int
    contingency_hours: int
    overhead_hours: int
    total_hours: int
    duration_weeks: int
    confidence_level: str
    confidence_score: float


class ComplexityFactorInfo(BaseSchema):
    """Schema for complexity factor information."""

    value: float
    description: str
    impact_percent: int


class ComplexityFactorsResponse(BaseSchema):
    """Schema for all complexity factors."""

    factors: Dict[str, ComplexityFactorInfo]


class DeliverableInput(BaseSchema):
    """Schema for deliverable input to cost calculation."""

    name: str
    hours: int


class CostCalculationRequest(BaseSchema):
    """Schema for cost calculation request."""

    deliverables: List[DeliverableInput]
    custom_rates: Optional[Dict[str, float]] = None


class RoleBreakdown(BaseSchema):
    """Schema for role-based hour and cost breakdown."""

    role: str
    hours: int
    cost: float


class DeliverableCostBreakdown(BaseSchema):
    """Schema for deliverable cost breakdown."""

    deliverable_name: str
    total_hours: int
    total_cost: float
    role_breakdown: List[RoleBreakdown]


class RoleSummary(BaseSchema):
    """Schema for role summary across all deliverables."""

    role: str
    hours: int
    cost: float
    percentage: float


class CostSummary(BaseSchema):
    """Schema for cost summary."""

    total_hours: int
    total_cost: float
    deliverable_count: int
    average_cost_per_hour: float


class CostCalculationResponse(BaseSchema):
    """Schema for cost calculation response."""

    summary: CostSummary
    by_role: List[RoleSummary]
    by_deliverable: List[DeliverableCostBreakdown]