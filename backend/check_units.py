"""Check current rate units."""

import asyncio
import json
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.rate_sheet import RateSheet

async def check_units():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(RateSheet).limit(1))
        rate_sheet = result.scalar_one()

        equipment_software = [e for e in rate_sheet.rate_entries if e.get('discipline') in ['Equipment', 'Software']]
        print(json.dumps(equipment_software, indent=2))

asyncio.run(check_units())
