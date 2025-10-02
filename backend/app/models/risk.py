"""Risk model."""

import enum
from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, Integer, JSON, Numeric, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base


class ScenarioType(str, enum.Enum):
    """Risk scenario type."""

    P10 = "p10"  # Optimistic (10th percentile)
    P50 = "p50"  # Most likely (50th percentile)
    P90 = "p90"  # Pessimistic (90th percentile)
    EXPECTED = "expected"


class RiskLevel(str, enum.Enum):
    """Risk level."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class RiskScenario(Base):
    """Risk scenario model."""

    __tablename__ = "risk_scenarios"

    # Project reference
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False, index=True)
    scenario_type = Column(Enum(ScenarioType), nullable=False)

    # Scenario values
    hours = Column(Integer, nullable=False)
    duration_weeks = Column(Integer, nullable=False)
    cost = Column(Numeric(15, 2), nullable=False)
    probability_percent = Column(Float, nullable=False)

    # Risk factors included (stored as JSON)
    risk_factors = Column(JSON, default=[])

    # Simulation metadata
    simulation_date = Column(DateTime)
    iterations_run = Column(Integer, default=10000)
    confidence_interval = Column(Float)

    # Statistical measures
    mean_value = Column(Float)
    std_deviation = Column(Float)
    variance = Column(Float)

    # Relationships
    project = relationship("Project", back_populates="risk_scenarios")

    # Unique constraint on project + scenario type
    __table_args__ = (
        UniqueConstraint("project_id", "scenario_type", name="uq_project_scenario"),
    )


class RiskFactor(Base):
    """Risk factor model."""

    __tablename__ = "risk_factors"

    # Basic information
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(String(1000))
    category = Column(String(100))

    # Risk assessment
    probability_percent = Column(Float, nullable=False)  # Likelihood of occurring
    impact_hours = Column(Integer, nullable=False)  # Impact in hours if occurs
    impact_cost = Column(Numeric(15, 2))  # Impact in cost if occurs
    risk_level = Column(Enum(RiskLevel), nullable=False)

    # Expected value
    expected_hours = Column(Integer)  # probability * impact_hours
    expected_cost = Column(Numeric(15, 2))  # probability * impact_cost

    # Mitigation
    mitigation_strategy = Column(String(1000))
    mitigation_cost = Column(Numeric(15, 2))
    residual_probability = Column(Float)  # Probability after mitigation

    # Status
    is_active = Column(Float, default=True)