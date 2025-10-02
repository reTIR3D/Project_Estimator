"""Client schemas for API requests and responses."""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID


class ClientBase(BaseModel):
    """Base client schema."""
    name: str = Field(..., min_length=1, max_length=255)
    code: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    contact_name: Optional[str] = Field(None, max_length=255)
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = Field(None, max_length=50)
    client_type: str = Field(default='STANDARD')
    industry: Optional[str] = Field(None, max_length=100)
    custom_rates: Optional[Dict[str, float]] = Field(default_factory=dict)
    settings: Optional[Dict[str, Any]] = Field(default_factory=dict)
    is_active: bool = True


class ClientCreate(ClientBase):
    """Schema for creating a new client."""
    pass


class ClientUpdate(BaseModel):
    """Schema for updating a client."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    code: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    contact_name: Optional[str] = Field(None, max_length=255)
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = Field(None, max_length=50)
    client_type: Optional[str] = None
    industry: Optional[str] = Field(None, max_length=100)
    custom_rates: Optional[Dict[str, float]] = None
    settings: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class ClientResponse(ClientBase):
    """Schema for client response."""
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RateSheetUpdate(BaseModel):
    """Schema for updating just the rate sheet."""
    custom_rates: Dict[str, float]


class ClientListResponse(BaseModel):
    """Schema for listing clients."""
    clients: list[ClientResponse]
    total: int
