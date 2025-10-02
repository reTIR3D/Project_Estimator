"""Project schemas."""

from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID
from pydantic import Field

from app.schemas.base import BaseSchema, BaseDBSchema
from app.models.project import (
    WorkType,
    ProjectSize,
    ProcessType,
    EngineeringDiscipline,
    ClientProfile,
    ProjectStatus,
    ConfidenceLevel,
    ProjectType,
    ProjectPhase
)


class ProjectBase(BaseSchema):
    """Base project schema."""

    # Work type
    work_type: WorkType = Field(default=WorkType.DISCRETE_PROJECT)

    # Basic information
    name: str = Field(..., min_length=1, max_length=255)
    project_code: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = Field(None, max_length=2000)

    # Discrete project fields (optional for campaigns)
    size: Optional[ProjectSize] = None
    process_type: Optional[ProcessType] = None
    process_type_recommended: Optional[ProcessType] = None
    process_type_overridden: Optional[bool] = False

    discipline: EngineeringDiscipline
    project_type: ProjectType = Field(default=ProjectType.STANDARD)
    parent_project_id: Optional[UUID] = None
    company_id: Optional[UUID] = None
    rate_sheet_id: Optional[UUID] = None
    client_profile: ClientProfile
    client_name: Optional[str] = None
    complexity_factors: dict = Field(default_factory=dict)
    resource_availability: dict = Field(default_factory=dict)
    contingency_percent: float = Field(default=15.0, ge=0, le=100)
    overhead_percent: float = Field(default=10.0, ge=0, le=100)

    # Phase-gate fields (for discrete projects with PHASE_GATE process)
    current_phase: Optional[ProjectPhase] = None
    phase_completion: dict = Field(default_factory=dict)
    gate_approvals: dict = Field(default_factory=dict)

    # Campaign-specific fields
    campaign_duration_months: Optional[int] = None
    campaign_service_level: Optional[str] = None
    campaign_site_count: Optional[int] = None
    campaign_response_requirement: Optional[str] = None
    campaign_monthly_hours: Optional[dict] = Field(default_factory=dict)
    campaign_scheduled_deliverables: Optional[list] = Field(default_factory=list)
    campaign_pricing_model: Optional[str] = None

    selected_disciplines: list[str] = Field(default_factory=list)


class ProjectCreate(ProjectBase):
    """Schema for creating a project."""

    pass


class ProjectUpdate(BaseSchema):
    """Schema for updating a project."""

    name: Optional[str] = None
    description: Optional[str] = None
    size: Optional[ProjectSize] = None
    discipline: Optional[EngineeringDiscipline] = None
    project_type: Optional[ProjectType] = None
    parent_project_id: Optional[UUID] = None
    company_id: Optional[UUID] = None
    rate_sheet_id: Optional[UUID] = None
    client_profile: Optional[ClientProfile] = None
    client_name: Optional[str] = None
    status: Optional[ProjectStatus] = None
    complexity_factors: Optional[dict] = None
    resource_availability: Optional[dict] = None
    contingency_percent: Optional[float] = None
    overhead_percent: Optional[float] = None
    confidence_level: Optional[ConfidenceLevel] = None
    current_phase: Optional[ProjectPhase] = None
    phase_completion: Optional[dict] = None
    gate_approvals: Optional[dict] = None
    selected_disciplines: Optional[list[str]] = None


class Project(BaseDBSchema, ProjectBase):
    """Project schema with database fields."""

    status: ProjectStatus
    client_id: Optional[UUID] = None
    confidence_level: Optional[ConfidenceLevel] = None
    base_hours: Optional[int] = None
    complexity_multiplier: Optional[float] = None
    adjusted_hours: Optional[int] = None
    total_hours: Optional[int] = None
    duration_weeks: Optional[int] = None
    total_cost: Optional[Decimal] = None
    created_by: Optional[UUID] = None
    approved_by: Optional[UUID] = None
    approved_at: Optional[datetime] = None


class ProjectListResponse(BaseSchema):
    """Response schema for project list."""

    items: list[Project]
    total: int
    skip: int
    limit: int