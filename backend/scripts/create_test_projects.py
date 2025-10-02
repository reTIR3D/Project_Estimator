"""Create test projects with various configurations."""
import asyncio
import sys
from pathlib import Path
from datetime import datetime, timedelta

# Add the backend directory to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.database import AsyncSessionLocal
from app.models.project import Project, ProjectType, ProjectSize
from app.crud.user import user_crud


async def create_test_projects():
    """Create various test projects."""
    async with AsyncSessionLocal() as db:
        # Get the user
        user = await user_crud.get_by_email(db, email="watson.m.kevin@gmail.com")
        if not user:
            print("User not found! Please run create_user.py first.")
            return

        print(f"Creating test projects for user: {user.email}")

        # Project 1: Small Standard Project
        project1 = Project(
            name="Office Renovation - Small",
            client_name="Acme Corporation",
            project_type=ProjectType.STANDARD,
            size=ProjectSize.SMALL,
            discipline="CIVIL",
            client_profile="TYPE_B",
            selected_disciplines=["architectural", "structural"],
            status="DRAFT",
            created_by=user.id
        )
        db.add(project1)
        print(f"Created: {project1.name}")

        # Project 2: Medium Standard Project
        project2 = Project(
            name="Warehouse Expansion - Medium",
            client_name="Industrial Solutions Inc",
            project_type=ProjectType.STANDARD,
            size=ProjectSize.MEDIUM,
            discipline="STRUCTURAL",
            client_profile="TYPE_A",
            selected_disciplines=["architectural", "structural", "mechanical", "electrical"],
            status="ACTIVE",
            created_by=user.id
        )
        db.add(project2)
        print(f"Created: {project2.name}")

        # Project 3: Large Standard Project
        project3 = Project(
            name="Hospital Wing Construction - Large",
            client_name="City Medical Center",
            project_type=ProjectType.STANDARD,
            size=ProjectSize.LARGE,
            discipline="MULTIDISCIPLINE",
            client_profile="TYPE_A",
            selected_disciplines=["architectural", "structural", "mechanical", "electrical", "plumbing", "fire_protection"],
            status="ACTIVE",
            created_by=user.id
        )
        db.add(project3)
        print(f"Created: {project3.name}")

        # Project 4: Standard Large Project
        project4 = Project(
            name="University Campus Master Plan",
            client_name="State University",
            project_type=ProjectType.STANDARD,
            size=ProjectSize.LARGE,
            discipline="CIVIL",
            client_profile="TYPE_C",
            selected_disciplines=["architectural", "structural", "civil", "landscape"],
            status="DRAFT",
            created_by=user.id
        )
        db.add(project4)
        print(f"Created: {project4.name}")

        # Project 5: Fast-track Small Project
        project5 = Project(
            name="Retail Store Fit-out",
            client_name="Fashion Retail Co",
            project_type=ProjectType.STANDARD,
            size=ProjectSize.SMALL,
            discipline="ELECTRICAL",
            client_profile="TYPE_C",
            selected_disciplines=["architectural", "electrical"],
            status="COMPLETED",
            created_by=user.id
        )
        db.add(project5)
        print(f"Created: {project5.name}")

        await db.commit()
        print("\nAll test projects created successfully!")
        print(f"\nTotal projects: 5")
        print("- 2 Small projects")
        print("- 1 Medium project")
        print("- 2 Large projects")
        print("\nStatuses: 2 draft, 2 in_progress, 1 completed")


if __name__ == "__main__":
    asyncio.run(create_test_projects())
