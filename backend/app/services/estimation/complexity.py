"""Complexity calculation service."""

from typing import Dict
import logging


logger = logging.getLogger(__name__)


class ComplexityCalculator:
    """
    Calculate complexity multipliers for projects.

    Complexity factors are additive:
    Total Multiplier = 1.0 + sum(selected_factors)
    """

    # Complexity factor values
    COMPLEXITY_FACTORS = {
        'multidiscipline': 0.20,         # Multiple engineering disciplines
        'fasttrack': 0.30,               # Compressed schedule
        'brownfield': 0.25,              # Existing facility modification
        'regulatory': 0.15,              # Heavy compliance requirements
        'international': 0.20,           # Cross-border complexity
        'incomplete_requirements': 0.35  # Requirements not fully defined
    }

    def calculate_multiplier(self, complexity_factors: Dict[str, bool]) -> float:
        """
        Calculate total complexity multiplier.

        Args:
            complexity_factors: Dictionary mapping factor names to boolean values

        Returns:
            float: Total complexity multiplier (minimum 1.0)

        Example:
            >>> calculator = ComplexityCalculator()
            >>> factors = {'multidiscipline': True, 'fasttrack': True}
            >>> calculator.calculate_multiplier(factors)
            1.50  # 1.0 + 0.20 + 0.30
        """
        multiplier = 1.0

        for factor_name, is_active in complexity_factors.items():
            if is_active and factor_name in self.COMPLEXITY_FACTORS:
                factor_value = self.COMPLEXITY_FACTORS[factor_name]
                multiplier += factor_value
                logger.debug(
                    f"Applied complexity factor '{factor_name}': +{factor_value} "
                    f"(running total: {multiplier})"
                )

        logger.info(f"Total complexity multiplier: {multiplier}")
        return multiplier

    def get_factor_description(self, factor_name: str) -> str:
        """Get human-readable description of a complexity factor."""
        descriptions = {
            'multidiscipline': 'Multiple engineering disciplines involved',
            'fasttrack': 'Compressed schedule with overlapping phases',
            'brownfield': 'Modification to existing facility',
            'regulatory': 'Heavy regulatory compliance requirements',
            'international': 'Cross-border project with international standards',
            'incomplete_requirements': 'Requirements not fully defined at start'
        }
        return descriptions.get(factor_name, 'Unknown factor')

    def get_all_factors(self) -> Dict[str, dict]:
        """
        Get all available complexity factors with metadata.

        Returns:
            Dictionary of factor metadata
        """
        return {
            factor: {
                'value': value,
                'description': self.get_factor_description(factor),
                'impact_percent': int(value * 100)
            }
            for factor, value in self.COMPLEXITY_FACTORS.items()
        }