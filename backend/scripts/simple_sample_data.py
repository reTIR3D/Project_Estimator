"""
Simple script to create sample projects for testing.
"""

import asyncio
import sys
from pathlib import Path
from decimal import Decimal

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.project import Project, WorkType, ProcessType, ProjectSize, ProjectStatus, ProjectType
from app.models.user import User
import uuid


async def main():
    """Create sample projects."""
    print("=" * 60)
    print("Creating Sample Projects")
    print("=" * 60)

    async with AsyncSessionLocal() as db:
        try:
            # Get first user
            result = await db.execute(select(User).limit(1))
            user = result.scalars().first()

            if not user:
                print("No users found! Please create a user first.")
                return

            print(f"Using user: {user.email}")

            # Sample discrete projects
            projects = [
                # Small Conventional
                {
                    "name": "Warehouse HVAC Upgrade",
                    "project_code": "PROJ-2025-001",
                    "work_type": WorkType.DISCRETE_PROJECT,
                    "size": ProjectSize.SMALL,
                    "process_type": ProcessType.CONVENTIONAL,
                    "process_type_recommended": ProcessType.CONVENTIONAL,
                    "status": ProjectStatus.ESTIMATION,
                    "project_type": ProjectType.STANDARD,
                    "discipline": "MULTIDISCIPLINE",
                    "client_profile": "TYPE_B",
                    "client_name": "Acme Manufacturing",
                    "description": "Replace aging HVAC system in warehouse",
                    "total_hours": 350,
                    "total_cost": Decimal("38500.00"),
                    "selected_disciplines": ["Mechanical", "Electrical/Instrumentation"],
                    "contingency_percent": 15,
                },
                # Medium Conventional
                {
                    "name": "Process Line Expansion",
                    "project_code": "PROJ-2025-002",
                    "work_type": WorkType.DISCRETE_PROJECT,
                    "size": ProjectSize.MEDIUM,
                    "process_type": ProcessType.CONVENTIONAL,
                    "process_type_recommended": ProcessType.CONVENTIONAL,
                    "status": ProjectStatus.ESTIMATION,
                    "project_type": ProjectType.STANDARD,
                    "discipline": "MULTIDISCIPLINE",
                    "client_profile": "TYPE_B",
                    "client_name": "Acme Manufacturing",
                    "description": "Add new production line with automation",
                    "total_hours": 1250,
                    "total_cost": Decimal("143750.00"),
                    "selected_disciplines": ["Mechanical", "Process", "Electrical/Instrumentation", "Automation"],
                    "contingency_percent": 15,
                },
                # Large Conventional
                {
                    "name": "New Distribution Center",
                    "project_code": "PROJ-2025-003",
                    "work_type": WorkType.DISCRETE_PROJECT,
                    "size": ProjectSize.LARGE,
                    "process_type": ProcessType.CONVENTIONAL,
                    "process_type_recommended": ProcessType.CONVENTIONAL,
                    "status": ProjectStatus.DRAFT,
                    "project_type": ProjectType.STANDARD,
                    "discipline": "MULTIDISCIPLINE",
                    "client_profile": "TYPE_B",
                    "client_name": "TechCorp Industries",
                    "description": "Design 200,000 sq ft distribution center",
                    "total_hours": 3500,
                    "total_cost": Decimal("420000.00"),
                    "selected_disciplines": ["Civil", "Structural", "Mechanical", "Electrical/Instrumentation"],
                    "contingency_percent": 20,
                },
                # Large Phase-Gate
                {
                    "name": "Refinery Modernization Program",
                    "project_code": "PROJ-2025-004",
                    "work_type": WorkType.DISCRETE_PROJECT,
                    "size": ProjectSize.LARGE,
                    "process_type": ProcessType.PHASE_GATE,
                    "process_type_recommended": ProcessType.PHASE_GATE,
                    "status": ProjectStatus.DRAFT,
                    "project_type": ProjectType.STANDARD,
                    "discipline": "MULTIDISCIPLINE",
                    "client_profile": "TYPE_B",
                    "client_name": "Global Energy Solutions",
                    "description": "Multi-phase refinery upgrade program",
                    "total_hours": 8500,
                    "total_cost": Decimal("1275000.00"),
                    "selected_disciplines": ["Process", "Mechanical", "Electrical/Instrumentation", "Automation", "Civil", "Structural"],
                    "contingency_percent": 25,
                },
                # Campaign 1
                {
                    "name": "Annual Plant Maintenance Support 2025",
                    "project_code": "CAMP-2025-001",
                    "work_type": WorkType.CAMPAIGN,
                    "status": ProjectStatus.ACTIVE,
                    "discipline": "MULTIDISCIPLINE",
                    "client_profile": "TYPE_B",
                    "client_name": "Acme Manufacturing",
                    "description": "Ongoing engineering support for routine maintenance",
                    "selected_disciplines": ["Mechanical", "Electrical/Instrumentation", "Civil"],
                    "campaign_duration_months": 12,
                    "campaign_service_level": "STANDARD",
                    "campaign_site_count": 3,
                    "campaign_response_requirement": "5_BUSINESS_DAYS",
                    "campaign_pricing_model": "MONTHLY_RETAINER",
                    "total_hours": 960,
                    "total_cost": Decimal("105600.00"),
                },
                # Campaign 2
                {
                    "name": "Regional Facilities Engineering Support",
                    "project_code": "CAMP-2025-002",
                    "work_type": WorkType.CAMPAIGN,
                    "status": ProjectStatus.ACTIVE,
                    "discipline": "MULTIDISCIPLINE",
                    "client_profile": "TYPE_B",
                    "client_name": "TechCorp Industries",
                    "description": "24/7 support for 8 data center facilities",
                    "selected_disciplines": ["Mechanical", "Electrical/Instrumentation", "Automation"],
                    "campaign_duration_months": 24,
                    "campaign_service_level": "ENTERPRISE",
                    "campaign_site_count": 8,
                    "campaign_response_requirement": "24_HOURS",
                    "campaign_pricing_model": "HYBRID",
                    "total_hours": 5760,
                    "total_cost": Decimal("691200.00"),
                },
            ]

            created_count = 0
            for proj_data in projects:
                project = Project(
                    id=uuid.uuid4(),
                    created_by=user.id,
                    **proj_data
                )
                db.add(project)
                created_count += 1
                print(f"  Created: {proj_data['name']}")

            await db.commit()

            print()
            print("=" * 60)
            print(f"Successfully created {created_count} sample projects!")
            print("=" * 60)
            print()
            print("Sample Data Summary:")
            print("  - 4 Discrete Projects (Small, Medium, Large x2)")
            print("  - 2 Campaigns (Annual support, Multi-site)")
            print()

        except Exception as e:
            await db.rollback()
            print(f"\nError creating sample data: {e}")
            import traceback
            traceback.print_exc()
            raise


if __name__ == "__main__":
    asyncio.run(main())
