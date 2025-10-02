"""Rate sheet model for company-specific billing rates."""
from sqlalchemy import Column, String, Text, JSON, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.models.base import Base


class RateSheet(Base):
    """Rate sheet for a company with role-based billing rates."""

    __tablename__ = "rate_sheets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)

    name = Column(String(255), nullable=False)  # e.g., "Standard", "Aggressive", "Premium"
    description = Column(Text)

    # Rate configuration
    # Structure: { "role_name": hourly_rate, ... } - Legacy format
    rates = Column(JSON, default={}, nullable=False)
    # New structured format: [{"role": "...", "discipline": "...", "rate": ...}, ...]
    rate_entries = Column(JSON, default=[], nullable=False)

    # Settings
    is_default = Column(Boolean, default=False)  # One default per company
    is_active = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    company = relationship("Company", back_populates="rate_sheets")

    def __repr__(self):
        return f"<RateSheet {self.name} for {self.company.name if self.company else 'Unknown'}>"
