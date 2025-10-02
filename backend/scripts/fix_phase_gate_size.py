"""Fix projects that have PHASE_GATE as size."""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from app.core.database import AsyncSessionLocal

async def main():
    async with AsyncSessionLocal() as db:
        # Fix PHASE_GATE size values
        result = await db.execute(
            text("""
                UPDATE projects
                SET size = 'LARGE',
                    process_type = 'PHASE_GATE',
                    process_type_recommended = 'PHASE_GATE',
                    process_type_overridden = false
                WHERE size = 'PHASE_GATE'
            """)
        )

        await db.commit()
        print(f"Fixed {result.rowcount} projects with PHASE_GATE as size")

        # Also set work_type for any projects that don't have it
        result2 = await db.execute(
            text("""
                UPDATE projects
                SET work_type = 'DISCRETE_PROJECT'
                WHERE work_type IS NULL
            """)
        )

        await db.commit()
        print(f"Set work_type for {result2.rowcount} projects")

if __name__ == "__main__":
    asyncio.run(main())
