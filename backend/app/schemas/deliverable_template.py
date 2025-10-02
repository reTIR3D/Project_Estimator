"""Deliverable template schemas for API requests and responses."""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


class DeliverableConfig(BaseModel):
    """Schema for individual deliverable configuration."""
    name: str
    milestone: str
    duration_days: int
    hours_create: int = 0
    hours_review: int = 0
    hours_qa: int = 0
    hours_doc: int = 0
    hours_revisions: int = 0
    hours_pm: int = 0
    dependencies: List[int] = []  # Indices of dependent deliverables
    sequence_number: int


class RiskFactor(BaseModel):
    """Schema for risk factor."""
    name: str
    probability: str  # LOW, MEDIUM, HIGH
    impact: str  # LOW, MEDIUM, HIGH
    mitigation: Optional[str] = None


class DeliverableTemplateBase(BaseModel):
    """Base schema for DeliverableTemplate."""
    name: str = Field(..., min_length=1, max_length=255)
    project_size: str = Field(..., pattern='^(SMALL|MEDIUM|LARGE|PHASE_GATE)$')
    discipline: Optional[str] = Field(None, pattern='^(CIVIL|MECHANICAL|ELECTRICAL|STRUCTURAL|CHEMICAL|ENVIRONMENTAL|MULTIDISCIPLINE)?$')
    description: Optional[str] = None
    deliverables_config: List[DeliverableConfig] = []
    risk_factors: List[RiskFactor] = []
    contingency_modifiers: Dict[str, float] = {}  # {milestone: modifier_percentage}
    is_default: bool = False


class DeliverableTemplateCreate(DeliverableTemplateBase):
    """Schema for creating a DeliverableTemplate."""
    company_id: UUID


class DeliverableTemplateUpdate(BaseModel):
    """Schema for updating a DeliverableTemplate."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    project_size: Optional[str] = Field(None, pattern='^(SMALL|MEDIUM|LARGE|PHASE_GATE)$')
    discipline: Optional[str] = None
    description: Optional[str] = None
    deliverables_config: Optional[List[DeliverableConfig]] = None
    risk_factors: Optional[List[RiskFactor]] = None
    contingency_modifiers: Optional[Dict[str, float]] = None
    is_default: Optional[bool] = None


class DeliverableTemplateResponse(DeliverableTemplateBase):
    """Schema for DeliverableTemplate response."""
    id: UUID
    company_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
