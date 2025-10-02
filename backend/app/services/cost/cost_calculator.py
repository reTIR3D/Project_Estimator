"""Cost calculation service with role-based breakdowns."""

import logging
from typing import Dict, List, Any, Optional

from app.data.role_rates import (
    get_role_breakdown,
    calculate_deliverable_cost,
    DEFAULT_RATES,
    Role
)
from app.data.deliverable_metadata import get_deliverable_metadata

logger = logging.getLogger(__name__)


class CostBreakdown:
    """Container for cost calculation results."""

    def __init__(self,
                 deliverable_name: str,
                 total_hours: int,
                 role_hours: Dict[str, int],
                 role_costs: Dict[str, float],
                 total_cost: float):
        self.deliverable_name = deliverable_name
        self.total_hours = total_hours
        self.role_hours = role_hours
        self.role_costs = role_costs
        self.total_cost = total_cost

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API response."""
        return {
            "deliverable_name": self.deliverable_name,
            "total_hours": self.total_hours,
            "total_cost": self.total_cost,
            "role_breakdown": [
                {
                    "role": role,
                    "hours": hours,
                    "cost": self.role_costs.get(role, 0.0)
                }
                for role, hours in self.role_hours.items()
            ]
        }


class CostCalculator:
    """
    Calculate costs from deliverables with role-based breakdowns.

    This service:
    1. Takes deliverable hours
    2. Breaks down hours by role (based on deliverable type)
    3. Applies hourly rates to calculate costs
    4. Provides both individual and aggregated cost breakdowns
    """

    def __init__(self, custom_rates: Optional[Dict[str, float]] = None):
        """
        Initialize cost calculator.

        Args:
            custom_rates: Optional custom hourly rates (uses defaults if not provided)
        """
        self.rates = custom_rates if custom_rates else DEFAULT_RATES.copy()
        logger.info(f"CostCalculator initialized with {len(self.rates)} role rates")

    def calculate_deliverable_cost(self,
                                     deliverable_name: str,
                                     hours: int) -> CostBreakdown:
        """
        Calculate cost breakdown for a single deliverable.

        Args:
            deliverable_name: Name of the deliverable
            hours: Total hours for the deliverable

        Returns:
            CostBreakdown with role-based hours and costs
        """
        # Get deliverable metadata to determine type
        metadata = get_deliverable_metadata(deliverable_name)
        deliverable_type = metadata.get("type", "document")

        # Get role-based hour breakdown
        role_hours = get_role_breakdown(hours, deliverable_type)

        # Calculate cost for each role
        role_costs = {}
        total_cost = 0.0

        for role, role_hour_count in role_hours.items():
            rate = self.rates.get(role, self.rates.get(Role.ENGINEER, 100.0))
            cost = role_hour_count * rate
            role_costs[role] = round(cost, 2)
            total_cost += cost

        logger.debug(f"Calculated cost for '{deliverable_name}': "
                     f"{hours}h = ${total_cost:,.2f}")

        return CostBreakdown(
            deliverable_name=deliverable_name,
            total_hours=hours,
            role_hours=role_hours,
            role_costs=role_costs,
            total_cost=round(total_cost, 2)
        )

    def calculate_project_cost(self,
                                 deliverables: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate total project cost from multiple deliverables.

        Args:
            deliverables: List of deliverable dictionaries with 'name' and 'hours'

        Returns:
            Dictionary with project totals and per-deliverable breakdowns
        """
        deliverable_costs = []
        total_hours = 0
        total_cost = 0.0
        role_totals_hours = {}
        role_totals_cost = {}

        for deliverable in deliverables:
            name = deliverable.get("name", "Unknown")
            hours = deliverable.get("adjusted_hours", deliverable.get("hours", 0))

            # Calculate individual deliverable cost
            breakdown = self.calculate_deliverable_cost(name, hours)
            deliverable_costs.append(breakdown.to_dict())

            # Aggregate totals
            total_hours += hours
            total_cost += breakdown.total_cost

            # Aggregate by role
            for role, role_hours in breakdown.role_hours.items():
                role_totals_hours[role] = role_totals_hours.get(role, 0) + role_hours
                role_totals_cost[role] = role_totals_cost.get(role, 0.0) + breakdown.role_costs.get(role, 0.0)

        # Calculate role summary
        role_summary = [
            {
                "role": role,
                "hours": hours,
                "cost": round(role_totals_cost.get(role, 0.0), 2),
                "percentage": round((hours / total_hours * 100) if total_hours > 0 else 0, 1)
            }
            for role, hours in sorted(role_totals_hours.items(),
                                       key=lambda x: x[1],
                                       reverse=True)
        ]

        logger.info(f"Project cost calculation: {len(deliverables)} deliverables, "
                    f"{total_hours}h, ${total_cost:,.2f}")

        return {
            "summary": {
                "total_hours": total_hours,
                "total_cost": round(total_cost, 2),
                "deliverable_count": len(deliverables),
                "average_cost_per_hour": round(total_cost / total_hours, 2) if total_hours > 0 else 0
            },
            "by_role": role_summary,
            "by_deliverable": deliverable_costs
        }

    def get_rates(self) -> Dict[str, float]:
        """Get current hourly rates."""
        return self.rates.copy()

    def update_rate(self, role: str, new_rate: float):
        """
        Update hourly rate for a specific role.

        Args:
            role: Role name
            new_rate: New hourly rate
        """
        self.rates[role] = new_rate
        logger.info(f"Updated rate for {role}: ${new_rate}/hr")