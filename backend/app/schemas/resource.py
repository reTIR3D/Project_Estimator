"""Resource schemas."""

from datetime import date
from decimal import Decimal
from typing import Optional
from uuid import UUID
from pydantic import Field

from app.schemas.base import BaseSchema, BaseDBSchema
from app.models.resource import ResourceType


class ResourceBase(BaseSchema):
    """Base resource schema."""

    resource_type: ResourceType
    allocation_percent: int = Field(default=100, ge=0, le=100)
    availability_percent: int = Field(default=100, ge=0, le=100)
    hourly_rate: Optional[Decimal] = None
    start_date: date
    end_date: date


class ResourceCreate(ResourceBase):
    """Schema for creating a resource."""

    user_id: UUID
    project_id: UUID


class ResourceUpdate(BaseSchema):
    """Schema for updating a resource."""

    resource_type: Optional[ResourceType] = None
    allocation_percent: Optional[int] = Field(None, ge=0, le=100)
    availability_percent: Optional[int] = Field(None, ge=0, le=100)
    hourly_rate: Optional[Decimal] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class Resource(BaseDBSchema, ResourceBase):
    """Resource schema with database fields."""

    user_id: UUID
    project_id: UUID
    allocated_hours: int
    actual_hours: int
    remaining_hours: int