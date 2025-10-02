"""Populate rate sheet data with sample rates organized by discipline."""

import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.rate_sheet import RateSheet

# Sample rate data organized by discipline
SAMPLE_RATES = [
    # Civil discipline
    {"discipline": "Civil", "role": "Senior Civil Engineer", "rate": 175},
    {"discipline": "Civil", "role": "Civil Engineer", "rate": 145},
    {"discipline": "Civil", "role": "Junior Civil Engineer", "rate": 110},
    {"discipline": "Civil", "role": "CAD Technician - Civil", "rate": 95},

    # Mechanical discipline
    {"discipline": "Mechanical", "role": "Senior Mechanical Engineer", "rate": 180},
    {"discipline": "Mechanical", "role": "Mechanical Engineer", "rate": 150},
    {"discipline": "Mechanical", "role": "Junior Mechanical Engineer", "rate": 115},
    {"discipline": "Mechanical", "role": "HVAC Specialist", "rate": 155},
    {"discipline": "Mechanical", "role": "Piping Designer", "rate": 140},

    # Electrical discipline
    {"discipline": "Electrical", "role": "Senior Electrical Engineer", "rate": 185},
    {"discipline": "Electrical", "role": "Electrical Engineer", "rate": 155},
    {"discipline": "Electrical", "role": "Junior Electrical Engineer", "rate": 120},
    {"discipline": "Electrical", "role": "Power Systems Engineer", "rate": 170},
    {"discipline": "Electrical", "role": "Lighting Designer", "rate": 135},

    # Structural discipline
    {"discipline": "Structural", "role": "Senior Structural Engineer", "rate": 190},
    {"discipline": "Structural", "role": "Structural Engineer", "rate": 160},
    {"discipline": "Structural", "role": "Junior Structural Engineer", "rate": 125},
    {"discipline": "Structural", "role": "Structural Designer", "rate": 130},

    # Instrumentation discipline
    {"discipline": "Instrumentation", "role": "Senior I&C Engineer", "rate": 175},
    {"discipline": "Instrumentation", "role": "I&C Engineer", "rate": 145},
    {"discipline": "Instrumentation", "role": "Instrumentation Technician", "rate": 120},

    # Process discipline
    {"discipline": "Process", "role": "Senior Process Engineer", "rate": 195},
    {"discipline": "Process", "role": "Process Engineer", "rate": 165},
    {"discipline": "Process", "role": "Junior Process Engineer", "rate": 130},
    {"discipline": "Process", "role": "Process Safety Engineer", "rate": 180},

    # Controls discipline
    {"discipline": "Controls", "role": "Senior Controls Engineer", "rate": 185},
    {"discipline": "Controls", "role": "Controls Engineer", "rate": 155},
    {"discipline": "Controls", "role": "PLC Programmer", "rate": 145},
    {"discipline": "Controls", "role": "SCADA Specialist", "rate": 160},

    # Project Management / General
    {"discipline": "Architecture", "role": "Senior Architect", "rate": 200},
    {"discipline": "Architecture", "role": "Architect", "rate": 170},
    {"discipline": "Architecture", "role": "Junior Architect", "rate": 135},
]

async def populate_rates():
    """Populate all rate sheets with sample rate data."""
    async with AsyncSessionLocal() as session:
        # Get all rate sheets
        result = await session.execute(select(RateSheet))
        rate_sheets = result.scalars().all()

        if not rate_sheets:
            print("No rate sheets found in database")
            return

        print(f"Found {len(rate_sheets)} rate sheets")

        for rate_sheet in rate_sheets:
            print(f"\nUpdating rate sheet: {rate_sheet.name}")

            # Set the new rate_entries structure
            rate_sheet.rate_entries = SAMPLE_RATES.copy()

            # Also update the old rates format for backwards compatibility
            rate_sheet.rates = {entry["role"]: entry["rate"] for entry in SAMPLE_RATES}

            session.add(rate_sheet)
            print(f"  Added {len(SAMPLE_RATES)} rate entries")

        await session.commit()
        print(f"\n✅ Successfully populated rates for {len(rate_sheets)} rate sheets")

if __name__ == "__main__":
    asyncio.run(populate_rates())
