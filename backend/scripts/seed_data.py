"""Seed database with sample data."""

import asyncio
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.crud.user import user_crud
from app.schemas.user import UserCreate
from app.models.user import UserRole


async def create_sample_users(db: AsyncSession):
    """Create sample users."""

    # Admin user
    admin_user = UserCreate(
        email="admin@example.com",
        username="admin",
        password="admin123456",
        full_name="System Administrator",
        is_superuser=True,
        role=UserRole.ADMIN
    )

    # Manager user
    manager_user = UserCreate(
        email="manager@example.com",
        username="manager",
        password="manager123456",
        full_name="Project Manager",
        role=UserRole.MANAGER
    )

    # Engineer user
    engineer_user = UserCreate(
        email="engineer@example.com",
        username="engineer",
        password="engineer123456",
        full_name="Senior Engineer",
        role=UserRole.ENGINEER
    )

    # Create users
    for user_data in [admin_user, manager_user, engineer_user]:
        existing = await user_crud.get_by_email(db, email=user_data.email)
        if not existing:
            user = await user_crud.create(db, obj_in=user_data)
            print(f"Created user: {user.email}")
        else:
            print(f"User already exists: {user_data.email}")


async def seed_database():
    """Seed the database with sample data."""

    async with AsyncSessionLocal() as db:
        try:
            print("Seeding database...")

            # Create sample users
            await create_sample_users(db)

            # Commit transaction
            await db.commit()

            print("Database seeded successfully!")

        except Exception as e:
            await db.rollback()
            print(f"Error seeding database: {str(e)}")
            raise


if __name__ == "__main__":
    asyncio.run(seed_database())