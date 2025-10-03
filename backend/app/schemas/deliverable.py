"""Deliverable schemas."""

from datetime import date
from typing import Optional
from uuid import UUID
from pydantic import Field

from app.schemas.base import BaseSchema, BaseDBSchema
from app.models.deliverable import Milestone, DeliverableStatus


class DeliverableBase(BaseSchema):
    """Base deliverable schema."""

    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    milestone: Milestone
    sequence_number: int = Field(..., ge=1)
    duration_days: int = Field(..., ge=1)
    dependencies: list = Field(default_factory=list)  # List of {deliverable_id, dependency_type}
    expected_sheets: int = Field(default=0, ge=0)  # Expected number of sheets/pages
    hours_create: int = Field(default=0, ge=0)
    hours_review: int = Field(default=0, ge=0)
    hours_qa: int = Field(default=0, ge=0)
    hours_doc: int = Field(default=0, ge=0)
    hours_revisions: int = Field(default=0, ge=0)
    hours_pm: int = Field(default=0, ge=0)
    hours_total: int = Field(default=0, ge=0)

    # Equipment-driven estimation fields
    equipment_id: Optional[str] = None
    discipline: Optional[str] = None
    base_hours: Optional[int] = Field(None, ge=0)

    # Issue state configuration
    issue_states: list = Field(default_factory=lambda: ["IFR", "IFC"])
    review_cycles: int = Field(default=1, ge=0)
    rework_factor: int = Field(default=25, ge=0, le=100)  # Percentage


class DeliverableCreate(DeliverableBase):
    """Schema for creating a deliverable."""

    project_id: UUID


class DeliverableUpdate(BaseSchema):
    """Schema for updating a deliverable."""

    name: Optional[str] = None
    description: Optional[str] = None
    milestone: Optional[Milestone] = None
    sequence_number: Optional[int] = None
    duration_days: Optional[int] = None
    expected_sheets: Optional[int] = Field(None, ge=0)
    actual_sheets: Optional[int] = Field(None, ge=0)
    status: Optional[DeliverableStatus] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    progress_percent: Optional[int] = Field(None, ge=0, le=100)

    # New fields for equipment-driven estimation and configuration
    equipment_id: Optional[str] = None
    discipline: Optional[str] = None
    base_hours: Optional[int] = Field(None, ge=0)
    dependencies: Optional[list] = None
    issue_states: Optional[list] = None
    review_cycles: Optional[int] = Field(None, ge=0)
    rework_factor: Optional[int] = Field(None, ge=0, le=100)


class Deliverable(BaseDBSchema, DeliverableBase):
    """Deliverable schema with database fields."""

    project_id: UUID
    status: DeliverableStatus
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    actual_start: Optional[date] = None
    actual_end: Optional[date] = None
    actual_sheets: int = 0
    is_critical_path: bool
    float_days: int
    progress_percent: int