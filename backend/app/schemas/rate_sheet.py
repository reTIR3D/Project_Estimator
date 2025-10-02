"""Rate sheet schemas for API requests and responses."""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, List, Any
from datetime import datetime
from uuid import UUID


class RateEntry(BaseModel):
    """Individual rate entry with role, discipline, rate, and unit."""
    role: str
    discipline: str
    rate: float
    unit: str = "hourly"  # Default to hourly; can be "hourly", "daily", "weekly", "monthly", "per seat", etc.


class RateSheetBase(BaseModel):
    """Base schema for RateSheet."""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    rates: Dict[str, float] = Field(default_factory=dict)  # {"role_name": hourly_rate} - Legacy format
    rate_entries: List[RateEntry] = Field(default_factory=list)  # New structured format

    @field_validator('rate_entries', mode='before')
    @classmethod
    def convert_rate_entries(cls, v: Any) -> List[RateEntry]:
        """Convert dict list to RateEntry objects if needed."""
        if v is None:
            return []
        if isinstance(v, list):
            return [RateEntry(**item) if isinstance(item, dict) else item for item in v]
        return v


class RateSheetCreate(RateSheetBase):
    """Schema for creating a RateSheet."""
    company_id: UUID
    is_default: bool = Field(default=False)


class RateSheetUpdate(BaseModel):
    """Schema for updating a RateSheet."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    rates: Optional[Dict[str, float]] = None
    rate_entries: Optional[List[RateEntry]] = None
    is_default: Optional[bool] = None
    is_active: Optional[bool] = None


class RateSheetResponse(RateSheetBase):
    """Schema for RateSheet response."""
    id: UUID
    company_id: UUID
    is_default: bool
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


class RateSheetClone(BaseModel):
    """Schema for cloning a rate sheet."""
    new_name: str = Field(..., min_length=1, max_length=255)
    target_company_id: Optional[UUID] = None  # If None, clone to same company
    new_description: Optional[str] = None
