"""Project model."""

import enum
from sqlalchemy import Boolean, Column, DateTime, Enum, Float, ForeignKey, Index, Integer, JSON, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base


class WorkType(str, enum.Enum):
    """Top-level work type classification."""

    DISCRETE_PROJECT = "DISCRETE_PROJECT"  # One-time project with defined scope
    CAMPAIGN = "CAMPAIGN"  # Ongoing engineering support/retainer


class ProjectSize(str, enum.Enum):
    """Project size classification (for discrete projects only)."""

    SMALL = "SMALL"      # < 500 hours (configurable)
    MEDIUM = "MEDIUM"    # 500-2000 hours (configurable)
    LARGE = "LARGE"      # > 2000 hours (configurable)


class ProcessType(str, enum.Enum):
    """Project governance/process methodology."""

    CONVENTIONAL = "CONVENTIONAL"  # Standard workflow with continuous progression
    PHASE_GATE = "PHASE_GATE"  # Formal stage-gate reviews with approval milestones


class EngineeringDiscipline(str, enum.Enum):
    """Engineering discipline."""

    CIVIL = "CIVIL"
    MECHANICAL = "MECHANICAL"
    ELECTRICAL = "ELECTRICAL"
    STRUCTURAL = "STRUCTURAL"
    CHEMICAL = "CHEMICAL"
    ENVIRONMENTAL = "ENVIRONMENTAL"
    MULTIDISCIPLINE = "MULTIDISCIPLINE"


class ClientProfile(str, enum.Enum):
    """Client profile type."""

    TYPE_A = "TYPE_A"        # Heavy oversight (+40%)
    TYPE_B = "TYPE_B"        # Standard process (baseline)
    TYPE_C = "TYPE_C"        # Minimal oversight (-15%)
    NEW_CLIENT = "NEW_CLIENT"  # Unknown, conservative (+25%)


class ProjectStatus(str, enum.Enum):
    """Project status."""

    DRAFT = "DRAFT"
    ESTIMATION = "ESTIMATION"
    REVIEW = "REVIEW"
    APPROVED = "APPROVED"
    ACTIVE = "ACTIVE"
    ON_HOLD = "ON_HOLD"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class ConfidenceLevel(str, enum.Enum):
    """Estimation confidence level."""

    LOW = "LOW"          # 50-70% confidence
    MEDIUM = "MEDIUM"    # 70-85% confidence
    HIGH = "HIGH"        # 85-95% confidence
    VERY_HIGH = "VERY_HIGH"  # > 95% confidence


class ProjectType(str, enum.Enum):
    """Project type."""

    STANDARD = "STANDARD"  # Standard project (default)


class ProjectPhase(str, enum.Enum):
    """Project phase for phase-gate projects."""

    FRAME = "FRAME"        # Conceptual (±50%)
    SCREEN = "SCREEN"      # Feasibility (±30%)
    REFINE = "REFINE"      # FEED/Define (±10-15%)
    IMPLEMENT = "IMPLEMENT"  # Detail Design


class Project(Base):
    """Project model."""

    __tablename__ = "projects"

    # Work type classification
    work_type = Column(Enum(WorkType), default=WorkType.DISCRETE_PROJECT, nullable=False, index=True)

    # Basic information
    name = Column(String(255), nullable=False, index=True)
    project_code = Column(String(50), unique=True, index=True)
    description = Column(String(2000))

    # Discrete project fields (nullable for campaigns)
    size = Column(Enum(ProjectSize), nullable=True)  # Only for discrete projects
    process_type = Column(Enum(ProcessType), nullable=True)  # Only for discrete projects
    process_type_recommended = Column(Enum(ProcessType), nullable=True)  # What system suggested
    process_type_overridden = Column(Boolean, default=False)  # Did user override recommendation?

    discipline = Column(Enum(EngineeringDiscipline), nullable=False)
    project_type = Column(Enum(ProjectType), default=ProjectType.STANDARD, nullable=False)

    # Parent/Child relationship for facility projects with modules
    parent_project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=True, index=True)

    # Client information
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=True, index=True)
    rate_sheet_id = Column(UUID(as_uuid=True), ForeignKey("rate_sheets.id"), nullable=True, index=True)
    client_profile = Column(Enum(ClientProfile), nullable=False)
    client_name = Column(String(255))

    # Status and workflow
    status = Column(Enum(ProjectStatus), default=ProjectStatus.DRAFT, index=True)

    # Phase-gate tracking (for process_type = PHASE_GATE)
    current_phase = Column(Enum(ProjectPhase), nullable=True)  # Current phase for phase-gate process
    phase_completion = Column(JSON, default={})  # Track completion % per phase
    gate_approvals = Column(JSON, default={})    # Track gate approval dates and approvers

    # Campaign-specific fields (for work_type = CAMPAIGN)
    campaign_duration_months = Column(Integer, nullable=True)  # Duration in months
    campaign_service_level = Column(String(50), nullable=True)  # reactiveOnly, scheduledReactive, fullService
    campaign_site_count = Column(Integer, nullable=True)  # Number of sites covered
    campaign_response_requirement = Column(String(50), nullable=True)  # 24hour, 48hour, weekly
    campaign_monthly_hours = Column(JSON, default={})  # {discipline: hours_per_month}
    campaign_scheduled_deliverables = Column(JSON, default=[])  # [{name, frequency}]
    campaign_pricing_model = Column(String(50), nullable=True)  # fixedRetainer, timeAndMaterials

    # Selected disciplines for multi-discipline projects (stored as JSON array)
    selected_disciplines = Column(JSON, default=[])

    # Complexity factors (stored as JSON)
    complexity_factors = Column(JSON, default={})

    # Resource availability (stored as JSON)
    resource_availability = Column(JSON, default={})

    # Risk parameters
    contingency_percent = Column(Float, default=15.0)
    overhead_percent = Column(Float, default=10.0)
    confidence_level = Column(Enum(ConfidenceLevel))

    # Calculated fields (cached)
    base_hours = Column(Integer)
    complexity_multiplier = Column(Float)
    adjusted_hours = Column(Integer)
    total_hours = Column(Integer)
    duration_weeks = Column(Integer)
    total_cost = Column(Numeric(15, 2))

    # Metadata
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    approved_at = Column(DateTime)

    # Relationships
    company = relationship("Company", foreign_keys=[company_id])
    rate_sheet = relationship("RateSheet", foreign_keys=[rate_sheet_id])
    creator = relationship("User", back_populates="created_projects", foreign_keys=[created_by])
    approver = relationship("User", back_populates="approved_projects", foreign_keys=[approved_by])
    deliverables = relationship("Deliverable", back_populates="project", cascade="all, delete-orphan")
    resources = relationship("Resource", back_populates="project", cascade="all, delete-orphan")
    risk_scenarios = relationship("RiskScenario", back_populates="project", cascade="all, delete-orphan")
    financial_breakdown = relationship("FinancialBreakdown", back_populates="project", uselist=False)
    raci_matrices = relationship("RACIMatrix", back_populates="project", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="project")

    # Parent/Child relationships
    parent_project = relationship("Project", remote_side="Project.id", foreign_keys=[parent_project_id], backref="child_modules")

    # Indexes
    __table_args__ = (
        Index("idx_project_status_created", "status", "created_at"),
        Index("idx_project_company", "company_id"),
    )