"""Unit tests for complexity calculator."""

import pytest
from app.services.estimation.complexity import ComplexityCalculator


@pytest.fixture
def calculator():
    """Create complexity calculator instance."""
    return ComplexityCalculator()


def test_no_complexity_factors(calculator):
    """Test calculation with no complexity factors."""
    result = calculator.calculate_multiplier({})
    assert result == 1.0


def test_single_complexity_factor(calculator):
    """Test calculation with single factor."""
    result = calculator.calculate_multiplier({"multidiscipline": True})
    assert result == 1.20


def test_multiple_complexity_factors(calculator):
    """Test calculation with multiple factors."""
    factors = {
        "multidiscipline": True,
        "fasttrack": True,
        "brownfield": True
    }
    result = calculator.calculate_multiplier(factors)
    # 1.0 + 0.20 + 0.30 + 0.25 = 1.75
    assert result == 1.75


def test_inactive_complexity_factors(calculator):
    """Test that inactive factors are ignored."""
    factors = {
        "multidiscipline": True,
        "fasttrack": False,
        "brownfield": True
    }
    result = calculator.calculate_multiplier(factors)
    # 1.0 + 0.20 + 0.25 = 1.45
    assert result == 1.45


def test_get_all_factors(calculator):
    """Test getting all available factors."""
    factors = calculator.get_all_factors()

    assert "multidiscipline" in factors
    assert "fasttrack" in factors
    assert factors["multidiscipline"]["value"] == 0.20
    assert factors["fasttrack"]["value"] == 0.30