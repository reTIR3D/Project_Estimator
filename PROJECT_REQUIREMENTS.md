Engineering Project Estimation System - Complete Architecture & Development Guide
System Architecture Overview
Three-Tier Architecture Design
┌────────────────────────────────────────────────────────────────┐
│                     CLIENT TIER (Frontend)                      │
├────────────────────────────────────────────────────────────────┤
│  • React SPA with TypeScript                                    │
│  • Redux for state management                                   │
│  • Chart.js for visualizations                                  │
│  • Material-UI components                                       │
│  • WebSocket for real-time updates                             │
└────────────────────────────────────────────────────────────────┘
                                ↕ HTTPS/WSS
┌────────────────────────────────────────────────────────────────┐
│                  APPLICATION TIER (Backend)                     │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API Gateway Layer                      │  │
│  │  • FastAPI framework                                      │  │
│  │  • JWT authentication                                     │  │
│  │  • Rate limiting & throttling                            │  │
│  │  • Request validation & sanitization                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                 Business Logic Layer                      │  │
│  │  • Estimation Engine (calculations & algorithms)          │  │
│  │  • Risk Analyzer (Monte Carlo simulations)               │  │
│  │  • Resource Optimizer (allocation & scheduling)          │  │
│  │  • Financial Calculator (cost & budget analysis)         │  │
│  │  • Workflow Engine (approval & review processes)         │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Service Layer                          │  │
│  │  • Project Service      • Notification Service           │  │
│  │  • Export Service       • Integration Service            │  │
│  │  • Analytics Service    • Audit Service                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                                ↕ SQL/NoSQL
┌────────────────────────────────────────────────────────────────┐
│                      DATA TIER (Storage)                        │
├────────────────────────────────────────────────────────────────┤
│  • PostgreSQL (primary data)    • Redis (caching)              │
│  • MongoDB (documents)           • S3 (file storage)           │
│  • Elasticsearch (search)        • InfluxDB (metrics)          │
└────────────────────────────────────────────────────────────────┘
Detailed Project Structure
engineering-estimation-system/
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                        # FastAPI application entry point
│   │   ├── config.py                      # Configuration management
│   │   ├── dependencies.py                # Shared dependencies
│   │   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── router.py              # Main API router
│   │   │   │   └── endpoints/
│   │   │   │       ├── __init__.py
│   │   │   │       ├── auth.py            # Authentication endpoints
│   │   │   │       ├── projects.py        # Project management
│   │   │   │       ├── estimation.py      # Estimation calculations
│   │   │   │       ├── resources.py       # Resource management
│   │   │   │       ├── financial.py       # Financial calculations
│   │   │   │       ├── risk.py            # Risk analysis
│   │   │   │       ├── raci.py            # RACI matrix management
│   │   │   │       ├── deliverables.py    # Deliverables tracking
│   │   │   │       ├── export.py          # Export functionality
│   │   │   │       ├── import.py          # Import functionality
│   │   │   │       ├── analytics.py       # Analytics & reporting
│   │   │   │       ├── history.py         # Historical data
│   │   │   │       └── webhooks.py        # Webhook management
│   │   │   │
│   │   │   └── v2/                        # Future API version
│   │   │       └── __init__.py
│   │   │
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── security.py                # Security utilities
│   │   │   ├── auth.py                    # Authentication logic
│   │   │   ├── database.py                # Database configuration
│   │   │   ├── cache.py                   # Redis cache configuration
│   │   │   ├── exceptions.py              # Custom exceptions
│   │   │   ├── logging.py                 # Logging configuration
│   │   │   ├── events.py                  # Event system
│   │   │   └── middleware.py              # Custom middleware
│   │   │
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── base.py                    # Base model class
│   │   │   ├── user.py                    # User model
│   │   │   ├── project.py                 # Project model
│   │   │   ├── deliverable.py             # Deliverable model
│   │   │   ├── resource.py                # Resource model
│   │   │   ├── financial.py               # Financial model
│   │   │   ├── risk.py                    # Risk model
│   │   │   ├── raci.py                    # RACI matrix model
│   │   │   ├── template.py                # Project template model
│   │   │   ├── audit.py                   # Audit log model
│   │   │   └── notification.py            # Notification model
│   │   │
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── base.py                    # Base schemas
│   │   │   ├── user.py                    # User schemas
│   │   │   ├── project.py                 # Project schemas
│   │   │   ├── estimation.py              # Estimation schemas
│   │   │   ├── deliverable.py             # Deliverable schemas
│   │   │   ├── resource.py                # Resource schemas
│   │   │   ├── financial.py               # Financial schemas
│   │   │   ├── risk.py                    # Risk schemas
│   │   │   ├── export.py                  # Export schemas
│   │   │   └── analytics.py               # Analytics schemas
│   │   │
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── base.py                    # Base service class
│   │   │   │
│   │   │   ├── estimation/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── engine.py              # Main estimation engine
│   │   │   │   ├── complexity.py          # Complexity calculator
│   │   │   │   ├── hours_calculator.py    # Hours calculation
│   │   │   │   ├── duration_optimizer.py  # Duration optimization
│   │   │   │   └── confidence_scorer.py   # Confidence scoring
│   │   │   │
│   │   │   ├── risk/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── analyzer.py            # Risk analysis engine
│   │   │   │   ├── monte_carlo.py         # Monte Carlo simulation
│   │   │   │   ├── sensitivity.py         # Sensitivity analysis
│   │   │   │   └── indicators.py          # Early warning indicators
│   │   │   │
│   │   │   ├── resource/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── allocator.py           # Resource allocation
│   │   │   │   ├── optimizer.py           # Resource optimization
│   │   │   │   ├── conflict_resolver.py   # Conflict resolution
│   │   │   │   └── capacity_planner.py    # Capacity planning
│   │   │   │
│   │   │   ├── financial/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── calculator.py          # Financial calculations
│   │   │   │   ├── budget_analyzer.py     # Budget analysis
│   │   │   │   ├── cost_optimizer.py      # Cost optimization
│   │   │   │   └── currency_converter.py  # Currency conversion
│   │   │   │
│   │   │   ├── schedule/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── scheduler.py           # Project scheduling
│   │   │   │   ├── critical_path.py       # Critical path analysis
│   │   │   │   ├── dependency_manager.py  # Dependency management
│   │   │   │   └── milestone_tracker.py   # Milestone tracking
│   │   │   │
│   │   │   ├── export/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── excel_exporter.py      # Excel export
│   │   │   │   ├── pdf_generator.py       # PDF generation
│   │   │   │   ├── ms_project.py          # MS Project export
│   │   │   │   └── json_exporter.py       # JSON export
│   │   │   │
│   │   │   └── analytics/
│   │   │       ├── __init__.py
│   │   │       ├── velocity_tracker.py    # Team velocity
│   │   │       ├── accuracy_analyzer.py   # Accuracy analysis
│   │   │       ├── trend_analyzer.py      # Trend analysis
│   │   │       └── calibrator.py          # Model calibration
│   │   │
│   │   ├── crud/
│   │   │   ├── __init__.py
│   │   │   ├── base.py                    # Base CRUD class
│   │   │   ├── user.py                    # User CRUD
│   │   │   ├── project.py                 # Project CRUD
│   │   │   ├── deliverable.py             # Deliverable CRUD
│   │   │   └── resource.py                # Resource CRUD
│   │   │
│   │   ├── utils/
│   │   │   ├── __init__.py
│   │   │   ├── validators.py              # Data validators
│   │   │   ├── formatters.py              # Data formatters
│   │   │   ├── calculators.py             # Utility calculations
│   │   │   ├── email.py                   # Email utilities
│   │   │   └── notifications.py           # Notification utilities
│   │   │
│   │   └── workers/
│   │       ├── __init__.py
│   │       ├── celery_app.py              # Celery configuration
│   │       ├── tasks/
│   │       │   ├── __init__.py
│   │       │   ├── estimation_tasks.py    # Async estimation tasks
│   │       │   ├── export_tasks.py        # Async export tasks
│   │       │   ├── notification_tasks.py  # Async notifications
│   │       │   └── analytics_tasks.py     # Async analytics
│   │       └── schedulers/
│   │           ├── __init__.py
│   │           └── periodic_tasks.py      # Scheduled tasks
│   │
│   ├── migrations/
│   │   ├── alembic.ini                    # Alembic configuration
│   │   ├── env.py                          # Migration environment
│   │   └── versions/                       # Migration files
│   │
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py                    # Test configuration
│   │   ├── fixtures/                       # Test fixtures
│   │   │   ├── __init__.py
│   │   │   ├── projects.py
│   │   │   └── users.py
│   │   ├── unit/                          # Unit tests
│   │   │   ├── test_estimation_engine.py
│   │   │   ├── test_risk_analyzer.py
│   │   │   └── test_calculators.py
│   │   ├── integration/                    # Integration tests
│   │   │   ├── test_api_projects.py
│   │   │   └── test_workflows.py
│   │   └── e2e/                           # End-to-end tests
│   │       └── test_full_estimation.py
│   │
│   ├── scripts/
│   │   ├── init_db.py                     # Initialize database
│   │   ├── seed_data.py                   # Seed sample data
│   │   ├── create_admin.py                # Create admin user
│   │   └── backup_db.py                   # Backup database
│   │
│   ├── data/
│   │   ├── templates/                     # Project templates
│   │   │   ├── small_civil.json
│   │   │   ├── medium_mechanical.json
│   │   │   └── large_multidisc.json
│   │   ├── rates/                         # Rate tables
│   │   │   └── standard_rates.json
│   │   └── lookups/                       # Lookup tables
│   │       └── complexity_factors.json
│   │
│   ├── requirements/
│   │   ├── base.txt                       # Base requirements
│   │   ├── dev.txt                        # Development requirements
│   │   └── prod.txt                       # Production requirements
│   │
│   ├── docker/
│   │   ├── Dockerfile                     # Application dockerfile
│   │   ├── Dockerfile.celery              # Celery worker dockerfile
│   │   └── entrypoint.sh                  # Container entrypoint
│   │
│   ├── .env.example                       # Environment variables example
│   ├── docker-compose.yml                 # Docker compose configuration
│   ├── docker-compose.prod.yml            # Production compose
│   ├── Makefile                           # Build automation
│   ├── pytest.ini                         # Pytest configuration
│   └── pyproject.toml                     # Python project configuration
│
├── frontend/                               # React frontend (separate repo)
├── infrastructure/                        # IaC (Terraform/CloudFormation)
├── docs/                                  # Documentation
├── .github/                               # GitHub Actions CI/CD
└── README.md                              # Project documentation
Comprehensive Starting Prompt for Claude Code
markdown# Engineering Project Estimation System - Python Backend Implementation

## Mission Statement
Build a production-ready Python backend for an engineering project estimation system that handles complex calculations, resource optimization, risk analysis, and financial planning with enterprise-grade reliability and scalability.

## System Overview
This is a mission-critical system for engineering firms to estimate project hours, costs, and resources with high accuracy. The system must handle complex, compounding multipliers, perform Monte Carlo risk simulations, optimize resource allocation, and provide detailed financial analysis.

## Technical Requirements

### Core Stack
- Python 3.11+ (for performance and type hints)
- FastAPI (async REST API framework)
- SQLAlchemy 2.0+ (async ORM)
- PostgreSQL 15+ (primary database)
- Redis 7+ (caching and session store)
- Celery (async task processing)
- Pydantic V2 (data validation)
- Alembic (database migrations)

### Additional Technologies
- NumPy/Pandas (calculations)
- Scipy (statistical analysis)
- Plotly (chart generation)
- OpenPyXL (Excel export)
- ReportLab (PDF generation)
- Pytest (testing framework)
- Docker/Docker Compose (containerization)

## Business Domain Model

### Project Sizes
- Small: < 500 hours (3-person team, 8 weeks)
- Medium: 500-2000 hours (5-person team, 16 weeks)  
- Large: > 2000 hours (8-person team, 32+ weeks)

### Complexity Factors (Multiplicative)
```python
COMPLEXITY_FACTORS = {
    'multidiscipline': 0.20,      # Multiple engineering disciplines
    'fasttrack': 0.30,            # Compressed schedule
    'brownfield': 0.25,           # Existing facility modification
    'regulatory': 0.15,           # Heavy compliance requirements
    'international': 0.20,        # Cross-border complexity
    'incomplete_requirements': 0.35  # Requirements not fully defined
}
# Total multiplier = 1.0 + sum(selected_factors)
Client Profiles
pythonCLIENT_PROFILES = {
    'type_a': {'multiplier': 1.40, 'description': 'Heavy oversight, multiple reviews'},
    'type_b': {'multiplier': 1.00, 'description': 'Standard process, normal reviews'},
    'type_c': {'multiplier': 0.85, 'description': 'Minimal oversight, trust-based'},
    'new_client': {'multiplier': 1.25, 'description': 'Unknown, conservative estimate'}
}
Milestone Definitions

IFD: Issued for Design (internal review)
IFH: Issued for HAZOP (safety review)
IFR: Issued for Review (client review)
IFA: Issued for Approval (final approval)
IFC: Issued for Construction (final release)

Core Implementation Requirements
1. Estimation Engine Service
pythonclass EstimationEngine:
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
    
    def calculate_estimate(
        self,
        project_size: str,
        complexity_factors: Dict[str, bool],
        client_profile: str,
        resource_availability: Dict[str, float],
        contingency_percent: float
    ) -> EstimationResult:
        """
        Main estimation calculation.
        
        Formula:
        Total Hours = Base Hours × Complexity Multiplier × Client Factor + Contingency
        Duration = Base Duration × (100/Availability%) × (1 + (Complexity-1) × 0.3)
        """
        pass
2. Risk Analysis Service
pythonclass RiskAnalyzer:
    """
    Monte Carlo simulation and risk analysis.
    
    Requirements:
    - Run 10,000 iterations minimum
    - Calculate P10, P50, P90 scenarios
    - Identify risk factors and probabilities
    - Generate tornado diagrams for sensitivity
    - Provide early warning indicators
    """
    
    def monte_carlo_simulation(
        self,
        base_estimate: float,
        risk_factors: List[RiskFactor],
        iterations: int = 10000
    ) -> RiskAnalysisResult:
        """
        Perform Monte Carlo simulation.
        
        Each iteration varies:
        - Task durations (triangular distribution)
        - Resource availability (normal distribution)
        - Risk occurrence (binary probability)
        """
        pass
3. Resource Optimization Service
pythonclass ResourceOptimizer:
    """
    Resource allocation and optimization.
    
    Features:
    - Critical path method (CPM) for scheduling
    - Resource leveling algorithms
    - Conflict detection and resolution
    - Capacity planning with constraints
    - Multi-project resource allocation
    """
    
    def optimize_allocation(
        self,
        deliverables: List[Deliverable],
        available_resources: List[Resource],
        constraints: ResourceConstraints
    ) -> OptimizedSchedule:
        """
        Optimize resource allocation using linear programming.
        
        Objectives:
        - Minimize project duration
        - Maximize resource utilization
        - Minimize cost
        - Balance workload
        """
        pass
4. Financial Calculator Service
pythonclass FinancialCalculator:
    """
    Financial analysis and budgeting.
    
    Calculations:
    - Labor costs by role and rate
    - Markup and margin calculations
    - Multi-currency conversion
    - Cash flow projections
    - Earned value management (EVM)
    """
    
    def calculate_budget(
        self,
        hours_by_role: Dict[str, float],
        rates: Dict[str, float],
        markup_percent: float,
        currency: str
    ) -> BudgetBreakdown:
        """
        Calculate complete project budget.
        
        Includes:
        - Direct labor costs
        - Indirect costs (overhead)
        - Markup/profit
        - Contingency reserve
        - Management reserve
        """
        pass
5. Historical Analysis Service
pythonclass HistoricalAnalyzer:
    """
    Learn from past projects for calibration.
    
    Features:
    - Variance analysis (estimated vs actual)
    - Root cause identification
    - Trend analysis over time
    - Accuracy scoring by project type
    - Automatic calibration recommendations
    """
    
    def analyze_accuracy(
        self,
        completed_projects: List[CompletedProject]
    ) -> AccuracyMetrics:
        """
        Analyze historical estimation accuracy.
        
        Metrics:
        - Mean Absolute Percentage Error (MAPE)
        - Variance by project size
        - Variance by complexity factor
        - Team velocity trends
        """
        pass
API Endpoint Specifications
Project Management
POST   /api/v1/projects                  # Create new project
GET    /api/v1/projects                  # List all projects (paginated)
GET    /api/v1/projects/{id}            # Get project details
PUT    /api/v1/projects/{id}            # Update project
DELETE /api/v1/projects/{id}            # Delete project (soft delete)
POST   /api/v1/projects/{id}/duplicate  # Duplicate project
Estimation
POST   /api/v1/projects/{id}/estimate          # Calculate full estimate
GET    /api/v1/projects/{id}/estimate          # Get current estimate
POST   /api/v1/projects/{id}/estimate/quick    # Quick estimation
POST   /api/v1/projects/{id}/estimate/compare  # Compare scenarios
Risk Analysis
GET    /api/v1/projects/{id}/risk              # Get risk analysis
POST   /api/v1/projects/{id}/risk/simulate     # Run Monte Carlo
GET    /api/v1/projects/{id}/risk/sensitivity  # Sensitivity analysis
GET    /api/v1/projects/{id}/risk/indicators   # Early warnings
Resources
GET    /api/v1/projects/{id}/resources         # Resource allocation
POST   /api/v1/projects/{id}/resources/optimize # Optimize resources
GET    /api/v1/projects/{id}/resources/conflicts # Identify conflicts
POST   /api/v1/projects/{id}/resources/level   # Level resources
Financial
GET    /api/v1/projects/{id}/financial         # Financial summary
POST   /api/v1/projects/{id}/financial/calculate # Calculate budget
GET    /api/v1/projects/{id}/financial/cashflow # Cash flow projection
GET    /api/v1/projects/{id}/financial/evm     # Earned value metrics
Analytics
GET    /api/v1/analytics/dashboard             # Analytics dashboard
GET    /api/v1/analytics/accuracy              # Accuracy metrics
GET    /api/v1/analytics/velocity              # Team velocity
POST   /api/v1/analytics/calibrate             # Calibrate model
GET    /api/v1/analytics/trends                # Trend analysis
Export/Import
POST   /api/v1/projects/{id}/export/excel      # Export to Excel
POST   /api/v1/projects/{id}/export/pdf        # Export to PDF
POST   /api/v1/projects/{id}/export/msproject  # Export to MS Project
POST   /api/v1/projects/import/excel           # Import from Excel
POST   /api/v1/projects/import/template        # Import from template
Database Schema
python# SQLAlchemy Models

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(UUID, primary_key=True, default=uuid4)
    name = Column(String(255), nullable=False, index=True)
    project_code = Column(String(50), unique=True, index=True)
    size = Column(Enum(ProjectSize), nullable=False)
    discipline = Column(Enum(EngineeringDiscipline), nullable=False)
    client_id = Column(UUID, ForeignKey("clients.id"))
    client_profile = Column(Enum(ClientProfile), nullable=False)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.DRAFT)
    
    # Complexity factors (stored as JSON)
    complexity_factors = Column(JSON, default={})
    
    # Resource availability
    resource_availability = Column(JSON, default={})
    
    # Risk parameters
    contingency_percent = Column(Float, default=15.0)
    confidence_level = Column(Enum(ConfidenceLevel))
    
    # Calculated fields (cached)
    base_hours = Column(Integer)
    complexity_multiplier = Column(Float)
    adjusted_hours = Column(Integer)
    total_hours = Column(Integer)
    duration_weeks = Column(Integer)
    total_cost = Column(Numeric(15, 2))
    
    # Metadata
    created_by = Column(UUID, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    approved_by = Column(UUID, ForeignKey("users.id"))
    approved_at = Column(DateTime)
    
    # Relationships
    deliverables = relationship("Deliverable", back_populates="project", cascade="all, delete-orphan")
    resources = relationship("Resource", back_populates="project")
    risk_scenarios = relationship("RiskScenario", back_populates="project")
    financial_breakdown = relationship("FinancialBreakdown", back_populates="project", uselist=False)
    
    # Indexes
    __table_args__ = (
        Index("idx_project_status_created", "status", "created_at"),
        Index("idx_project_client", "client_id"),
    )

class Deliverable(Base):
    __tablename__ = "deliverables"
    
    id = Column(UUID, primary_key=True, default=uuid4)
    project_id = Column(UUID, ForeignKey("projects.id"), nullable=False)
    name = Column(String(255), nullable=False)
    milestone = Column(Enum(Milestone), nullable=False)
    sequence_number = Column(Integer, nullable=False)
    
    # Duration and scheduling
    duration_days = Column(Integer, nullable=False)
    start_date = Column(Date)
    end_date = Column(Date)
    actual_start = Column(Date)
    actual_end = Column(Date)
    
    # Dependencies (stored as JSON array of deliverable IDs)
    dependencies = Column(JSON, default=[])
    is_critical_path = Column(Boolean, default=False)
    float_days = Column(Integer, default=0)
    
    # Progress tracking
    progress_percent = Column(Integer, default=0)
    status = Column(Enum(DeliverableStatus), default=DeliverableStatus.NOT_STARTED)
    
    # Hours breakdown
    hours_create = Column(Integer, nullable=False)
    hours_review = Column(Integer, nullable=False)
    hours_qa = Column(Integer, nullable=False)
    hours_doc = Column(Integer, nullable=False)
    hours_revisions = Column(Integer, nullable=False)
    hours_pm = Column(Integer, nullable=False)
    hours_total = Column(Integer, nullable=False)
    
    # Actual hours tracking
    actual_hours_create = Column(Integer)
    actual_hours_review = Column(Integer)
    actual_hours_qa = Column(Integer)
    actual_hours_doc = Column(Integer)
    actual_hours_revisions = Column(Integer)
    actual_hours_pm = Column(Integer)
    actual_hours_total = Column(Integer)
    
    # Relationships
    project = relationship("Project", back_populates="deliverables")
    assigned_resources = relationship("ResourceAssignment", back_populates="deliverable")

class RiskScenario(Base):
    __tablename__ = "risk_scenarios"
    
    id = Column(UUID, primary_key=True, default=uuid4)
    project_id = Column(UUID, ForeignKey("projects.id"), nullable=False)
    scenario_type = Column(Enum(ScenarioType), nullable=False)  # P10, P50, P90
    
    # Scenario values
    hours = Column(Integer, nullable=False)
    duration_weeks = Column(Integer, nullable=False)
    cost = Column(Numeric(15, 2), nullable=False)
    probability_percent = Column(Float, nullable=False)
    
    # Risk factors included
    risk_factors = Column(JSON, default=[])
    
    # Simulation metadata
    simulation_date = Column(DateTime, default=datetime.utcnow)
    iterations_run = Column(Integer, default=10000)
    confidence_interval = Column(Float)
    
    # Unique constraint on project + scenario type
    __table_args__ = (
        UniqueConstraint("project_id", "scenario_type"),
    )
Performance Requirements
Response Time SLAs

Simple CRUD operations: < 100ms
Estimation calculation: < 500ms
Monte Carlo simulation (10k iterations): < 2s
Resource optimization: < 3s
Export generation: < 5s
Analytics dashboard: < 1s

Scalability Targets

Support 1000 concurrent users
Handle 100,000 projects in database
Process 10 million historical records
Cache hit rate > 80%
Database connection pool: 100 connections
API rate limit: 1000 requests/minute per user

Data Retention

Active projects: Indefinite
Completed projects: 7 years
Audit logs: 10 years
Analytics data: 5 years
Temporary calculations: 24 hours

Security Requirements
Authentication & Authorization

JWT tokens with refresh mechanism
Role-based access control (RBAC)
Multi-factor authentication (MFA)
API key management for integrations
OAuth2 for third-party integrations

Data Protection

Encryption at rest (AES-256)
Encryption in transit (TLS 1.3)
PII data masking
Audit logging for all changes
GDPR compliance

API Security

Rate limiting per endpoint
Request throttling
Input validation and sanitization
SQL injection prevention
XSS protection
CORS configuration

Testing Strategy
Unit Tests (80% coverage minimum)
pythondef test_complexity_calculation():
    """Test complexity multiplier calculation."""
    factors = {
        'multidiscipline': True,
        'fasttrack': True,
        'brownfield': False
    }
    multiplier = calculate_complexity_multiplier(factors)
    assert multiplier == 1.50  # 1.0 + 0.20 + 0.30

def test_duration_with_availability():
    """Test duration calculation with resource availability."""
    base_duration = 10
    availability = 50  # 50%
    complexity = 1.5
    duration = calculate_duration(base_duration, availability, complexity)
    assert duration == 23  # 10 * (100/50) * (1 + (1.5-1) * 0.3)
Integration Tests

API endpoint testing with test database
Service integration testing
Cache integration testing
Message queue testing

Performance Tests

Load testing with k6 or Locust
Database query optimization
Cache performance testing
Concurrent user simulation

Monitoring & Observability
Metrics (Prometheus)

API response times
Error rates by endpoint
Database query performance
Cache hit/miss rates
Background job metrics
Resource utilization

Logging (ELK Stack)

Application logs (INFO, WARNING, ERROR)
Access logs
Audit logs
Performance logs
Security logs

Tracing (Jaeger)

Distributed request tracing
Service dependency mapping
Performance bottleneck identification

Alerting

API error rate > 1%
Response time > SLA
Database connection pool exhaustion
Cache unavailable
Background job failures

Development Workflow
Local Development
bash# Setup environment
python -m venv venv
source venv/bin/activate
pip install -r requirements/dev.txt

# Setup database
docker-compose up -d postgres redis
alembic upgrade head
python scripts/seed_data.py

# Run application
uvicorn app.main:app --reload --port 8000

# Run tests
pytest tests/ -v --cov=app

# Run linting
black app/
flake8 app/
mypy app/
Git Workflow

Feature branches from develop
PR reviews required
CI/CD pipeline validation
Semantic versioning
Automated changelog generation

Deployment Architecture
Container Strategy
yaml# docker-compose.prod.yml
services:
  api:
    image: estimation-api:latest
    replicas: 3
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      
  worker:
    image: estimation-worker:latest
    replicas: 2
    command: celery worker -l info
    
  scheduler:
    image: estimation-worker:latest
    command: celery beat -l info
Cloud Deployment (AWS)

ECS Fargate for API containers
RDS PostgreSQL (Multi-AZ)
ElastiCache Redis cluster
S3 for file storage
CloudFront CDN
ALB with auto-scaling
CloudWatch monitoring

Initial Implementation Priority
Phase 1: Core Foundation (Week 1-2)

Setup project structure and configuration
Implement basic models and schemas
Create estimation engine with simple calculations
Build CRUD APIs for projects
Setup testing framework

Phase 2: Advanced Features (Week 3-4)

Implement complexity calculations
Add resource optimization
Build risk analysis with Monte Carlo
Create financial calculator
Add authentication and authorization

Phase 3: Integration & Analytics (Week 5-6)

Historical data analysis
Export/import functionality
Analytics dashboard
Integration APIs
Performance optimization

Phase 4: Production Ready (Week 7-8)

Complete test coverage
Documentation
Deployment automation
Monitoring setup
Security hardening

Success Metrics
Business Metrics

Estimation accuracy within 10% of actual
50% reduction in estimation time
90% user satisfaction score
100% audit compliance

Technical Metrics

99.9% API uptime
< 500ms p95 response time
80% code coverage
0 critical security vulnerabilities

Key Algorithms to Implement
Critical Path Method (CPM)
pythondef calculate_critical_path(deliverables: List[Deliverable]) -> List[UUID]:
    """
    Calculate critical path using forward and backward pass.
    
    Returns list of deliverable IDs on critical path.
    """
    # Forward pass - calculate early start/finish
    # Backward pass - calculate late start/finish
    # Critical path = deliverables with zero float
    pass
Resource Leveling
pythondef level_resources(
    schedule: Schedule,
    resource_limits: Dict[str, int]
) -> OptimizedSchedule:
    """
    Level resources to avoid over-allocation.
    
    Uses heuristic algorithm to shift non-critical activities.
    """
    pass
Monte Carlo Simulation
pythondef monte_carlo_estimate(
    base_estimate: float,
    uncertainty_range: float,
    risk_events: List[RiskEvent],
    iterations: int = 10000
) -> SimulationResults:
    """
    Run Monte Carlo simulation for probabilistic estimate.
    
    Uses triangular distribution for task durations.
    Binary probability for risk events.
    """
    pass
Please implement this system with a focus on:

Clean, maintainable code following SOLID principles
Comprehensive error handling and validation
Performance optimization from the start
Security best practices
Extensive documentation and testing

Start with the estimation engine as it's the core of the system, then build outward to the API and other services.

## Environment Configuration (.env.example)
```bash
# Application
APP_NAME=Engineering Estimation System
APP_ENV=development
DEBUG=true
SECRET_KEY=your-secret-key-here-change-in-production
API_VERSION=v1

# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/estimation_db
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=40
DATABASE_POOL_TIMEOUT=30

# Redis
REDIS_URL=redis://localhost:6379/0
REDIS_CACHE_TTL=3600

# Authentication
JWT_SECRET_KEY=your-jwt-secret-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=30
JWT_REFRESH_EXPIRATION_DAYS=7

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@estimation-system.com

# File Storage
USE_S3=false
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=estimation-files
AWS_REGION=us-east-1

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
LOG_LEVEL=INFO
ENABLE_METRICS=true
METRICS_PORT=9090

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_DEFAULT=1000/minute
RATE_LIMIT_BURST=100

# Celery
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2
CELERY_TASK_TIME_LIMIT=300

# External Services
CURRENCY_API_KEY=your-currency-api-key
GEOCODING_API_KEY=your-geocoding-api-key

# Feature Flags
ENABLE_MONTE_CARLO=true
ENABLE_EXPORT_PDF=true
ENABLE_MULTI_CURRENCY=true
ENABLE_ADVANCED_ANALYTICS=true
Makefile for Development
makefile.PHONY: help install dev test clean docker-up docker-down migrate

help:
	@echo "Available commands:"
	@echo "  install    Install dependencies"
	@echo "  dev        Run development server"
	@echo "  test       Run tests"
	@echo "  clean      Clean up files"
	@echo "  docker-up  Start Docker services"
	@echo "  migrate    Run database migrations"

install:
	pip install -r requirements/dev.txt
	pre-commit install

dev:
	uvicorn app.main:app --reload --port 8000

test:
	pytest tests/ -v --cov=app --cov-report=html

test-watch:
	ptw tests/ -- -v

lint:
	black app/ tests/
	flake8 app/ tests/
	mypy app/

clean:
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".coverage" -delete

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

migrate:
	alembic upgrade head

migrate-create:
	alembic revision --autogenerate -m "$(message)"

seed:
	python scripts/seed_data.py

backup-db:
	python scripts/backup_db.py

run-worker:
	celery -A app.workers.celery_app worker --loglevel=info

run-scheduler:
	celery -A app.workers.celery_app beat --loglevel=info
This complete architecture provides:

Scalable structure - Modular design that can grow with requirements
Clear separation of concerns - Business logic, data access, and API layers are separate
Performance optimization - Caching, async operations, and efficient algorithms
Production readiness - Monitoring, logging, security, and deployment configurations
Developer experience - Clear documentation, testing strategy, and development tools