"""RACI matrix model."""

import enum
from sqlalchemy import Column, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base


class RACIRole(str, enum.Enum):
    """RACI role type."""

    RESPONSIBLE = "responsible"  # Does the work
    ACCOUNTABLE = "accountable"  # Ultimately answerable
    CONSULTED = "consulted"      # Provides input
    INFORMED = "informed"        # Kept updated


class RACIMatrix(Base):
    """RACI matrix model."""

    __tablename__ = "raci_matrices"

    # References
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # Task/Activity
    task_name = Column(String(255), nullable=False)
    task_category = Column(String(100))

    # RACI role
    role = Column(Enum(RACIRole), nullable=False)

    # Relationships
    project = relationship("Project", back_populates="raci_matrices")