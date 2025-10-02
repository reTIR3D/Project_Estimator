"""Check if rate_entries exist in database."""

import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.rate_sheet import RateSheet

async def check_rate_entries():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(RateSheet).limit(1))
        rate_sheet = result.scalar_one_or_none()
        if rate_sheet:
            print(f"Rate Sheet: {rate_sheet.name}")
            print(f"Rate entries type: {type(rate_sheet.rate_entries)}")
            print(f"Rate entries: {rate_sheet.rate_entries}")
            if rate_sheet.rate_entries:
                print(f"First entry: {rate_sheet.rate_entries[0]}")
        else:
            print("No rate sheets found")

asyncio.run(check_rate_entries())
