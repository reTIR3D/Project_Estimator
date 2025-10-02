"""Quick script to check projects in database."""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select, func
from app.core.database import AsyncSessionLocal
from app.models.project import Project

async def main():
    async with AsyncSessionLocal() as db:
        # Count total projects
        count = await db.scalar(select(func.count()).select_from(Project))
        print(f"Total projects in database: {count}")

        # Get all projects
        result = await db.execute(select(Project))
        projects = result.scalars().all()

        print("\nProjects:")
        for p in projects:
            print(f"  - {p.name} ({p.project_code}) - {p.work_type}")

if __name__ == "__main__":
    asyncio.run(main())
