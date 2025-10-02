"""Company schemas for API requests and responses."""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID


class CompanyBase(BaseModel):
    """Base schema for Company."""
    name: str = Field(..., min_length=1, max_length=255)
    code: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    contact_name: Optional[str] = Field(None, max_length=255)
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = Field(None, max_length=50)
    client_type: str = Field(default='STANDARD', pattern='^(STANDARD|PREFERRED|STRATEGIC)$')
    client_complexity: int = Field(default=5, ge=1, le=10, description="Client complexity/difficulty level (1-10)")
    base_contingency: float = Field(default=15.0, ge=0, le=100, description="Base contingency percentage for this client")


class CompanyCreate(CompanyBase):
    """Schema for creating a Company."""
    industry_id: UUID


class CompanyUpdate(BaseModel):
    """Schema for updating a Company."""
    industry_id: Optional[UUID] = None
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    code: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    contact_name: Optional[str] = Field(None, max_length=255)
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = Field(None, max_length=50)
    client_type: Optional[str] = Field(None, pattern='^(STANDARD|PREFERRED|STRATEGIC)$')
    client_complexity: Optional[int] = Field(None, ge=1, le=10)
    base_contingency: Optional[float] = Field(None, ge=0, le=100)
    is_active: Optional[bool] = None


class CompanyResponse(CompanyBase):
    """Schema for Company response."""
    id: UUID
    industry_id: UUID
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]
    rate_sheet_count: Optional[int] = 0  # Will be populated if needed

    class Config:
        from_attributes = True


class CompanyClone(BaseModel):
    """Schema for cloning a company."""
    new_name: str = Field(..., min_length=1, max_length=255)
    new_code: Optional[str] = Field(None, max_length=50)
    target_industry_id: Optional[UUID] = None  # If None, use same industry
    clone_rate_sheets: bool = Field(default=True)
