"""Client template model."""

from sqlalchemy import Boolean, Column, JSON, String
from app.models.base import Base


class ClientTemplate(Base):
    """Client rate template model."""

    __tablename__ = "client_templates"

    # Basic information
    name = Column(String(255), nullable=False)
    description = Column(String(1000))

    # Template data
    client_type = Column(String(50), default='STANDARD')
    industry = Column(String(100))
    custom_rates = Column(JSON, default={})
    settings = Column(JSON, default={})

    # Template configuration
    is_active = Column(Boolean, default=True)
    is_public = Column(Boolean, default=False)
