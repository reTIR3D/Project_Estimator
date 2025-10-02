"""Notification model."""

import enum
from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base


class NotificationType(str, enum.Enum):
    """Notification type."""

    PROJECT_CREATED = "project_created"
    PROJECT_UPDATED = "project_updated"
    PROJECT_APPROVED = "project_approved"
    DELIVERABLE_COMPLETED = "deliverable_completed"
    RESOURCE_ASSIGNED = "resource_assigned"
    RISK_ALERT = "risk_alert"
    MILESTONE_REACHED = "milestone_reached"
    SYSTEM_ALERT = "system_alert"


class Notification(Base):
    """Notification model."""

    __tablename__ = "notifications"

    # User reference
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)

    # Notification details
    notification_type = Column(Enum(NotificationType), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)

    # Status
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime)

    # Links
    link_url = Column(String(500))
    entity_type = Column(String(100))
    entity_id = Column(UUID(as_uuid=True))

    # Relationships
    user = relationship("User", back_populates="notifications")