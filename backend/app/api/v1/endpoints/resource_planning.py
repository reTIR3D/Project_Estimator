"""Resource planning endpoints."""

from typing import List
from fastapi import APIRouter, HTTPException

from app.services.resource_planning import ResourcePlanner

router = APIRouter()


@router.post("/calculate-fte")
async def calculate_fte_requirements(
    deliverables: List[dict],
    duration_weeks: int = 12
):
    """
    Calculate FTE requirements by discipline over time.

    Args:
        deliverables: List of deliverable configurations
        duration_weeks: Project duration in weeks
    """
    planner = ResourcePlanner(duration_weeks=duration_weeks)
    requirements = planner.calculate_fte_requirements(deliverables, duration_weeks)

    return {
        "requirements": [
            {
                "discipline": req.discipline,
                "week": req.week,
                "hours": req.hours,
                "fte": req.fte,
                "conflicts": req.conflicts
            }
            for req in requirements
        ]
    }


@router.post("/recommend-team")
async def recommend_team_structure(
    total_hours: int,
    duration_weeks: int = 12
):
    """
    Get team structure recommendation based on total hours.

    Args:
        total_hours: Total project hours
        duration_weeks: Project duration in weeks
    """
    planner = ResourcePlanner(duration_weeks=duration_weeks)
    recommendations, metadata = planner.get_team_structure_recommendation(
        total_hours, duration_weeks
    )

    return {
        "recommendations": [
            {
                "role": rec.role,
                "count": rec.count,
                "utilization": rec.utilization,
                "cost": rec.cost
            }
            for rec in recommendations
        ],
        "metadata": metadata
    }


@router.post("/reality-check")
async def get_reality_checks(
    deliverables: List[dict],
    duration_weeks: int = 12,
    total_hours: int = 0
):
    """
    Get reality check warnings for resource planning.

    Args:
        deliverables: List of deliverable configurations
        duration_weeks: Project duration in weeks
        total_hours: Total project hours
    """
    planner = ResourcePlanner(duration_weeks=duration_weeks)

    # Calculate requirements
    requirements = planner.calculate_fte_requirements(deliverables, duration_weeks)

    # Get team recommendations
    team_recommendations, _ = planner.get_team_structure_recommendation(
        total_hours, duration_weeks
    )

    # Get warnings
    warnings = planner.get_reality_checks(requirements, team_recommendations)

    return {"warnings": warnings}
