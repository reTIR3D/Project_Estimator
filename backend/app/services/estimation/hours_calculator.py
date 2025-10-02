"""Hours calculation service."""

from typing import Dict

from app.models.project import ProjectSize
from app.core.exceptions import ValidationException
import logging


logger = logging.getLogger(__name__)


class HoursCalculator:
    """
    Calculate base hours for projects based on size and discipline.

    Base hours represent typical project effort before applying
    complexity and client factors.
    """

    # Base hours by project size
    BASE_HOURS = {
        ProjectSize.SMALL: 300,    # < 500 hours, 3-person team, 8 weeks
        ProjectSize.MEDIUM: 1200,  # 500-2000 hours, 5-person team, 16 weeks
        ProjectSize.LARGE: 3500    # > 2000 hours, 8-person team, 32+ weeks
    }

    # Team size recommendations
    TEAM_SIZE = {
        ProjectSize.SMALL: 3,
        ProjectSize.MEDIUM: 5,
        ProjectSize.LARGE: 8
    }

    # Base duration in weeks
    BASE_DURATION = {
        ProjectSize.SMALL: 8,
        ProjectSize.MEDIUM: 16,
        ProjectSize.LARGE: 32
    }

    def get_base_hours(self, project_size: ProjectSize) -> int:
        """
        Get base hours for project size.

        Args:
            project_size: Project size classification

        Returns:
            int: Base hours

        Raises:
            ValidationException: If project size is invalid
        """
        if project_size not in self.BASE_HOURS:
            raise ValidationException(
                message=f"Invalid project size: {project_size}",
                details={"valid_sizes": list(self.BASE_HOURS.keys())}
            )

        hours = self.BASE_HOURS[project_size]
        logger.debug(f"Base hours for {project_size}: {hours}")
        return hours

    def get_team_size(self, project_size: ProjectSize) -> int:
        """Get recommended team size for project."""
        return self.TEAM_SIZE.get(project_size, 5)

    def get_base_duration(self, project_size: ProjectSize) -> int:
        """Get base duration in weeks for project."""
        return self.BASE_DURATION.get(project_size, 16)

    def calculate_hours_by_role(
        self,
        total_hours: int,
        project_size: ProjectSize
    ) -> Dict[str, int]:
        """
        Calculate hours breakdown by role.

        Distribution varies by project size:
        - Small projects: More individual contributor work
        - Large projects: More management and coordination

        Args:
            total_hours: Total project hours
            project_size: Project size classification

        Returns:
            Dictionary of hours by role
        """
        # Role distribution percentages by project size
        ROLE_DISTRIBUTION = {
            ProjectSize.SMALL: {
                'engineer': 0.60,
                'designer': 0.15,
                'qa_reviewer': 0.10,
                'project_manager': 0.10,
                'technical_lead': 0.05
            },
            ProjectSize.MEDIUM: {
                'engineer': 0.50,
                'designer': 0.20,
                'qa_reviewer': 0.12,
                'project_manager': 0.12,
                'technical_lead': 0.06
            },
            ProjectSize.LARGE: {
                'engineer': 0.45,
                'designer': 0.20,
                'qa_reviewer': 0.12,
                'project_manager': 0.15,
                'technical_lead': 0.08
            }
        }

        distribution = ROLE_DISTRIBUTION.get(project_size, ROLE_DISTRIBUTION[ProjectSize.MEDIUM])

        hours_by_role = {
            role: int(total_hours * percentage)
            for role, percentage in distribution.items()
        }

        logger.debug(f"Hours by role for {project_size} project: {hours_by_role}")
        return hours_by_role

    def calculate_deliverable_hours(
        self,
        deliverable_type: str,
        complexity: float = 1.0
    ) -> Dict[str, int]:
        """
        Calculate hours breakdown for a single deliverable.

        Args:
            deliverable_type: Type of deliverable
            complexity: Complexity multiplier

        Returns:
            Dictionary with hours breakdown
        """
        # Base hours for typical deliverable
        base_create = int(40 * complexity)
        base_review = int(8 * complexity)
        base_qa = int(4 * complexity)
        base_doc = int(6 * complexity)
        base_revisions = int(10 * complexity)
        base_pm = int(4 * complexity)

        return {
            'hours_create': base_create,
            'hours_review': base_review,
            'hours_qa': base_qa,
            'hours_doc': base_doc,
            'hours_revisions': base_revisions,
            'hours_pm': base_pm,
            'hours_total': base_create + base_review + base_qa + base_doc + base_revisions + base_pm
        }