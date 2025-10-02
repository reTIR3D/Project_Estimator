"""Audit log model."""

import enum
from sqlalchemy import Column, Enum, ForeignKey, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base


class AuditAction(str, enum.Enum):
    """Audit action type."""

    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    APPROVE = "approve"
    REJECT = "reject"
    SUBMIT = "submit"
    EXPORT = "export"
    IMPORT = "import"


class AuditLog(Base):
    """Audit log model."""

    __tablename__ = "audit_logs"

    # Action information
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    action = Column(Enum(AuditAction), nullable=False)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(UUID(as_uuid=True), nullable=False)

    # Project reference (optional)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), index=True)

    # Details
    description = Column(String(500))
    old_values = Column(JSON)
    new_values = Column(JSON)
    metadata_ = Column("metadata", JSON, default={})

    # Request information
    ip_address = Column(String(45))
    user_agent = Column(Text)

    # Relationships
    user = relationship("User", back_populates="audit_logs")
    project = relationship("Project", back_populates="audit_logs")