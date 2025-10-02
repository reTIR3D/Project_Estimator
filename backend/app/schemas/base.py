"""Base schemas."""

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class BaseSchema(BaseModel):
    """Base schema with common configuration."""

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)


class BaseDBSchema(BaseSchema):
    """Base schema for database models."""

    id: UUID
    created_at: datetime
    updated_at: datetime | None = None