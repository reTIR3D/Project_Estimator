"""Client model for managing client information and rate sheets."""
from sqlalchemy import Column, String, JSON, DateTime, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from app.models.base import Base


class Client(Base):
    """Client configuration and rate sheets."""

    __tablename__ = "clients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, unique=True, index=True)
    code = Column(String(50), unique=True, index=True)  # Client code/abbreviation
    description = Column(Text)

    # Contact information
    contact_name = Column(String(255))
    contact_email = Column(String(255))
    contact_phone = Column(String(50))

    # Client classification
    client_type = Column(String(50), default='STANDARD')  # STANDARD, PREFERRED, STRATEGIC
    industry = Column(String(100))

    # Rate sheet configuration
    # Structure: { "role_name": hourly_rate, ... }
    custom_rates = Column(JSON, default={})

    # Client-specific settings
    # Structure: { "setting_name": value, ... }
    settings = Column(JSON, default={})

    # Status
    is_active = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Client {self.name} ({self.code})>"
