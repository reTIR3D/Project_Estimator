"""Add Equipment and Software rates to all rate sheets."""

import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.rate_sheet import RateSheet

# Equipment and Software rates to add
EQUIPMENT_SOFTWARE_RATES = [
    # Equipment - using daily rates
    {"discipline": "Equipment", "role": "Survey Equipment (GPS/Total Station)", "rate": 150, "unit": "daily"},
    {"discipline": "Equipment", "role": "Drone/UAV with Mapping Software", "rate": 200, "unit": "daily"},
    {"discipline": "Equipment", "role": "Geotechnical Testing Equipment", "rate": 125, "unit": "daily"},
    {"discipline": "Equipment", "role": "Environmental Monitoring Equipment", "rate": 100, "unit": "daily"},
    {"discipline": "Equipment", "role": "3D Scanner/LiDAR", "rate": 250, "unit": "daily"},
    {"discipline": "Equipment", "role": "Construction Materials Testing Lab", "rate": 175, "unit": "daily"},

    # Software - using per seat rates
    {"discipline": "Software", "role": "AutoCAD License (per seat)", "rate": 50, "unit": "per seat"},
    {"discipline": "Software", "role": "Revit License (per seat)", "rate": 60, "unit": "per seat"},
    {"discipline": "Software", "role": "Civil 3D License (per seat)", "rate": 65, "unit": "per seat"},
    {"discipline": "Software", "role": "Navisworks License (per seat)", "rate": 45, "unit": "per seat"},
    {"discipline": "Software", "role": "Bluebeam Revu License (per seat)", "rate": 30, "unit": "per seat"},
    {"discipline": "Software", "role": "Project Management Software (Procore/BIM 360)", "rate": 40, "unit": "per seat"},
    {"discipline": "Software", "role": "Structural Analysis Software (ETABS/SAP2000)", "rate": 70, "unit": "per seat"},
    {"discipline": "Software", "role": "Energy Modeling Software (EnergyPlus/eQuest)", "rate": 55, "unit": "per seat"},
]

async def add_equipment_software():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(RateSheet))
        rate_sheets = result.scalars().all()

        if not rate_sheets:
            print("No rate sheets found")
            return

        for rate_sheet in rate_sheets:
            print(f"\nUpdating Rate Sheet: {rate_sheet.name}")

            # Get existing rate entries
            existing_entries = rate_sheet.rate_entries or []

            # Check which equipment/software entries already exist
            existing_roles = {(entry['discipline'], entry['role']) for entry in existing_entries}

            # Add new equipment and software entries
            added_count = 0
            for new_entry in EQUIPMENT_SOFTWARE_RATES:
                key = (new_entry['discipline'], new_entry['role'])
                if key not in existing_roles:
                    existing_entries.append(new_entry)
                    added_count += 1
                    print(f"  Added: {new_entry['discipline']} - {new_entry['role']}")

            if added_count > 0:
                rate_sheet.rate_entries = existing_entries
                print(f"  Total entries added: {added_count}")
            else:
                print("  All equipment/software entries already exist")

        await session.commit()
        print("\n✅ Successfully updated all rate sheets!")
        print(f"Total rate sheets updated: {len(rate_sheets)}")

if __name__ == "__main__":
    asyncio.run(add_equipment_software())
