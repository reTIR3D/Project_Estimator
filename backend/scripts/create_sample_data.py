"""
Script to create sample data for testing the Engineering Estimation System.

Creates:
- Sample companies
- Sample rate sheets
- Sample discrete projects (small, medium, large, with different process types)
- Sample campaigns
- Sample deliverable templates
"""

import asyncio
import sys
from pathlib import Path
from datetime import datetime, timedelta
from decimal import Decimal

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal
from app.models.company import Company
from app.models.rate_sheet import RateSheet
from app.models.project import Project, WorkType, ProcessType, ProjectSize, ProjectStatus, ProjectType
from app.models.deliverable_template import DeliverableTemplate
from app.models.user import User
from app.crud.project_size_settings import project_size_settings
from app.schemas.project_size_settings import ProjectSizeSettingsCreate
import uuid


async def get_or_create_test_user(db: AsyncSession) -> User:
    """Get or create a test user."""
    from sqlalchemy import select

    result = await db.execute(select(User).where(User.email == "test@example.com"))
    user = result.scalars().first()

    if not user:
        from app.core.security import hash_password
        user = User(
            id=uuid.uuid4(),
            email="test@example.com",
            username="testuser",
            hashed_password=hash_password("testpassword123"),
            full_name="Test User",
            is_active=True,
            is_superuser=False
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        print("Created test user (test@example.com / testpassword123)")

    return user


async def create_sample_companies(db: AsyncSession, user: User) -> list[Company]:
    """Create sample companies."""
    companies_data = [
        {
            "name": "Acme Manufacturing Inc.",
            "industry": "Manufacturing",
            "contact_email": "engineering@acme.com",
            "contact_phone": "+1-555-0100",
            "is_active": True,
        },
        {
            "name": "Global Energy Solutions",
            "industry": "Energy",
            "contact_email": "projects@globalenergy.com",
            "contact_phone": "+1-555-0200",
            "is_active": True,
        },
        {
            "name": "TechCorp Industries",
            "industry": "Technology",
            "contact_email": "facilities@techcorp.com",
            "contact_phone": "+1-555-0300",
            "is_active": True,
        },
    ]

    companies = []
    for data in companies_data:
        company = Company(
            id=uuid.uuid4(),
            **data,
            created_by=user.id
        )
        db.add(company)
        companies.append(company)

    await db.commit()
    print(f"Created {len(companies)} sample companies")
    return companies


async def create_sample_rate_sheets(db: AsyncSession, companies: list[Company], user: User) -> list[RateSheet]:
    """Create sample rate sheets."""
    rate_sheets = []

    # Standard rates for first company
    rate_sheet1 = RateSheet(
        id=uuid.uuid4(),
        name="Standard Rates 2025",
        company_id=companies[0].id,
        is_default=True,
        is_active=True,
        effective_date=datetime.now().date(),
        rates={
            "Project Manager": Decimal("150.00"),
            "Senior Engineer": Decimal("135.00"),
            "Engineer": Decimal("110.00"),
            "Designer": Decimal("95.00"),
            "Drafter": Decimal("75.00"),
            "Admin": Decimal("65.00"),
        },
        created_by=user.id
    )
    db.add(rate_sheet1)
    rate_sheets.append(rate_sheet1)

    # Premium rates for second company
    rate_sheet2 = RateSheet(
        id=uuid.uuid4(),
        name="Energy Sector Rates 2025",
        company_id=companies[1].id,
        is_default=True,
        is_active=True,
        effective_date=datetime.now().date(),
        rates={
            "Project Manager": Decimal("175.00"),
            "Senior Engineer": Decimal("155.00"),
            "Engineer": Decimal("125.00"),
            "Designer": Decimal("105.00"),
            "Drafter": Decimal("85.00"),
            "Admin": Decimal("70.00"),
        },
        created_by=user.id
    )
    db.add(rate_sheet2)
    rate_sheets.append(rate_sheet2)

    await db.commit()
    print(f"OK: Created {len(rate_sheets)} sample rate sheets")
    return rate_sheets


async def create_sample_discrete_projects(db: AsyncSession, companies: list[Company], rate_sheets: list[RateSheet], user: User):
    """Create sample discrete projects."""

    projects_data = [
        # Small Conventional Project
        {
            "name": "Warehouse HVAC Upgrade",
            "project_code": "PROJ-2025-001",
            "work_type": WorkType.DISCRETE_PROJECT,
            "size": ProjectSize.SMALL,
            "process_type": ProcessType.CONVENTIONAL,
            "process_type_recommended": ProcessType.CONVENTIONAL,
            "status": ProjectStatus.ESTIMATION,
            "project_type": ProjectType.STANDARD,
            "client_name": "Acme Manufacturing Inc.",
            "description": "Replace aging HVAC system in 50,000 sq ft warehouse facility",
            "total_hours": 350,
            "total_cost": Decimal("38500.00"),
            "company_id": companies[0].id,
            "rate_sheet_id": rate_sheets[0].id,
            "selected_disciplines": ["Mechanical", "Electrical/Instrumentation"],
            "contingency_percent": 15,
        },
        # Medium Conventional Project
        {
            "name": "Process Line Expansion - Building 3",
            "project_code": "PROJ-2025-002",
            "work_type": WorkType.DISCRETE_PROJECT,
            "size": ProjectSize.MEDIUM,
            "process_type": ProcessType.CONVENTIONAL,
            "process_type_recommended": ProcessType.CONVENTIONAL,
            "status": ProjectStatus.ESTIMATION,
            "project_type": ProjectType.STANDARD,
            "client_name": "Acme Manufacturing Inc.",
            "description": "Add new production line with material handling and utilities",
            "total_hours": 1250,
            "total_cost": Decimal("143750.00"),
            "company_id": companies[0].id,
            "rate_sheet_id": rate_sheets[0].id,
            "selected_disciplines": ["Mechanical", "Process", "Electrical/Instrumentation", "Automation"],
            "contingency_percent": 15,
        },
        # Large Conventional Project
        {
            "name": "New Distribution Center",
            "project_code": "PROJ-2025-003",
            "work_type": WorkType.DISCRETE_PROJECT,
            "size": ProjectSize.LARGE,
            "process_type": ProcessType.CONVENTIONAL,
            "process_type_recommended": ProcessType.CONVENTIONAL,
            "status": ProjectStatus.DRAFT,
            "project_type": ProjectType.STANDARD,
            "client_name": "TechCorp Industries",
            "description": "Design new 200,000 sq ft distribution center with automated systems",
            "total_hours": 3500,
            "total_cost": Decimal("420000.00"),
            "company_id": companies[2].id,
            "rate_sheet_id": None,
            "selected_disciplines": ["Civil", "Structural", "Mechanical", "Electrical/Instrumentation", "Automation"],
            "contingency_percent": 20,
        },
        # Large Phase-Gate Project
        {
            "name": "Refinery Modernization Program",
            "project_code": "PROJ-2025-004",
            "work_type": WorkType.DISCRETE_PROJECT,
            "size": ProjectSize.LARGE,
            "process_type": ProcessType.PHASE_GATE,
            "process_type_recommended": ProcessType.PHASE_GATE,
            "status": ProjectStatus.DRAFT,
            "project_type": ProjectType.STANDARD,
            "client_name": "Global Energy Solutions",
            "description": "Multi-phase refinery upgrade including process units, utilities, and safety systems",
            "total_hours": 8500,
            "total_cost": Decimal("1275000.00"),
            "company_id": companies[1].id,
            "rate_sheet_id": rate_sheets[1].id,
            "selected_disciplines": ["Process", "Mechanical", "Electrical/Instrumentation", "Automation", "Civil", "Structural"],
            "contingency_percent": 25,
            "complexity_factors": {
                "regulatory_complexity": "HIGH",
                "technical_complexity": "HIGH",
                "schedule_pressure": "MEDIUM",
                "stakeholder_count": "MANY"
            }
        },
        # Medium Phase-Gate Project (unusual but valid)
        {
            "name": "Safety Systems Upgrade",
            "project_code": "PROJ-2025-005",
            "work_type": WorkType.DISCRETE_PROJECT,
            "size": ProjectSize.MEDIUM,
            "process_type": ProcessType.PHASE_GATE,
            "process_type_recommended": ProcessType.CONVENTIONAL,
            "process_type_overridden": True,
            "status": ProjectStatus.ESTIMATION,
            "project_type": ProjectType.STANDARD,
            "client_name": "Global Energy Solutions",
            "description": "Critical safety instrumented system upgrade requiring staged implementation",
            "total_hours": 1800,
            "total_cost": Decimal("279000.00"),
            "company_id": companies[1].id,
            "rate_sheet_id": rate_sheets[1].id,
            "selected_disciplines": ["Electrical/Instrumentation", "Automation", "Process"],
            "contingency_percent": 20,
            "complexity_factors": {
                "regulatory_complexity": "CRITICAL",
                "technical_complexity": "HIGH",
                "schedule_pressure": "LOW",
                "stakeholder_count": "SEVERAL"
            }
        },
    ]

    for data in projects_data:
        project = Project(
            id=uuid.uuid4(),
            **data,
            created_by=user.id
        )
        db.add(project)

    await db.commit()
    print(f"OK: Created {len(projects_data)} sample discrete projects")


async def create_sample_campaigns(db: AsyncSession, companies: list[Company], rate_sheets: list[RateSheet], user: User):
    """Create sample campaigns."""

    campaigns_data = [
        # Annual Maintenance Campaign
        {
            "name": "Annual Plant Maintenance Support 2025",
            "project_code": "CAMP-2025-001",
            "work_type": WorkType.CAMPAIGN,
            "status": ProjectStatus.ACTIVE,
            "client_name": "Acme Manufacturing Inc.",
            "description": "Ongoing engineering support for routine maintenance and small projects across all facilities",
            "company_id": companies[0].id,
            "rate_sheet_id": rate_sheets[0].id,
            "selected_disciplines": ["Mechanical", "Electrical/Instrumentation", "Civil"],
            "campaign_duration_months": 12,
            "campaign_service_level": "STANDARD",
            "campaign_site_count": 3,
            "campaign_response_requirement": "5_BUSINESS_DAYS",
            "campaign_pricing_model": "MONTHLY_RETAINER",
            "campaign_monthly_hours": {
                "Mechanical": 40,
                "Electrical/Instrumentation": 30,
                "Civil": 10
            },
            "total_hours": 960,  # 80 hours/month * 12 months
            "total_cost": Decimal("105600.00"),  # ~$110/hr average
        },
        # Multi-Site Support Campaign
        {
            "name": "Regional Facilities Engineering Support",
            "project_code": "CAMP-2025-002",
            "work_type": WorkType.CAMPAIGN,
            "status": ProjectStatus.ACTIVE,
            "client_name": "TechCorp Industries",
            "description": "24/7 engineering support for 8 data center facilities across region",
            "company_id": companies[2].id,
            "rate_sheet_id": None,
            "selected_disciplines": ["Mechanical", "Electrical/Instrumentation", "Automation", "Structural"],
            "campaign_duration_months": 24,
            "campaign_service_level": "ENTERPRISE",
            "campaign_site_count": 8,
            "campaign_response_requirement": "24_HOURS",
            "campaign_pricing_model": "HYBRID",
            "campaign_monthly_hours": {
                "Mechanical": 80,
                "Electrical/Instrumentation": 100,
                "Automation": 40,
                "Structural": 20
            },
            "total_hours": 5760,  # 240 hours/month * 24 months
            "total_cost": Decimal("691200.00"),
        },
        # Refinery Support Campaign
        {
            "name": "Refinery Engineering Services - Q1-Q2 2025",
            "project_code": "CAMP-2025-003",
            "work_type": WorkType.CAMPAIGN,
            "status": ProjectStatus.ESTIMATION,
            "client_name": "Global Energy Solutions",
            "description": "Short-term high-intensity support for turnaround planning and execution",
            "company_id": companies[1].id,
            "rate_sheet_id": rate_sheets[1].id,
            "selected_disciplines": ["Process", "Mechanical", "Electrical/Instrumentation", "Automation"],
            "campaign_duration_months": 6,
            "campaign_service_level": "PREMIUM",
            "campaign_site_count": 1,
            "campaign_response_requirement": "48_HOURS",
            "campaign_pricing_model": "TIME_AND_MATERIALS",
            "campaign_monthly_hours": {
                "Process": 60,
                "Mechanical": 80,
                "Electrical/Instrumentation": 60,
                "Automation": 40
            },
            "total_hours": 1440,  # 240 hours/month * 6 months
            "total_cost": Decimal("216000.00"),
        },
    ]

    for data in campaigns_data:
        project = Project(
            id=uuid.uuid4(),
            **data,
            created_by=user.id
        )
        db.add(project)

    await db.commit()
    print(f"OK: Created {len(campaigns_data)} sample campaigns")


async def create_sample_templates(db: AsyncSession, user: User):
    """Create sample deliverable templates."""

    templates_data = [
        # Small Project Template
        {
            "name": "Small Project - Standard Deliverables",
            "project_size": "SMALL",
            "company_id": None,  # Generic template
            "deliverables_config": [
                {
                    "name": "Basis of Design",
                    "phase": "IFC",
                    "raci_hours": {"R": 20, "A": 5, "C": 3, "I": 2}
                },
                {
                    "name": "General Arrangement Drawings",
                    "phase": "IFC",
                    "raci_hours": {"R": 40, "A": 8, "C": 4, "I": 2}
                },
                {
                    "name": "P&ID (if applicable)",
                    "phase": "IFC",
                    "raci_hours": {"R": 30, "A": 6, "C": 3, "I": 2}
                },
            ],
            "active_phases": ["IFC"],
        },
        # Medium Project Template
        {
            "name": "Medium Project - Full Engineering Package",
            "project_size": "MEDIUM",
            "company_id": None,
            "deliverables_config": [
                {
                    "name": "Project Execution Plan",
                    "phase": "IFI",
                    "raci_hours": {"R": 40, "A": 10, "C": 8, "I": 4}
                },
                {
                    "name": "Conceptual Layout",
                    "phase": "IFI",
                    "raci_hours": {"R": 60, "A": 15, "C": 10, "I": 5}
                },
                {
                    "name": "Detailed P&IDs",
                    "phase": "IFC",
                    "raci_hours": {"R": 80, "A": 20, "C": 12, "I": 6}
                },
                {
                    "name": "Equipment Specifications",
                    "phase": "IFC",
                    "raci_hours": {"R": 100, "A": 25, "C": 15, "I": 8}
                },
                {
                    "name": "Installation Drawings",
                    "phase": "IFC",
                    "raci_hours": {"R": 120, "A": 30, "C": 18, "I": 10}
                },
            ],
            "active_phases": ["IFI", "IFC"],
        },
    ]

    for data in templates_data:
        template = DeliverableTemplate(
            id=uuid.uuid4(),
            **data,
            created_by=user.id
        )
        db.add(template)

    await db.commit()
    print(f"OK: Created {len(templates_data)} sample deliverable templates")


async def initialize_size_settings(db: AsyncSession):
    """Initialize project size settings if not exists."""
    settings = await project_size_settings.get_active_settings(db)

    if not settings:
        default_settings = ProjectSizeSettingsCreate(
            small_min_hours=0,
            small_max_hours=500,
            medium_min_hours=501,
            medium_max_hours=2000,
            large_min_hours=2001,
            large_max_hours=10000,
            phase_gate_recommendation_hours=5000,
            auto_adjust_project_size=False,
            warn_on_size_mismatch=True,
            recommend_phase_gate=True,
            is_active=True
        )
        await project_size_settings.create(db, obj_in=default_settings)
        await db.commit()
        print("OK: Initialized project size settings")
    else:
        print("OK: Project size settings already exist")


async def main():
    """Create all sample data."""
    print("=" * 60)
    print("Creating Sample Data for Engineering Estimation System")
    print("=" * 60)
    print()

    async with AsyncSessionLocal() as db:
        try:
            # Get or create test user
            user = await get_or_create_test_user(db)

            # Initialize settings
            await initialize_size_settings(db)

            # Create sample data
            companies = await create_sample_companies(db, user)
            rate_sheets = await create_sample_rate_sheets(db, companies, user)
            await create_sample_discrete_projects(db, companies, rate_sheets, user)
            await create_sample_campaigns(db, companies, rate_sheets, user)
            await create_sample_templates(db, user)

            print()
            print("=" * 60)
            print("OK: Sample Data Creation Complete!")
            print("=" * 60)
            print()
            print("Login Credentials:")
            print("  Email: test@example.com")
            print("  Password: testpassword123")
            print()
            print("Sample Data Summary:")
            print("  - 3 Companies")
            print("  - 2 Rate Sheets")
            print("  - 5 Discrete Projects (Small, Medium, Large, Phase-Gate)")
            print("  - 3 Campaigns (Annual, Multi-site, Short-term)")
            print("  - 2 Deliverable Templates")
            print("=" * 60)

        except Exception as e:
            await db.rollback()
            print(f"\nFailed to create sample data: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(main())
