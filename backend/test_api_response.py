"""Test API response for rate sheets."""

import asyncio
import json
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.rate_sheet import RateSheet
from app.schemas.rate_sheet import RateSheetResponse

async def test_api():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(RateSheet).limit(1))
        rate_sheet = result.scalar_one_or_none()

        if rate_sheet:
            # Serialize using Pydantic schema
            response = RateSheetResponse.model_validate(rate_sheet)
            response_dict = response.model_dump()

            print("Serialized response:")
            print(json.dumps(response_dict, indent=2, default=str))

            print("\n\nRate entries field:")
            print(response_dict.get('rate_entries'))

asyncio.run(test_api())
