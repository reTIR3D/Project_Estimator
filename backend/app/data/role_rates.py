"""Role rates and breakdown configurations for cost estimation."""

from typing import Dict
from enum import Enum


class Role(str, Enum):
    """Engineering roles for deliverable creation."""

    # Engineering roles
    LEAD_ENGINEER = "lead_engineer"
    SENIOR_ENGINEER = "senior_engineer"
    ENGINEER = "engineer"
    DESIGNER = "designer"

    # Review and QA roles
    QA_CHECKER = "qa_checker"
    TECHNICAL_REVIEWER = "technical_reviewer"

    # Support roles
    DOCUMENT_CONTROLLER = "document_controller"
    PROJECT_MANAGER = "project_manager"
    CAD_TECHNICIAN = "cad_technician"

    # Specialized
    COST_ESTIMATOR = "cost_estimator"
    SCHEDULER = "scheduler"


# Default hourly rates by role (USD)
DEFAULT_RATES: Dict[str, float] = {
    Role.LEAD_ENGINEER: 150.0,
    Role.SENIOR_ENGINEER: 125.0,
    Role.ENGINEER: 100.0,
    Role.DESIGNER: 85.0,
    Role.QA_CHECKER: 95.0,
    Role.TECHNICAL_REVIEWER: 115.0,
    Role.DOCUMENT_CONTROLLER: 65.0,
    Role.PROJECT_MANAGER: 160.0,
    Role.CAD_TECHNICIAN: 75.0,
    Role.COST_ESTIMATOR: 110.0,
    Role.SCHEDULER: 105.0,
}


# Default role distribution patterns by deliverable type
ROLE_DISTRIBUTIONS = {
    # Drawing-heavy deliverables
    "drawing": {
        Role.DESIGNER: 0.55,            # Creates drawings
        Role.LEAD_ENGINEER: 0.15,        # Reviews & directs
        Role.QA_CHECKER: 0.15,          # Quality check
        Role.DOCUMENT_CONTROLLER: 0.10,  # Formatting & packaging
        Role.PROJECT_MANAGER: 0.05,      # Coordination
    },

    # Calculation-heavy deliverables
    "calculation": {
        Role.ENGINEER: 0.50,             # Performs calculations
        Role.SENIOR_ENGINEER: 0.20,      # Reviews methodology
        Role.QA_CHECKER: 0.20,           # Independent check
        Role.DOCUMENT_CONTROLLER: 0.07,  # Formatting
        Role.PROJECT_MANAGER: 0.03,      # Coordination
    },

    # Document-heavy deliverables (specs, reports)
    "document": {
        Role.SENIOR_ENGINEER: 0.45,      # Writes content
        Role.LEAD_ENGINEER: 0.15,        # Reviews
        Role.ENGINEER: 0.15,             # Supporting content
        Role.QA_CHECKER: 0.15,           # Review
        Role.DOCUMENT_CONTROLLER: 0.08,  # Formatting
        Role.PROJECT_MANAGER: 0.02,      # Coordination
    },

    # List/schedule deliverables
    "list": {
        Role.ENGINEER: 0.55,             # Creates list
        Role.SENIOR_ENGINEER: 0.15,      # Reviews
        Role.QA_CHECKER: 0.15,           # Quality check
        Role.DOCUMENT_CONTROLLER: 0.10,  # Formatting
        Role.PROJECT_MANAGER: 0.05,      # Coordination
    },

    # 3D model deliverables
    "model": {
        Role.DESIGNER: 0.50,             # Modeling
        Role.CAD_TECHNICIAN: 0.25,       # Detailing
        Role.LEAD_ENGINEER: 0.15,        # Reviews
        Role.QA_CHECKER: 0.08,           # Clash detection/QC
        Role.PROJECT_MANAGER: 0.02,      # Coordination
    },

    # Planning deliverables
    "planning": {
        Role.PROJECT_MANAGER: 0.40,      # Creates plan
        Role.SCHEDULER: 0.25,            # Schedule development
        Role.COST_ESTIMATOR: 0.15,       # Budget input
        Role.LEAD_ENGINEER: 0.15,        # Technical input
        Role.DOCUMENT_CONTROLLER: 0.05,  # Formatting
    },
}


def get_role_breakdown(hours: int, distribution_type: str = "document") -> Dict[str, int]:
    """
    Calculate role-based hour breakdown for a deliverable.

    Args:
        hours: Total hours for the deliverable
        distribution_type: Type of distribution pattern to use

    Returns:
        Dictionary mapping role to hours
    """
    distribution = ROLE_DISTRIBUTIONS.get(distribution_type, ROLE_DISTRIBUTIONS["document"])

    breakdown = {}
    for role, percentage in distribution.items():
        breakdown[role] = round(hours * percentage)

    # Adjust for rounding errors - ensure total matches input
    total_allocated = sum(breakdown.values())
    if total_allocated != hours:
        # Add/subtract difference to largest role
        largest_role = max(breakdown.items(), key=lambda x: x[1])[0]
        breakdown[largest_role] += (hours - total_allocated)

    return breakdown


def calculate_deliverable_cost(role_breakdown: Dict[str, int],
                                 rates: Dict[str, float] = None) -> float:
    """
    Calculate total cost from role breakdown.

    Args:
        role_breakdown: Dictionary mapping role to hours
        rates: Optional custom rates (uses defaults if not provided)

    Returns:
        Total cost in USD
    """
    if rates is None:
        rates = DEFAULT_RATES

    total_cost = 0.0
    for role, hours in role_breakdown.items():
        rate = rates.get(role, rates.get(Role.ENGINEER, 100.0))  # Default to engineer rate
        total_cost += hours * rate

    return round(total_cost, 2)