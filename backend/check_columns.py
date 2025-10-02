import asyncio
from sqlalchemy import text
from app.core.database import engine

async def check_columns():
    async with engine.begin() as conn:
        result = await conn.execute(text(
            "SELECT column_name, data_type FROM information_schema.columns "
            "WHERE table_name = 'companies' ORDER BY ordinal_position"
        ))
        for row in result:
            print(f"{row[0]}: {row[1]}")

asyncio.run(check_columns())
