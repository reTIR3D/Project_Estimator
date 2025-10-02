"""Client template schemas for API requests and responses."""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID


class ClientTemplateBase(BaseModel):
    """Base client template schema."""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    client_type: str = Field(default='STANDARD')
    industry: Optional[str] = Field(None, max_length=100)
    custom_rates: Optional[Dict[str, float]] = Field(default_factory=dict)
    settings: Optional[Dict[str, Any]] = Field(default_factory=dict)
    is_active: bool = True
    is_public: bool = False


class ClientTemplateCreate(ClientTemplateBase):
    """Schema for creating a new client template."""
    pass


class ClientTemplateUpdate(BaseModel):
    """Schema for updating a client template."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    client_type: Optional[str] = None
    industry: Optional[str] = Field(None, max_length=100)
    custom_rates: Optional[Dict[str, float]] = None
    settings: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    is_public: Optional[bool] = None


class ClientTemplateResponse(ClientTemplateBase):
    """Schema for client template response."""
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ClientTemplateListResponse(BaseModel):
    """Schema for listing client templates."""
    templates: list[ClientTemplateResponse]
    total: int
