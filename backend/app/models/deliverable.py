"""Deliverable model."""

import enum
from sqlalchemy import Boolean, Column, Date, Enum, ForeignKey, Integer, JSON, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base


class Milestone(str, enum.Enum):
    """Project milestone."""

    IFD = "ifd"  # Issued for Design
    IFH = "ifh"  # Issued for HAZOP
    IFR = "ifr"  # Issued for Review
    IFA = "ifa"  # Issued for Approval
    IFC = "ifc"  # Issued for Construction


class DeliverableStatus(str, enum.Enum):
    """Deliverable status."""

    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    REVISION = "revision"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"
    CANCELLED = "cancelled"


class Deliverable(Base):
    """Deliverable model."""

    __tablename__ = "deliverables"

    # Basic information
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(String(1000))
    milestone = Column(Enum(Milestone), nullable=False)
    sequence_number = Column(Integer, nullable=False)

    # Duration and scheduling
    duration_days = Column(Integer, nullable=False)
    start_date = Column(Date)
    end_date = Column(Date)
    actual_start = Column(Date)
    actual_end = Column(Date)

    # Dependencies (stored as JSON array of deliverable IDs)
    dependencies = Column(JSON, default=[])
    is_critical_path = Column(Boolean, default=False)
    float_days = Column(Integer, default=0)

    # Progress tracking
    progress_percent = Column(Integer, default=0)
    status = Column(Enum(DeliverableStatus), default=DeliverableStatus.NOT_STARTED)

    # Sheet count tracking
    expected_sheets = Column(Integer, default=0)  # Expected number of sheets/pages
    actual_sheets = Column(Integer, default=0)    # Actual sheets produced

    # Hours breakdown
    hours_create = Column(Integer, nullable=False, default=0)
    hours_review = Column(Integer, nullable=False, default=0)
    hours_qa = Column(Integer, nullable=False, default=0)
    hours_doc = Column(Integer, nullable=False, default=0)
    hours_revisions = Column(Integer, nullable=False, default=0)
    hours_pm = Column(Integer, nullable=False, default=0)
    hours_total = Column(Integer, nullable=False, default=0)

    # Actual hours tracking
    actual_hours_create = Column(Integer)
    actual_hours_review = Column(Integer)
    actual_hours_qa = Column(Integer)
    actual_hours_doc = Column(Integer)
    actual_hours_revisions = Column(Integer)
    actual_hours_pm = Column(Integer)
    actual_hours_total = Column(Integer)

    # Relationships
    project = relationship("Project", back_populates="deliverables")
    assigned_resources = relationship("ResourceAssignment", back_populates="deliverable", cascade="all, delete-orphan")