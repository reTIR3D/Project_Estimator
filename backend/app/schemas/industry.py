"""Industry schemas for API requests and responses."""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class IndustryBase(BaseModel):
    """Base schema for Industry."""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    display_order: int = Field(default=0)


class IndustryCreate(IndustryBase):
    """Schema for creating an Industry."""
    pass


class IndustryUpdate(BaseModel):
    """Schema for updating an Industry."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    display_order: Optional[int] = None
    is_archived: Optional[bool] = None


class IndustryResponse(IndustryBase):
    """Schema for Industry response."""
    id: UUID
    is_archived: bool
    created_at: datetime
    updated_at: Optional[datetime]
    company_count: Optional[int] = 0  # Will be populated if needed

    class Config:
        from_attributes = True
