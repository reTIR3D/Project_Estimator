import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.company import Company

async def check_company():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Company).limit(1))
        company = result.scalar_one_or_none()
        if company:
            print(f"ID: {company.id}")
            print(f"Name: {company.name}")
            print(f"Client Complexity: {company.client_complexity}")
            print(f"Base Contingency: {company.base_contingency}")
        else:
            print("No companies found")

asyncio.run(check_company())
