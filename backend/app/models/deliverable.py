"""Deliverable model."""

import enum
from sqlalchemy import Boolean, Column, Date, Enum, ForeignKey, Integer, JSON, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base


class IssueState(str, enum.Enum):
    """Issue state for deliverables."""

    IFD = "IFD"  # Issued for Design
    IFR = "IFR"  # Issued for Review
    IFA = "IFA"  # Issued for Approval
    IFB = "IFB"  # Issued for Bid
    IFC = "IFC"  # Issued for Construction
    IFI = "IFI"  # Issued for Information
    IFP = "IFP"  # Issued for Permit
    IFM = "IFM"  # Issued for Manufacture


class Milestone(str, enum.Enum):
    """Project milestone (legacy - use IssueState for new work)."""

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

    # Dependencies (stored as JSON array of objects with deliverable_id and dependency_type)
    # Example: [{"deliverable_id": "uuid", "dependency_type": "prerequisite"}, ...]
    dependencies = Column(JSON, default=[])
    is_critical_path = Column(Boolean, default=False)
    float_days = Column(Integer, default=0)

    # Equipment-driven estimation fields
    equipment_id = Column(String(255))  # ID of equipment that generated this deliverable
    discipline = Column(String(100))  # Engineering discipline
    base_hours = Column(Integer)  # Base hours before multipliers

    # Issue state configuration (stored as JSON array of state codes)
    # Example: ["IFR", "IFC"]
    issue_states = Column(JSON, default=["IFR", "IFC"])
    review_cycles = Column(Integer, default=1)  # Number of review-rework cycles
    rework_factor = Column(Integer, default=25)  # Percentage (0-100) of work redone per cycle

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