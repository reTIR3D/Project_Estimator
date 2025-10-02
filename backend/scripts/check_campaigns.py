"""Check campaign projects."""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from app.core.database import AsyncSessionLocal

async def main():
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            text("SELECT id, name, work_type FROM projects WHERE work_type = 'CAMPAIGN'")
        )
        campaigns = result.fetchall()
        print(f"\nFound {len(campaigns)} campaign projects:")
        for campaign in campaigns:
            print(f"  - {campaign.name} (ID: {campaign.id})")

if __name__ == "__main__":
    asyncio.run(main())
