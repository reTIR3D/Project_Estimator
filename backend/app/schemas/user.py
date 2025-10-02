"""User schemas."""

from typing import Optional
from pydantic import EmailStr, Field

from app.schemas.base import BaseSchema, BaseDBSchema
from app.models.user import UserRole


class UserBase(BaseSchema):
    """Base user schema."""

    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    full_name: Optional[str] = None
    is_active: bool = True
    is_superuser: bool = False
    role: UserRole = UserRole.ENGINEER


class UserCreate(UserBase):
    """Schema for creating a user."""

    password: str = Field(..., min_length=8)


class UserUpdate(BaseSchema):
    """Schema for updating a user."""

    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
    role: Optional[UserRole] = None


class User(BaseDBSchema, UserBase):
    """User schema with database fields."""

    pass


class UserInDB(User):
    """User schema with sensitive fields."""

    hashed_password: str