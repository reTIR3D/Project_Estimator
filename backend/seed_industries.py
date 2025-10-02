"""Seed script to populate sample industries."""

import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal
from app.models.industry import Industry


async def seed_industries():
    """Create sample industries."""
    async with AsyncSessionLocal() as db:
        # Sample industries with display order
        industries = [
            {
                "name": "Oil & Gas",
                "description": "Upstream, midstream, and downstream oil and gas projects",
                "display_order": 1
            },
            {
                "name": "Heavy Construction",
                "description": "Infrastructure, transportation, and heavy civil projects",
                "display_order": 2
            },
            {
                "name": "Renewables",
                "description": "Solar, wind, hydro, and other renewable energy projects",
                "display_order": 3
            },
            {
                "name": "Manufacturing",
                "description": "Industrial manufacturing facilities and process plants",
                "display_order": 4
            },
            {
                "name": "Power Generation",
                "description": "Conventional power plants and generation facilities",
                "display_order": 5
            },
            {
                "name": "Mining & Minerals",
                "description": "Mining operations and mineral processing facilities",
                "display_order": 6
            },
            {
                "name": "Government & Infrastructure",
                "description": "Government projects, public works, and infrastructure",
                "display_order": 7
            },
            {
                "name": "Water & Wastewater",
                "description": "Water treatment, distribution, and wastewater facilities",
                "display_order": 8
            },
            {
                "name": "Commercial & Institutional",
                "description": "Commercial buildings, healthcare, education facilities",
                "display_order": 9
            },
        ]

        for ind_data in industries:
            # Check if industry already exists
            from sqlalchemy import select
            result = await db.execute(
                select(Industry).where(Industry.name == ind_data["name"])
            )
            existing = result.scalar_one_or_none()

            if not existing:
                industry = Industry(**ind_data)
                db.add(industry)
                print(f"Created industry: {ind_data['name']}")
            else:
                print(f"Industry already exists: {ind_data['name']}")

        await db.commit()
        print("\nIndustry seeding complete!")


if __name__ == "__main__":
    print("Seeding industries...\n")
    asyncio.run(seed_industries())
