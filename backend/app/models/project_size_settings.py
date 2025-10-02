"""Project size settings model for configurable hour thresholds."""

from sqlalchemy import Column, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.models.base import Base


class ProjectSizeSettings(Base):
    """Configuration for project size thresholds based on hours."""

    __tablename__ = "project_size_settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Hour thresholds for each project size
    small_min_hours = Column(Integer, default=0, nullable=False)
    small_max_hours = Column(Integer, default=500, nullable=False)

    medium_min_hours = Column(Integer, default=501, nullable=False)
    medium_max_hours = Column(Integer, default=2000, nullable=False)

    large_min_hours = Column(Integer, default=2001, nullable=False)
    large_max_hours = Column(Integer, default=10000, nullable=False)  # Upper bound for visualization

    # Phase-gate process recommendation threshold (independent of size)
    phase_gate_recommendation_hours = Column(Integer, default=5000, nullable=False)  # Recommend phase-gate process at this threshold

    # Auto-adjustment settings
    auto_adjust_project_size = Column(Boolean, default=False)  # Automatically upgrade project size when hours exceed threshold
    warn_on_size_mismatch = Column(Boolean, default=True)  # Show warnings when size doesn't match hours
    recommend_phase_gate = Column(Boolean, default=True)  # Recommend phase-gate process for large/complex projects

    # Is this the active/default settings record?
    is_active = Column(Boolean, default=True, unique=True)

    def get_size_for_hours(self, hours: int) -> str:
        """Determine the appropriate project size based on total hours."""
        if hours <= self.small_max_hours:
            return 'SMALL'
        elif hours <= self.medium_max_hours:
            return 'MEDIUM'
        else:
            return 'LARGE'

    def should_recommend_phase_gate(self, hours: int) -> bool:
        """Determine if phase-gate process should be recommended based on hours."""
        return self.recommend_phase_gate and hours >= self.phase_gate_recommendation_hours

    def is_size_appropriate(self, current_size: str, hours: int) -> bool:
        """Check if the current size is appropriate for the given hours."""
        recommended_size = self.get_size_for_hours(hours)
        return current_size == recommended_size

    def __repr__(self):
        return f"<ProjectSizeSettings Small:{self.small_max_hours}h Medium:{self.medium_max_hours}h Large:{self.large_max_hours}h>"
