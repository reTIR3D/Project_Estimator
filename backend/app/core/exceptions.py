"""Custom exceptions."""

from typing import Any, Optional


class EstimationSystemException(Exception):
    """Base exception for estimation system."""

    def __init__(self, message: str, details: Optional[dict[str, Any]] = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)


class ValidationException(EstimationSystemException):
    """Raised when validation fails."""
    pass


class CalculationException(EstimationSystemException):
    """Raised when calculation fails."""
    pass


class ResourceConflictException(EstimationSystemException):
    """Raised when resource conflict is detected."""
    pass


class InsufficientDataException(EstimationSystemException):
    """Raised when insufficient data for operation."""
    pass


class NotFoundException(EstimationSystemException):
    """Raised when resource not found."""
    pass


class PermissionDeniedException(EstimationSystemException):
    """Raised when user lacks permissions."""
    pass