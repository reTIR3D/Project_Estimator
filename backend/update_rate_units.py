"""Update rate units for Equipment and Software entries."""

import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.rate_sheet import RateSheet

async def update_rate_units():
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

            updated_count = 0
            for entry in existing_entries:
                # Update Equipment entries to use "daily" unit
                if entry.get('discipline') == 'Equipment':
                    if 'unit' not in entry or entry.get('unit') == 'hourly':
                        entry['unit'] = 'daily'
                        updated_count += 1
                        print(f"  Updated to daily: {entry['role']}")

                # Update Software entries to use "per seat" unit
                elif entry.get('discipline') == 'Software':
                    if 'unit' not in entry or entry.get('unit') == 'hourly':
                        entry['unit'] = 'per seat'
                        updated_count += 1
                        print(f"  Updated to per seat: {entry['role']}")

                # Set default "hourly" for all other entries that don't have a unit
                elif 'unit' not in entry:
                    entry['unit'] = 'hourly'

            if updated_count > 0:
                rate_sheet.rate_entries = existing_entries
                print(f"  Total entries updated: {updated_count}")
            else:
                print("  No updates needed")

        await session.commit()
        print("\nSuccessfully updated all rate sheets!")
        print(f"Total rate sheets processed: {len(rate_sheets)}")

if __name__ == "__main__":
    asyncio.run(update_rate_units())
