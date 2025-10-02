"""Main estimation engine."""

from typing import Dict
import logging

from app.models.project import ProjectSize, ClientProfile
from app.services.estimation.complexity import ComplexityCalculator
from app.services.estimation.hours_calculator import HoursCalculator
from app.services.estimation.duration_optimizer import DurationOptimizer
from app.services.estimation.confidence_scorer import ConfidenceScorer
from app.core.exceptions import CalculationException


logger = logging.getLogger(__name__)


class EstimationResult:
    """Estimation result container."""

    def __init__(
        self,
        base_hours: int,
        complexity_multiplier: float,
        client_multiplier: float,
        adjusted_hours: int,
        contingency_hours: int,
        overhead_hours: int,
        total_hours: int,
        duration_weeks: int,
        confidence_level: str,
        confidence_score: float
    ):
        self.base_hours = base_hours
        self.complexity_multiplier = complexity_multiplier
        self.client_multiplier = client_multiplier
        self.adjusted_hours = adjusted_hours
        self.contingency_hours = contingency_hours
        self.overhead_hours = overhead_hours
        self.total_hours = total_hours
        self.duration_weeks = duration_weeks
        self.confidence_level = confidence_level
        self.confidence_score = confidence_score

    def to_dict(self) -> dict:
        """Convert to dictionary."""
        return {
            "base_hours": self.base_hours,
            "complexity_multiplier": self.complexity_multiplier,
            "client_multiplier": self.client_multiplier,
            "adjusted_hours": self.adjusted_hours,
            "contingency_hours": self.contingency_hours,
            "overhead_hours": self.overhead_hours,
            "total_hours": self.total_hours,
            "duration_weeks": self.duration_weeks,
            "confidence_level": self.confidence_level,
            "confidence_score": self.confidence_score
        }


class EstimationEngine:
    """
    Core estimation calculation engine.

    Responsibilities:
    - Calculate base hours from templates
    - Apply complexity multipliers
    - Apply client profile adjustments
    - Calculate resource requirements
    - Determine project duration with availability constraints
    - Generate confidence scores
    """

    def __init__(self):
        self.complexity_calculator = ComplexityCalculator()
        self.hours_calculator = HoursCalculator()
        self.duration_optimizer = DurationOptimizer()
        self.confidence_scorer = ConfidenceScorer()

    def calculate_estimate(
        self,
        project_size: ProjectSize,
        complexity_factors: Dict[str, bool],
        client_profile: ClientProfile,
        resource_availability: Dict[str, float],
        contingency_percent: float = 15.0,
        overhead_percent: float = 10.0,
        base_hours_override: int = None,
        client_complexity: int = 5
    ) -> EstimationResult:
        """
        Main estimation calculation.

        Formula:
        Total Hours = Base Hours × Complexity Multiplier × Client Complexity Factor + Contingency + Overhead
        Duration = Base Duration × (100/Availability%) × (1 + (Complexity-1) × 0.3)

        Args:
            project_size: Project size classification
            complexity_factors: Dictionary of complexity factors and their states
            client_profile: Client profile type
            resource_availability: Resource availability percentages
            contingency_percent: Contingency percentage (default 15%)
            overhead_percent: Overhead/indirect costs percentage (default 10%)
            base_hours_override: Optional override for base hours from deliverables matrix
            client_complexity: Client complexity rating 1-10 (default 5, neutral)

        Returns:
            EstimationResult: Complete estimation results

        Raises:
            CalculationException: If calculation fails
        """
        try:
            logger.info(f"Starting estimation calculation for {project_size} project")

            # Step 1: Get base hours from deliverables or project size template
            if base_hours_override:
                base_hours = base_hours_override
                logger.debug(f"Using base hours from deliverables: {base_hours}")
            else:
                base_hours = self.hours_calculator.get_base_hours(project_size)
                logger.debug(f"Using template base hours for {project_size}: {base_hours}")

            # Step 2: Calculate complexity multiplier
            complexity_multiplier = self.complexity_calculator.calculate_multiplier(
                complexity_factors
            )
            logger.debug(f"Complexity multiplier: {complexity_multiplier}")

            # Step 3: Get client complexity multiplier (replaces old client profile multiplier)
            client_complexity_multiplier = self._get_client_complexity_multiplier(client_complexity)
            logger.debug(f"Client complexity multiplier (complexity={client_complexity}): {client_complexity_multiplier}")

            # Step 4: Calculate adjusted hours
            adjusted_hours = int(base_hours * complexity_multiplier * client_complexity_multiplier)
            logger.debug(f"Adjusted hours: {adjusted_hours}")

            # Step 5: Add contingency
            contingency_hours = int(adjusted_hours * (contingency_percent / 100))
            logger.debug(f"Contingency hours: {contingency_hours}")

            # Step 6: Add overhead
            overhead_hours = int(adjusted_hours * (overhead_percent / 100))
            logger.debug(f"Overhead hours: {overhead_hours}")

            # Step 7: Calculate total
            total_hours = adjusted_hours + contingency_hours + overhead_hours
            logger.debug(f"Total hours: {total_hours}")

            # Step 6: Calculate duration
            duration_weeks = self.duration_optimizer.calculate_duration(
                base_hours=base_hours,
                total_hours=total_hours,
                complexity_multiplier=complexity_multiplier,
                resource_availability=resource_availability,
                project_size=project_size
            )
            logger.debug(f"Estimated duration: {duration_weeks} weeks")

            # Step 7: Calculate confidence score
            confidence_result = self.confidence_scorer.calculate_confidence(
                complexity_factors=complexity_factors,
                resource_availability=resource_availability,
                project_size=project_size,
                has_historical_data=False  # TODO: Check for historical data
            )
            logger.debug(f"Confidence: {confidence_result['level']} ({confidence_result['score']:.2f})")

            # Create result
            result = EstimationResult(
                base_hours=base_hours,
                complexity_multiplier=complexity_multiplier,
                client_multiplier=client_complexity_multiplier,  # Now represents client complexity
                adjusted_hours=adjusted_hours,
                contingency_hours=contingency_hours,
                overhead_hours=overhead_hours,
                total_hours=total_hours,
                duration_weeks=duration_weeks,
                confidence_level=confidence_result["level"],
                confidence_score=confidence_result["score"]
            )

            logger.info(f"Estimation completed: {total_hours} hours, {duration_weeks} weeks")
            return result

        except Exception as e:
            logger.error(f"Estimation calculation failed: {str(e)}")
            raise CalculationException(
                message="Failed to calculate estimate",
                details={"error": str(e)}
            )

    def _get_client_multiplier(self, client_profile: ClientProfile) -> float:
        """
        Get client profile multiplier.

        Args:
            client_profile: Client profile type

        Returns:
            float: Multiplier value
        """
        CLIENT_MULTIPLIERS = {
            ClientProfile.TYPE_A: 1.40,      # Heavy oversight, multiple reviews
            ClientProfile.TYPE_B: 1.00,      # Standard process, normal reviews
            ClientProfile.TYPE_C: 0.85,      # Minimal oversight, trust-based
            ClientProfile.NEW_CLIENT: 1.25   # Unknown, conservative estimate
        }

        return CLIENT_MULTIPLIERS.get(client_profile, 1.00)

    def _get_client_complexity_multiplier(self, client_complexity: int) -> float:
        """
        Get client complexity multiplier based on 1-10 scale.

        Formula: 1.0 + (complexity - 5) * 0.05
        - Complexity 1  → 0.80× (very simple client)
        - Complexity 5  → 1.00× (neutral)
        - Complexity 10 → 1.25× (very complex client)

        Args:
            client_complexity: Client complexity rating (1-10)

        Returns:
            float: Multiplier value
        """
        # Clamp to valid range
        complexity = max(1, min(10, client_complexity))

        # Linear scale: 1.0 + (complexity - 5) * 0.05
        multiplier = 1.0 + (complexity - 5) * 0.05

        return round(multiplier, 2)