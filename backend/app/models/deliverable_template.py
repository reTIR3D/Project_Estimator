"""Deliverable template model for client profiles."""

from sqlalchemy import Column, String, Text, Integer, ForeignKey, JSON, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.models.base import Base


class DeliverableTemplate(Base):
    """Deliverable template by project size - can be generic or company-specific."""

    __tablename__ = "deliverable_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=True, index=True)  # Optional - null = generic template

    # Template identification
    name = Column(String(255), nullable=False)  # e.g., "Shell - Large Project Matrix"
    project_size = Column(String(50), nullable=False)  # SMALL, MEDIUM, LARGE, PHASE_GATE
    discipline = Column(String(50))  # Optional: specific to a discipline, null = all disciplines

    description = Column(Text)

    # Deliverables configuration (JSON array of deliverable definitions)
    # Each item contains: name, milestone, duration_days, hours breakdown, dependencies, etc.
    deliverables_config = Column(JSON, default=[])

    # Risk factors specific to this client/size
    risk_factors = Column(JSON, default=[])  # Array of {name, probability, impact, mitigation}

    # Contingency modifiers by project phase/milestone
    contingency_modifiers = Column(JSON, default={})  # {milestone: modifier_percentage}

    # Is this the default template for this client/size combo?
    is_default = Column(Boolean, default=False)

    # Relationships
    company = relationship("Company", back_populates="deliverable_templates")

    def __repr__(self):
        return f"<DeliverableTemplate {self.name} ({self.project_size})>"
