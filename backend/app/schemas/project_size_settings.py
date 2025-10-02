"""Project size settings schemas for API requests and responses."""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class ProjectSizeSettingsBase(BaseModel):
    """Base schema for ProjectSizeSettings."""
    small_min_hours: int = Field(0, ge=0)
    small_max_hours: int = Field(500, ge=0)
    medium_min_hours: int = Field(501, ge=0)
    medium_max_hours: int = Field(2000, ge=0)
    large_min_hours: int = Field(2001, ge=0)
    large_max_hours: int = Field(10000, ge=0)
    phase_gate_recommendation_hours: int = Field(5000, ge=0)
    auto_adjust_project_size: bool = False
    warn_on_size_mismatch: bool = True
    recommend_phase_gate: bool = True
    is_active: bool = True


class ProjectSizeSettingsCreate(ProjectSizeSettingsBase):
    """Schema for creating ProjectSizeSettings."""
    pass


class ProjectSizeSettingsUpdate(BaseModel):
    """Schema for updating ProjectSizeSettings."""
    small_min_hours: Optional[int] = Field(None, ge=0)
    small_max_hours: Optional[int] = Field(None, ge=0)
    medium_min_hours: Optional[int] = Field(None, ge=0)
    medium_max_hours: Optional[int] = Field(None, ge=0)
    large_min_hours: Optional[int] = Field(None, ge=0)
    large_max_hours: Optional[int] = Field(None, ge=0)
    phase_gate_recommendation_hours: Optional[int] = Field(None, ge=0)
    auto_adjust_project_size: Optional[bool] = None
    warn_on_size_mismatch: Optional[bool] = None
    recommend_phase_gate: Optional[bool] = None
    is_active: Optional[bool] = None


class ProjectSizeSettingsResponse(ProjectSizeSettingsBase):
    """Schema for ProjectSizeSettings response."""
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class SizeRecommendation(BaseModel):
    """Schema for size recommendation based on hours."""
    current_size: str
    total_hours: int
    recommended_size: str
    is_appropriate: bool
    message: Optional[str] = None
