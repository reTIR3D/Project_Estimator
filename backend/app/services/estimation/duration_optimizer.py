"""Duration optimization service."""

from typing import Dict
import math
import logging

from app.models.project import ProjectSize


logger = logging.getLogger(__name__)


class DurationOptimizer:
    """
    Optimize project duration based on resources and constraints.

    Formula:
    Duration = Base Duration × (100/Availability%) × (1 + (Complexity-1) × 0.3)
    """

    # Hours per week (standard work week)
    HOURS_PER_WEEK = 40

    def calculate_duration(
        self,
        base_hours: int,
        total_hours: int,
        complexity_multiplier: float,
        resource_availability: Dict[str, float],
        project_size: ProjectSize
    ) -> int:
        """
        Calculate project duration in weeks.

        Args:
            base_hours: Base project hours
            total_hours: Total project hours including contingency
            complexity_multiplier: Complexity multiplier
            resource_availability: Resource availability percentages
            project_size: Project size classification

        Returns:
            int: Duration in weeks
        """
        # Get base duration for project size
        base_duration_weeks = self._get_base_duration(project_size)

        # Calculate average resource availability
        avg_availability = self._calculate_average_availability(resource_availability)

        # Adjust for availability
        if avg_availability > 0:
            availability_factor = 100.0 / avg_availability
        else:
            availability_factor = 2.0  # Default to 50% if no data

        # Adjust for complexity
        # Complexity increases duration due to rework, coordination, etc.
        complexity_duration_impact = 1.0 + ((complexity_multiplier - 1.0) * 0.3)

        # Calculate adjusted duration
        adjusted_duration = base_duration_weeks * availability_factor * complexity_duration_impact

        # Round up to nearest week
        duration_weeks = math.ceil(adjusted_duration)

        logger.info(
            f"Duration calculation: base={base_duration_weeks}w, "
            f"availability={avg_availability}%, "
            f"complexity_impact={complexity_duration_impact:.2f}, "
            f"result={duration_weeks}w"
        )

        return duration_weeks

    def _get_base_duration(self, project_size: ProjectSize) -> int:
        """Get base duration in weeks for project size."""
        BASE_DURATION = {
            ProjectSize.SMALL: 8,
            ProjectSize.MEDIUM: 16,
            ProjectSize.LARGE: 32
        }
        return BASE_DURATION.get(project_size, 16)

    def _calculate_average_availability(
        self,
        resource_availability: Dict[str, float]
    ) -> float:
        """
        Calculate average resource availability.

        Args:
            resource_availability: Dictionary of resource availability percentages

        Returns:
            float: Average availability percentage (0-100)
        """
        if not resource_availability:
            return 80.0  # Default to 80% availability

        availabilities = [
            v for v in resource_availability.values()
            if isinstance(v, (int, float)) and 0 <= v <= 100
        ]

        if not availabilities:
            return 80.0

        avg = sum(availabilities) / len(availabilities)
        logger.debug(f"Average resource availability: {avg:.1f}%")
        return avg

    def optimize_schedule(
        self,
        total_hours: int,
        team_size: int,
        target_duration_weeks: int,
        constraints: Dict[str, any] = None
    ) -> Dict[str, any]:
        """
        Optimize schedule to meet target duration.

        Args:
            total_hours: Total project hours
            team_size: Number of team members
            target_duration_weeks: Target duration
            constraints: Optional scheduling constraints

        Returns:
            Dictionary with optimization results
        """
        constraints = constraints or {}

        # Calculate required hours per week
        required_hours_per_week = total_hours / target_duration_weeks

        # Calculate required resource allocation
        available_hours_per_week = team_size * self.HOURS_PER_WEEK
        required_allocation = (required_hours_per_week / available_hours_per_week) * 100

        # Check if feasible
        is_feasible = required_allocation <= 100

        return {
            "target_duration_weeks": target_duration_weeks,
            "total_hours": total_hours,
            "team_size": team_size,
            "required_hours_per_week": round(required_hours_per_week, 1),
            "available_hours_per_week": available_hours_per_week,
            "required_allocation_percent": round(required_allocation, 1),
            "is_feasible": is_feasible,
            "recommendation": self._get_recommendation(
                required_allocation,
                is_feasible,
                team_size
            )
        }

    def _get_recommendation(
        self,
        required_allocation: float,
        is_feasible: bool,
        current_team_size: int
    ) -> str:
        """Generate schedule optimization recommendation."""
        if is_feasible and required_allocation <= 80:
            return "Schedule is feasible with current team size"
        elif is_feasible and required_allocation <= 100:
            return "Schedule is tight. Consider adding buffer or reducing scope"
        else:
            additional_team = math.ceil((required_allocation - 100) / 100)
            return f"Schedule requires {additional_team} additional team member(s)"