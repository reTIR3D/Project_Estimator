"""Fix NULL values in existing projects."""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from app.core.database import AsyncSessionLocal

async def main():
    async with AsyncSessionLocal() as db:
        # Fix NULL values for new fields - do them separately
        result1 = await db.execute(
            text("""
                UPDATE projects
                SET process_type_overridden = false
                WHERE process_type_overridden IS NULL
            """)
        )

        result2 = await db.execute(
            text("""
                UPDATE projects
                SET campaign_monthly_hours = '{}'::json
                WHERE campaign_monthly_hours IS NULL
            """)
        )

        result3 = await db.execute(
            text("""
                UPDATE projects
                SET campaign_scheduled_deliverables = '[]'::json
                WHERE campaign_scheduled_deliverables IS NULL
            """)
        )

        result = type('obj', (object,), {'rowcount': result1.rowcount + result2.rowcount + result3.rowcount})()

        await db.commit()
        print(f"Fixed {result.rowcount} projects with NULL field values")

if __name__ == "__main__":
    asyncio.run(main())
