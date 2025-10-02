"""Project management endpoints."""

from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from decimal import Decimal

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.project import ProjectStatus, ProjectType, WorkType, ProcessType
from app.crud.project import project_crud
from app.crud.project_size_settings import project_size_settings
from app.schemas.project import Project, ProjectCreate, ProjectUpdate, ProjectListResponse


router = APIRouter()


async def apply_phase_gate_recommendation(
    db: AsyncSession,
    project_data: dict,
    total_hours: Optional[int] = None
) -> dict:
    """
    Apply phase-gate recommendation logic based on project size settings.

    Args:
        db: Database session
        project_data: Project data dictionary
        total_hours: Total project hours (if available)

    Returns:
        Updated project data with phase-gate recommendation
    """
    # Only apply to discrete projects
    if project_data.get('work_type') != WorkType.DISCRETE_PROJECT:
        return project_data

    # Get active size settings
    settings = await project_size_settings.get_active_settings(db)
    if not settings:
        return project_data

    # Use provided total_hours or get from project_data
    hours = total_hours or project_data.get('total_hours', 0)

    if hours and settings.should_recommend_phase_gate(hours):
        # Only set recommendation if not already manually set
        if not project_data.get('process_type_overridden', False):
            project_data['process_type_recommended'] = ProcessType.PHASE_GATE
            # If no process type is set, use the recommendation
            if not project_data.get('process_type'):
                project_data['process_type'] = ProcessType.PHASE_GATE
        else:
            # Still set the recommendation, but don't override user choice
            project_data['process_type_recommended'] = ProcessType.PHASE_GATE
    else:
        # Recommend conventional process
        if not project_data.get('process_type_overridden', False):
            project_data['process_type_recommended'] = ProcessType.CONVENTIONAL
            if not project_data.get('process_type'):
                project_data['process_type'] = ProcessType.CONVENTIONAL
        else:
            project_data['process_type_recommended'] = ProcessType.CONVENTIONAL

    return project_data


@router.post("/", response_model=Project, status_code=status.HTTP_201_CREATED)
async def create_project(
    *,
    db: AsyncSession = Depends(get_db),
    project_in: ProjectCreate,
    current_user: User = Depends(get_current_user)
) -> Project:
    """
    Create new project.

    Args:
        db: Database session
        project_in: Project data
        current_user: Current authenticated user

    Returns:
        Created project
    """
    # Check if project code already exists
    if project_in.project_code:
        existing = await project_crud.get_by_code(db, project_code=project_in.project_code)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Project code already exists"
            )

    # Create project with created_by set to current user
    from app.models.project import Project as ProjectModel

    project_data = project_in.model_dump()

    # Apply phase-gate recommendation logic
    project_data = await apply_phase_gate_recommendation(db, project_data)

    db_project = ProjectModel(**project_data, created_by=current_user.id)
    db.add(db_project)
    await db.commit()
    await db.refresh(db_project)

    return db_project


@router.get("/", response_model=ProjectListResponse)
async def list_projects(
    *,
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
) -> ProjectListResponse:
    """
    List all projects.

    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records
        current_user: Current authenticated user

    Returns:
        List of projects
    """
    projects = await project_crud.get_multi(db, skip=skip, limit=limit)

    return ProjectListResponse(
        items=projects,
        total=len(projects),
        skip=skip,
        limit=limit
    )


@router.get("/{project_id}", response_model=Project)
async def get_project(
    *,
    db: AsyncSession = Depends(get_db),
    project_id: UUID,
    current_user: User = Depends(get_current_user)
) -> Project:
    """
    Get project by ID.

    Args:
        db: Database session
        project_id: Project ID
        current_user: Current authenticated user

    Returns:
        Project details
    """
    project = await project_crud.get(db, id=project_id)

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    return project


@router.put("/{project_id}", response_model=Project)
async def update_project(
    *,
    db: AsyncSession = Depends(get_db),
    project_id: UUID,
    project_in: ProjectUpdate,
    current_user: User = Depends(get_current_user)
) -> Project:
    """
    Update project.

    Args:
        db: Database session
        project_id: Project ID
        project_in: Update data
        current_user: Current authenticated user

    Returns:
        Updated project
    """
    project = await project_crud.get(db, id=project_id)

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Apply phase-gate recommendation logic if total_hours is being updated
    update_data = project_in.model_dump(exclude_unset=True)
    if 'total_hours' in update_data or 'work_type' in update_data:
        # Get current total_hours if not in update
        total_hours = update_data.get('total_hours', project.total_hours)
        # Merge current project data with updates
        merged_data = {**project.__dict__, **update_data}
        merged_data = await apply_phase_gate_recommendation(db, merged_data, total_hours)
        # Update only the recommendation fields
        update_data['process_type_recommended'] = merged_data.get('process_type_recommended')
        if not update_data.get('process_type_overridden', project.process_type_overridden):
            update_data['process_type'] = merged_data.get('process_type')

    project = await project_crud.update(db, db_obj=project, obj_in=project_in)

    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    *,
    db: AsyncSession = Depends(get_db),
    project_id: UUID,
    current_user: User = Depends(get_current_user)
) -> None:
    """
    Delete project (soft delete).

    Args:
        db: Database session
        project_id: Project ID
        current_user: Current authenticated user
    """
    project = await project_crud.get(db, id=project_id)

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    await project_crud.delete(db, id=project_id)


@router.get("/user/my-projects", response_model=List[Project])
async def get_my_projects(
    *,
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
) -> List[Project]:
    """
    Get projects created by current user.

    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records
        current_user: Current authenticated user

    Returns:
        List of user's projects
    """
    projects = await project_crud.get_by_user(
        db,
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )

    return projects


@router.get("/{project_id}/modules", response_model=List[Project])
async def get_project_modules(
    *,
    db: AsyncSession = Depends(get_db),
    project_id: UUID,
    current_user: User = Depends(get_current_user)
) -> List[Project]:
    """
    Get all child modules of a facility project.

    Args:
        db: Database session
        project_id: Parent project ID
        current_user: Current authenticated user

    Returns:
        List of child module projects
    """
    # Verify parent project exists
    parent_project = await project_crud.get(db, id=project_id)
    if not parent_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Get child modules
    from app.models.project import Project as ProjectModel
    result = await db.execute(
        select(ProjectModel).where(ProjectModel.parent_project_id == project_id)
    )
    modules = result.scalars().all()

    return modules


@router.get("/{project_id}/cost-summary")
async def get_project_cost_summary(
    *,
    db: AsyncSession = Depends(get_db),
    project_id: UUID,
    current_user: User = Depends(get_current_user)
) -> dict:
    """
    Get cost summary for a project, including rollup from child modules.

    Args:
        db: Database session
        project_id: Project ID
        current_user: Current authenticated user

    Returns:
        Cost summary with totals
    """
    project = await project_crud.get(db, id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Get project's own cost
    project_cost = project.total_cost or Decimal(0)
    project_hours = project.total_hours or 0

    # If this is a facility parent, get child module costs
    child_modules_cost = Decimal(0)
    child_modules_hours = 0
    child_modules = []

    if project.project_type == ProjectType.FACILITY_PARENT:
        from app.models.project import Project as ProjectModel
        result = await db.execute(
            select(ProjectModel).where(ProjectModel.parent_project_id == project_id)
        )
        modules = result.scalars().all()

        for module in modules:
            module_cost = module.total_cost or Decimal(0)
            module_hours = module.total_hours or 0
            child_modules_cost += module_cost
            child_modules_hours += module_hours
            child_modules.append({
                "id": str(module.id),
                "name": module.name,
                "total_cost": float(module_cost),
                "total_hours": module_hours
            })

    total_cost = project_cost + child_modules_cost
    total_hours = project_hours + child_modules_hours

    return {
        "project_id": str(project_id),
        "project_name": project.name,
        "project_type": project.project_type,
        "project_cost": float(project_cost),
        "project_hours": project_hours,
        "modules_cost": float(child_modules_cost),
        "modules_hours": child_modules_hours,
        "total_cost": float(total_cost),
        "total_hours": total_hours,
        "child_modules": child_modules
    }