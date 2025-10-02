"""Resource model."""

import enum
from sqlalchemy import Column, Date, Enum, Float, ForeignKey, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base


class ResourceType(str, enum.Enum):
    """Resource type."""

    ENGINEER = "engineer"
    DESIGNER = "designer"
    QA_REVIEWER = "qa_reviewer"
    PROJECT_MANAGER = "project_manager"
    TECHNICAL_LEAD = "technical_lead"
    DOCUMENT_CONTROLLER = "document_controller"
    EXTERNAL_CONSULTANT = "external_consultant"


class Resource(Base):
    """Resource model."""

    __tablename__ = "resources"

    # Resource information
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False, index=True)
    resource_type = Column(Enum(ResourceType), nullable=False)

    # Allocation
    allocation_percent = Column(Integer, default=100)  # % of time allocated
    availability_percent = Column(Integer, default=100)  # % availability (accounts for leave, etc.)
    hourly_rate = Column(Numeric(10, 2))

    # Time period
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    # Tracking
    allocated_hours = Column(Integer, default=0)
    actual_hours = Column(Integer, default=0)
    remaining_hours = Column(Integer, default=0)

    # Relationships
    user = relationship("User", back_populates="resource_allocations")
    project = relationship("Project", back_populates="resources")
    assignments = relationship("ResourceAssignment", back_populates="resource", cascade="all, delete-orphan")


class ResourceAssignment(Base):
    """Resource assignment to deliverable."""

    __tablename__ = "resource_assignments"

    # Assignment information
    resource_id = Column(UUID(as_uuid=True), ForeignKey("resources.id"), nullable=False)
    deliverable_id = Column(UUID(as_uuid=True), ForeignKey("deliverables.id"), nullable=False)

    # Allocation
    assigned_hours = Column(Integer, nullable=False)
    actual_hours = Column(Integer, default=0)
    allocation_percent = Column(Float, default=100.0)

    # Relationships
    resource = relationship("Resource", back_populates="assignments")
    deliverable = relationship("Deliverable", back_populates="assigned_resources")