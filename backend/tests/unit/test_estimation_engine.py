"""Unit tests for estimation engine."""

import pytest
from app.services.estimation.engine import EstimationEngine
from app.models.project import ProjectSize, ClientProfile


@pytest.fixture
def estimation_engine():
    """Create estimation engine instance."""
    return EstimationEngine()


def test_calculate_estimate_small_project(estimation_engine):
    """Test estimation for small project."""
    result = estimation_engine.calculate_estimate(
        project_size=ProjectSize.SMALL,
        complexity_factors={},
        client_profile=ClientProfile.TYPE_B,
        resource_availability={"engineer": 100.0},
        contingency_percent=15.0
    )

    assert result.base_hours == 300
    assert result.complexity_multiplier == 1.0
    assert result.client_multiplier == 1.0
    assert result.total_hours > result.adjusted_hours


def test_calculate_estimate_with_complexity(estimation_engine):
    """Test estimation with complexity factors."""
    result = estimation_engine.calculate_estimate(
        project_size=ProjectSize.MEDIUM,
        complexity_factors={
            "multidiscipline": True,
            "fasttrack": True
        },
        client_profile=ClientProfile.TYPE_B,
        resource_availability={"engineer": 100.0},
        contingency_percent=15.0
    )

    # Complexity multiplier should be 1.0 + 0.20 + 0.30 = 1.50
    assert result.complexity_multiplier == 1.50
    assert result.adjusted_hours == int(1200 * 1.50)


def test_calculate_estimate_client_multiplier(estimation_engine):
    """Test estimation with different client profiles."""
    # Type A client (heavy oversight)
    result_a = estimation_engine.calculate_estimate(
        project_size=ProjectSize.SMALL,
        complexity_factors={},
        client_profile=ClientProfile.TYPE_A,
        resource_availability={"engineer": 100.0},
        contingency_percent=15.0
    )

    # Type C client (minimal oversight)
    result_c = estimation_engine.calculate_estimate(
        project_size=ProjectSize.SMALL,
        complexity_factors={},
        client_profile=ClientProfile.TYPE_C,
        resource_availability={"engineer": 100.0},
        contingency_percent=15.0
    )

    assert result_a.client_multiplier == 1.40
    assert result_c.client_multiplier == 0.85
    assert result_a.adjusted_hours > result_c.adjusted_hours