"""Resource planning and FTE calculation service."""

from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from collections import defaultdict
import math


class RoleDefinition:
    """Definition of a role with capabilities and efficiency."""

    def __init__(
        self,
        name: str,
        capable_deliverables: List[str],
        efficiency: float = 1.0,
        max_concurrent_tasks: int = 3,
        utilization_target: float = 0.85,
        hourly_rate: float = 150.0,
        seniority_level: str = "mid"
    ):
        self.name = name
        self.capable_deliverables = capable_deliverables
        self.efficiency = efficiency
        self.max_concurrent_tasks = max_concurrent_tasks
        self.utilization_target = utilization_target
        self.hourly_rate = hourly_rate
        self.seniority_level = seniority_level


# Standard role definitions
ROLE_DEFINITIONS = {
    "lead_engineer": RoleDefinition(
        name="Lead Engineer",
        capable_deliverables=["All"],
        efficiency=1.1,
        max_concurrent_tasks=5,
        utilization_target=0.60,
        hourly_rate=210.0,
        seniority_level="lead"
    ),
    "senior_engineer": RoleDefinition(
        name="Senior Engineer",
        capable_deliverables=["All"],
        efficiency=1.0,
        max_concurrent_tasks=3,
        utilization_target=0.85,
        hourly_rate=185.0,
        seniority_level="senior"
    ),
    "engineer": RoleDefinition(
        name="Engineer",
        capable_deliverables=["Most"],
        efficiency=0.8,
        max_concurrent_tasks=2,
        utilization_target=0.90,
        hourly_rate=145.0,
        seniority_level="mid"
    ),
    "junior_engineer": RoleDefinition(
        name="Junior Engineer",
        capable_deliverables=["Basic"],
        efficiency=0.6,
        max_concurrent_tasks=1,
        utilization_target=0.95,
        hourly_rate=95.0,
        seniority_level="junior"
    ),
}


class ResourceRequirement:
    """Resource requirement for a specific period."""

    def __init__(
        self,
        discipline: str,
        week: int,
        hours: int,
        deliverables: List[str] = None
    ):
        self.discipline = discipline
        self.week = week
        self.hours = hours
        self.deliverables = deliverables or []
        self.fte = 0.0
        self.conflicts: List[str] = []


class TeamRecommendation:
    """Team composition recommendation."""

    def __init__(self, role: str, count: float, utilization: float, cost: float):
        self.role = role
        self.count = count
        self.utilization = utilization
        self.cost = cost


class ResourcePlanner:
    """Resource planning and FTE calculation engine."""

    def __init__(self, duration_weeks: int = 12):
        self.duration_weeks = duration_weeks
        self.hours_per_week = 40

    def calculate_fte_requirements(
        self,
        deliverables: List[Dict],
        duration_weeks: int = None
    ) -> List[ResourceRequirement]:
        """
        Calculate FTE requirements by discipline over time.

        Args:
            deliverables: List of deliverable configs with hours and discipline
            duration_weeks: Project duration in weeks

        Returns:
            List of ResourceRequirement objects by week and discipline
        """
        if duration_weeks:
            self.duration_weeks = duration_weeks

        # Group deliverables by discipline
        workload_by_discipline: Dict[str, int] = defaultdict(int)

        for deliv in deliverables:
            discipline = deliv.get('discipline', 'General')
            hours = deliv.get('adjusted_hours') or deliv.get('base_hours', 0)
            workload_by_discipline[discipline] += hours

        # Distribute hours evenly across weeks (simplified)
        requirements = []
        for discipline, total_hours in workload_by_discipline.items():
            hours_per_week = total_hours / self.duration_weeks

            for week in range(1, self.duration_weeks + 1):
                # Apply reality factors
                actual_hours = self._apply_reality_factors(hours_per_week, week)

                # Calculate FTE (40 hours/week at 85% utilization = 34 billable hours)
                billable_hours_per_week = self.hours_per_week * 0.85
                fte = actual_hours / billable_hours_per_week

                req = ResourceRequirement(
                    discipline=discipline,
                    week=week,
                    hours=int(actual_hours)
                )
                req.fte = round(fte, 2)

                # Check for conflicts
                if fte > 0 and fte < 0.5:
                    req.conflicts.append(f"Low utilization: {fte:.1f} FTE is inefficient")
                elif fte != int(fte) and fte > 1.0:
                    req.conflicts.append(f"Fractional FTE: {fte:.1f} → Need to round to {math.ceil(fte)}")

                requirements.append(req)

        return requirements

    def _apply_reality_factors(self, base_hours: float, week: int) -> float:
        """Apply reality factors like ramp-up time."""
        multiplier = 1.0

        # Ramp-up factor for first 3 weeks
        if week <= 3:
            multiplier *= 1.3

        # Review cycle overhead (assume periodic reviews)
        if week % 4 == 0:  # Every 4th week
            multiplier *= 1.2

        return base_hours * multiplier

    def get_team_structure_recommendation(
        self,
        total_hours: int,
        duration_weeks: int = None
    ) -> Tuple[List[TeamRecommendation], Dict]:
        """
        Recommend team structure based on total project hours.

        Args:
            total_hours: Total project hours
            duration_weeks: Project duration

        Returns:
            Tuple of (team recommendations, metadata)
        """
        if duration_weeks:
            self.duration_weeks = duration_weeks

        # Determine project size category
        if total_hours < 1000:
            size = "small"
            overhead = 1.1
        elif total_hours < 5000:
            size = "medium"
            overhead = 1.15
        else:
            size = "large"
            overhead = 1.25

        # Apply overhead
        adjusted_hours = total_hours * overhead

        # Calculate base FTE requirement
        total_available_hours = self.duration_weeks * self.hours_per_week * 0.85
        base_fte = adjusted_hours / total_available_hours

        # Build team recommendation based on size
        recommendations = []

        if size == "small":
            # Small project: 1 lead (20%), 1 senior, 1 mid
            recommendations.extend([
                TeamRecommendation("Lead Engineer", 0.2, 60, 0.2 * 210 * self.hours_per_week * self.duration_weeks),
                TeamRecommendation("Senior Engineer", 1.0, 85, 1.0 * 185 * self.hours_per_week * self.duration_weeks),
                TeamRecommendation("Engineer", 1.0, 90, 1.0 * 145 * self.hours_per_week * self.duration_weeks),
            ])
        elif size == "medium":
            # Medium project: 1 lead (50%), 2 senior, 3 mid, 1 junior
            recommendations.extend([
                TeamRecommendation("Lead Engineer", 0.5, 60, 0.5 * 210 * self.hours_per_week * self.duration_weeks),
                TeamRecommendation("Senior Engineer", 2.0, 85, 2.0 * 185 * self.hours_per_week * self.duration_weeks),
                TeamRecommendation("Engineer", 3.0, 90, 3.0 * 145 * self.hours_per_week * self.duration_weeks),
                TeamRecommendation("Junior Engineer", 1.0, 95, 1.0 * 95 * self.hours_per_week * self.duration_weeks),
            ])
        else:
            # Large project: 1 PM, 1 lead, 5 senior, 8 mid, 3 junior, 1 doc control
            recommendations.extend([
                TeamRecommendation("Project Manager", 1.0, 80, 1.0 * 220 * self.hours_per_week * self.duration_weeks),
                TeamRecommendation("Lead Engineer", 1.0, 60, 1.0 * 210 * self.hours_per_week * self.duration_weeks),
                TeamRecommendation("Senior Engineer", 5.0, 85, 5.0 * 185 * self.hours_per_week * self.duration_weeks),
                TeamRecommendation("Engineer", 8.0, 90, 8.0 * 145 * self.hours_per_week * self.duration_weeks),
                TeamRecommendation("Junior Engineer", 3.0, 95, 3.0 * 95 * self.hours_per_week * self.duration_weeks),
                TeamRecommendation("Document Control", 1.0, 90, 1.0 * 85 * self.hours_per_week * self.duration_weeks),
            ])

        metadata = {
            "project_size": size,
            "coordination_overhead": overhead,
            "base_fte_required": round(base_fte, 2),
            "total_hours": total_hours,
            "adjusted_hours": int(adjusted_hours),
            "duration_weeks": self.duration_weeks
        }

        return recommendations, metadata

    def get_reality_checks(
        self,
        requirements: List[ResourceRequirement],
        team_recommendations: List[TeamRecommendation]
    ) -> List[Dict]:
        """
        Generate reality check warnings.

        Args:
            requirements: FTE requirements by week/discipline
            team_recommendations: Recommended team composition

        Returns:
            List of warning/alert dictionaries
        """
        warnings = []

        # Check for fractional FTEs
        fractional_ftes = [r for r in requirements if r.fte > 0 and r.fte != int(r.fte) and r.fte > 1.0]
        if fractional_ftes:
            warnings.append({
                "type": "fractional_fte",
                "severity": "medium",
                "title": "Fractional FTE Requirements",
                "message": f"Found {len(fractional_ftes)} periods requiring fractional staffing. Consider rounding up or adjusting timeline.",
                "details": [f"Week {r.week} ({r.discipline}): {r.fte:.1f} FTE" for r in fractional_ftes[:5]]
            })

        # Check for staffing spikes
        fte_by_week = defaultdict(float)
        for req in requirements:
            fte_by_week[req.week] += req.fte

        avg_fte = sum(fte_by_week.values()) / len(fte_by_week) if fte_by_week else 0
        peak_week = max(fte_by_week.items(), key=lambda x: x[1]) if fte_by_week else (0, 0)

        if peak_week[1] > avg_fte * 1.5:
            warnings.append({
                "type": "staffing_spike",
                "severity": "high",
                "title": "Staffing Spike Detected",
                "message": f"Week {peak_week[0]} requires {peak_week[1]:.1f} FTE (average: {avg_fte:.1f})",
                "recommendation": "Consider leveling workload or planning for temporary staff"
            })

        # Check for low utilization periods
        low_util = [r for r in requirements if 0 < r.fte < 0.3]
        if len(low_util) > 5:
            warnings.append({
                "type": "low_utilization",
                "severity": "low",
                "title": "Low Utilization Periods",
                "message": f"{len(low_util)} periods with <30% utilization detected",
                "recommendation": "Consider consolidating work or adjusting resource assignments"
            })

        # Check total team size
        total_team_count = sum(r.count for r in team_recommendations)
        if total_team_count > 15:
            warnings.append({
                "type": "large_team",
                "severity": "medium",
                "title": "Large Team Size",
                "message": f"Recommended team size: {total_team_count:.0f} people",
                "recommendation": "Large teams require significant coordination. Consider +25% overhead for meetings/communication."
            })

        return warnings
