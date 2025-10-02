"""Estimation endpoints."""

import logging
from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.crud.project import project_crud
from app.schemas.estimation import (
    EstimationRequest,
    EstimationResponse,
    ComplexityFactorsResponse,
    ComplexityFactorInfo,
    CostCalculationRequest,
    CostCalculationResponse
)
from app.services.estimation.engine import EstimationEngine
from app.services.estimation.complexity import ComplexityCalculator
from app.services.cost.cost_calculator import CostCalculator


logger = logging.getLogger(__name__)
router = APIRouter()
estimation_engine = EstimationEngine()
complexity_calculator = ComplexityCalculator()
cost_calculator = CostCalculator()


@router.post("/{project_id}/estimate", response_model=EstimationResponse)
async def calculate_estimate(
    *,
    db: AsyncSession = Depends(get_db),
    project_id: UUID,
    estimation_request: EstimationRequest,
    current_user: User = Depends(get_current_user)
) -> EstimationResponse:
    """
    Calculate full project estimate.

    Args:
        db: Database session
        project_id: Project ID
        estimation_request: Estimation parameters
        current_user: Current authenticated user

    Returns:
        Estimation results
    """
    # Get project
    project = await project_crud.get(db, id=project_id)

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Calculate estimate
    logger.info(f"Estimation request for project {project_id}: base_hours_override={estimation_request.base_hours_override}, client_complexity={estimation_request.client_complexity}")
    result = estimation_engine.calculate_estimate(
        project_size=estimation_request.project_size,
        complexity_factors=estimation_request.complexity_factors,
        client_profile=estimation_request.client_profile,
        resource_availability=estimation_request.resource_availability,
        contingency_percent=estimation_request.contingency_percent,
        overhead_percent=estimation_request.overhead_percent,
        base_hours_override=estimation_request.base_hours_override,
        client_complexity=estimation_request.client_complexity
    )

    # Update project with results
    await project_crud.update(
        db,
        db_obj=project,
        obj_in={
            "base_hours": result.base_hours,
            "complexity_multiplier": result.complexity_multiplier,
            "adjusted_hours": result.adjusted_hours,
            "total_hours": result.total_hours,
            "duration_weeks": result.duration_weeks,
            "confidence_level": result.confidence_level
        }
    )

    return EstimationResponse(**result.to_dict())


@router.post("/quick-estimate", response_model=EstimationResponse)
async def quick_estimate(
    *,
    estimation_request: EstimationRequest,
    current_user: User = Depends(get_current_user)
) -> EstimationResponse:
    """
    Quick estimation without saving to project.

    Args:
        estimation_request: Estimation parameters
        current_user: Current authenticated user

    Returns:
        Estimation results
    """
    # Calculate estimate
    result = estimation_engine.calculate_estimate(
        project_size=estimation_request.project_size,
        complexity_factors=estimation_request.complexity_factors,
        client_profile=estimation_request.client_profile,
        resource_availability=estimation_request.resource_availability,
        contingency_percent=estimation_request.contingency_percent,
        overhead_percent=estimation_request.overhead_percent,
        base_hours_override=estimation_request.base_hours_override,
        client_complexity=estimation_request.client_complexity
    )

    return EstimationResponse(**result.to_dict())


@router.get("/complexity-factors", response_model=ComplexityFactorsResponse)
async def get_complexity_factors(
    current_user: User = Depends(get_current_user)
) -> ComplexityFactorsResponse:
    """
    Get all available complexity factors.

    Args:
        current_user: Current authenticated user

    Returns:
        Dictionary of complexity factors with metadata
    """
    factors = complexity_calculator.get_all_factors()

    factors_response = {
        name: ComplexityFactorInfo(**info)
        for name, info in factors.items()
    }

    return ComplexityFactorsResponse(factors=factors_response)


@router.post("/calculate-costs", response_model=CostCalculationResponse)
async def calculate_costs(
    *,
    cost_request: CostCalculationRequest,
    current_user: User = Depends(get_current_user)
) -> CostCalculationResponse:
    """
    Calculate cost breakdown for deliverables with role-based rates.

    Args:
        cost_request: List of deliverables with hours and optional custom rates
        current_user: Current authenticated user

    Returns:
        Cost breakdown by deliverable and by role
    """
    # Initialize calculator with custom rates if provided
    calculator = CostCalculator(cost_request.custom_rates) if cost_request.custom_rates else cost_calculator

    # Convert deliverables to dictionary format expected by calculator
    deliverables_list = [
        {"name": d.name, "hours": d.hours}
        for d in cost_request.deliverables
    ]

    # Calculate project costs
    result = calculator.calculate_project_cost(deliverables_list)

    logger.info(f"Cost calculation: {len(deliverables_list)} deliverables, "
                f"total ${result['summary']['total_cost']:,.2f}")

    return CostCalculationResponse(**result)