"""Main API router."""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    projects,
    estimation,
    deliverables,
    clients,
    client_templates,
    industries,
    companies,
    rate_sheets,
    deliverable_templates,
    project_size_settings,
    resource_planning,
)

# Force reload
api_router = APIRouter()


# Include endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
api_router.include_router(estimation.router, prefix="/estimation", tags=["Estimation"])
api_router.include_router(deliverables.router, prefix="/deliverables", tags=["Deliverables"])

# Legacy client endpoints (keep for backward compatibility)
api_router.include_router(clients.router, prefix="/clients", tags=["Clients (Legacy)"])
api_router.include_router(client_templates.router, prefix="/client-templates", tags=["Client Templates (Legacy)"])

# New hierarchical client management
api_router.include_router(industries.router, prefix="/industries", tags=["Industries"])
api_router.include_router(companies.router, prefix="/companies", tags=["Companies"])
api_router.include_router(rate_sheets.router, prefix="/rate-sheets", tags=["Rate Sheets"])
api_router.include_router(deliverable_templates.router, prefix="/deliverable-templates", tags=["Deliverable Templates"])
api_router.include_router(project_size_settings.router, prefix="/project-size-settings", tags=["Project Size Settings"])
api_router.include_router(resource_planning.router, prefix="/resource-planning", tags=["Resource Planning"])