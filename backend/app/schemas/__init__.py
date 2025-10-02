"""Pydantic schemas."""

# Import all schemas for easy access
# Note: Complex schemas with circular references (IndustryWithCompanies, CompanyWithRateSheets)
# should be imported directly from their modules in endpoints to avoid circular import issues
from app.schemas.industry import (
    IndustryBase,
    IndustryCreate,
    IndustryUpdate,
    IndustryResponse,
)
from app.schemas.company import (
    CompanyBase,
    CompanyCreate,
    CompanyUpdate,
    CompanyResponse,
    CompanyClone,
)
from app.schemas.rate_sheet import (
    RateSheetBase,
    RateSheetCreate,
    RateSheetUpdate,
    RateSheetResponse,
    RateSheetClone,
)

__all__ = [
    # Industry schemas
    "IndustryBase",
    "IndustryCreate",
    "IndustryUpdate",
    "IndustryResponse",
    # Company schemas
    "CompanyBase",
    "CompanyCreate",
    "CompanyUpdate",
    "CompanyResponse",
    "CompanyClone",
    # Rate sheet schemas
    "RateSheetBase",
    "RateSheetCreate",
    "RateSheetUpdate",
    "RateSheetResponse",
    "RateSheetClone",
]