"""Company model for managing company information."""
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, Integer, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.models.base import Base


class Company(Base):
    """Company (formerly Client) with industry classification."""

    __tablename__ = "companies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    industry_id = Column(UUID(as_uuid=True), ForeignKey("industries.id"), nullable=False, index=True)

    name = Column(String(255), nullable=False, index=True)
    code = Column(String(50), unique=True, index=True)  # Company code/abbreviation
    description = Column(Text)

    # Contact information
    contact_name = Column(String(255))
    contact_email = Column(String(255))
    contact_phone = Column(String(50))

    # Company classification
    client_type = Column(String(50), default='STANDARD')  # STANDARD, PREFERRED, STRATEGIC

    # Client profile settings
    client_complexity = Column(Integer, default=5)  # 1-10 scale, how demanding/nitpicky the client is
    base_contingency = Column(Float, default=15.0)  # Base contingency percentage for this client

    # Status
    is_active = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    industry = relationship("Industry", back_populates="companies")
    rate_sheets = relationship("RateSheet", back_populates="company", cascade="all, delete-orphan")
    deliverable_templates = relationship("DeliverableTemplate", back_populates="company", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Company {self.name} ({self.code})>"
