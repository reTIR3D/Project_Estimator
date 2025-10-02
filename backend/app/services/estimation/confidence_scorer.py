"""Confidence scoring service."""

from typing import Dict
import logging

from app.models.project import ProjectSize


logger = logging.getLogger(__name__)


class ConfidenceScorer:
    """
    Calculate confidence scores for estimates.

    Confidence is based on:
    - Complexity factors (more complexity = lower confidence)
    - Resource availability (low availability = lower confidence)
    - Historical data availability (no data = lower confidence)
    - Project size (larger = lower confidence)
    """

    def calculate_confidence(
        self,
        complexity_factors: Dict[str, bool],
        resource_availability: Dict[str, float],
        project_size: ProjectSize,
        has_historical_data: bool = False
    ) -> Dict[str, any]:
        """
        Calculate confidence score and level.

        Args:
            complexity_factors: Dictionary of complexity factors
            resource_availability: Resource availability data
            project_size: Project size classification
            has_historical_data: Whether historical data exists

        Returns:
            Dictionary with confidence score and level
        """
        # Start with base confidence
        confidence_score = 100.0

        # Reduce confidence for each complexity factor
        active_factors = sum(1 for v in complexity_factors.values() if v)
        confidence_score -= (active_factors * 8)  # -8% per factor

        # Reduce confidence for low resource availability
        avg_availability = self._get_average_availability(resource_availability)
        if avg_availability < 80:
            confidence_score -= (80 - avg_availability) * 0.5

        # Reduce confidence for larger projects
        size_penalty = {
            ProjectSize.SMALL: 0,
            ProjectSize.MEDIUM: 5,
            ProjectSize.LARGE: 10
        }
        confidence_score -= size_penalty.get(project_size, 5)

        # Reduce confidence if no historical data
        if not has_historical_data:
            confidence_score -= 15

        # Ensure score is in valid range
        confidence_score = max(0, min(100, confidence_score))

        # Determine confidence level
        confidence_level = self._get_confidence_level(confidence_score)

        logger.info(
            f"Confidence calculation: score={confidence_score:.1f}%, "
            f"level={confidence_level}, "
            f"factors={active_factors}, "
            f"availability={avg_availability:.1f}%"
        )

        return {
            "score": confidence_score,
            "level": confidence_level,
            "factors": {
                "complexity_factors": active_factors,
                "resource_availability": avg_availability,
                "project_size": project_size,
                "has_historical_data": has_historical_data
            }
        }

    def _get_average_availability(self, resource_availability: Dict[str, float]) -> float:
        """Calculate average resource availability."""
        if not resource_availability:
            return 80.0

        availabilities = [
            v for v in resource_availability.values()
            if isinstance(v, (int, float))
        ]

        if not availabilities:
            return 80.0

        return sum(availabilities) / len(availabilities)

    def _get_confidence_level(self, score: float) -> str:
        """
        Determine confidence level from score.

        Levels:
        - LOW: 50-70%
        - MEDIUM: 70-85%
        - HIGH: 85-95%
        - VERY_HIGH: > 95%
        """
        if score >= 95:
            return "VERY_HIGH"
        elif score >= 85:
            return "HIGH"
        elif score >= 70:
            return "MEDIUM"
        else:
            return "LOW"

    def get_confidence_description(self, level: str) -> str:
        """Get human-readable description of confidence level."""
        descriptions = {
            "VERY_HIGH": "Very high confidence (>95%). Estimate is highly reliable.",
            "HIGH": "High confidence (85-95%). Estimate is reliable with minor uncertainty.",
            "MEDIUM": "Medium confidence (70-85%). Estimate has moderate uncertainty.",
            "LOW": "Low confidence (<70%). Estimate has significant uncertainty."
        }
        return descriptions.get(level, "Unknown confidence level")