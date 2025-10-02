"""Deliverables endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import json

from app.dependencies import get_current_user
from app.data.standard_deliverables import get_deliverables_for_discipline, get_all_disciplines
from app.data.project_templates import get_project_template, get_recommended_deliverables, PROJECT_PHASES
from app.models.user import User

router = APIRouter()


@router.get("/standard/{discipline}")
async def get_standard_deliverables(
    discipline: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get standard deliverables for a discipline.

    Args:
        discipline: Engineering discipline
        current_user: Current authenticated user

    Returns:
        List of standard deliverables
    """
    print(f"DEBUG: Received discipline request: {discipline}")
    deliverables = get_deliverables_for_discipline(discipline)
    print(f"DEBUG: Found {len(deliverables) if deliverables else 0} deliverables")

    if not deliverables:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No standard deliverables found for discipline: {discipline}"
        )

    return {
        "discipline": discipline,
        "deliverables": deliverables
    }


@router.get("/disciplines")
async def list_disciplines(
    current_user: User = Depends(get_current_user)
):
    """
    List all available disciplines.

    Args:
        current_user: Current authenticated user

    Returns:
        List of discipline names
    """
    return {
        "disciplines": get_all_disciplines()
    }


@router.get("/template/{project_size}/{discipline}")
async def get_project_deliverables_template(
    project_size: str,
    discipline: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get recommended project template with deliverables organized by phase and discipline.

    Args:
        project_size: Project size (small, medium, large)
        discipline: Engineering discipline
        current_user: Current authenticated user

    Returns:
        Project template with phases and recommended deliverables organized by phase and discipline
    """
    template = get_project_template(project_size)

    # Get all deliverables from all disciplines in the template
    all_deliverables = []
    for disc_key, disc_deliverables in template["recommended_deliverables"].items():
        all_deliverables.extend(disc_deliverables)

    # Organize deliverables by phase and discipline
    # Explicitly use dict() to ensure proper JSON serialization
    deliverables_by_phase = dict()
    for phase_key in template["phases"]:
        phase_deliverables = [d for d in all_deliverables if d["phase"] == phase_key]

        # Group by discipline within each phase - use dict() explicitly
        by_discipline = dict()
        for deliverable in phase_deliverables:
            disc_key = str(deliverable.get("discipline", "Multidiscipline"))
            if disc_key not in by_discipline:
                by_discipline[disc_key] = []
            by_discipline[disc_key].append(dict(deliverable))

        deliverables_by_phase[str(phase_key)] = dict(by_discipline)

    result = {
        "project_size": project_size,
        "discipline": discipline,
        "template_name": template["name"],
        "description": template["description"],
        "phases": [PROJECT_PHASES[phase] for phase in template["phases"]],
        "deliverables_by_phase": deliverables_by_phase,
        "total_hours": sum(d["hours"] for d in all_deliverables),
        "disciplines": sorted(list(set(d.get("discipline", "Multidiscipline") for d in all_deliverables)))
    }

    print("DEBUG: deliverables_by_phase structure:")
    for phase_key, phase_data in deliverables_by_phase.items():
        print(f"  Phase '{phase_key}': type={type(phase_data)}, keys={list(phase_data.keys()) if isinstance(phase_data, dict) else 'N/A'}")

    # Use JSONResponse to ensure proper serialization
    return JSONResponse(content=result)


@router.get("/phases")
async def list_project_phases(
    current_user: User = Depends(get_current_user)
):
    """
    List all available project phases.

    Args:
        current_user: Current authenticated user

    Returns:
        List of project phases
    """
    return {
        "phases": PROJECT_PHASES
    }