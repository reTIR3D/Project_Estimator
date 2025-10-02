"""Project template model."""

from sqlalchemy import Boolean, Column, Float, Integer, JSON, String
from sqlalchemy.orm import relationship

from app.models.base import Base


class ProjectTemplate(Base):
    """Project template model."""

    __tablename__ = "project_templates"

    # Basic information
    name = Column(String(255), nullable=False)
    description = Column(String(1000))
    category = Column(String(100))

    # Template configuration
    is_active = Column(Boolean, default=True)
    is_public = Column(Boolean, default=False)

    # Template data (stored as JSON)
    deliverables = Column(JSON, default=[])
    complexity_factors = Column(JSON, default={})
    resource_requirements = Column(JSON, default={})
    milestones = Column(JSON, default=[])

    # Default values
    default_contingency = Column(Float, default=15.0)
    estimated_duration_weeks = Column(Integer)