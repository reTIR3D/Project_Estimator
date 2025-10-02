"""Create a specific user account."""
import asyncio
import sys
from pathlib import Path

# Add the backend directory to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.database import AsyncSessionLocal
from app.crud.user import user_crud
from app.schemas.user import UserCreate
from app.models.user import UserRole


async def create_user():
    """Create user account."""
    async with AsyncSessionLocal() as db:
        # Check if user exists
        existing = await user_crud.get_by_email(db, email="watson.m.kevin@gmail.com")
        if existing:
            print(f"User watson.m.kevin@gmail.com already exists!")
            return

        # Create user
        user_data = UserCreate(
            email="watson.m.kevin@gmail.com",
            username="kwatson",
            password="password123",  # You should change this after first login
            full_name="Kevin Watson",
            is_active=True,
            is_superuser=True,
            role=UserRole.ADMIN
        )

        user = await user_crud.create(db, obj_in=user_data)
        await db.commit()
        print(f"Created user: {user.email}")
        print(f"Password: password123")
        print("Please change your password after logging in!")


if __name__ == "__main__":
    asyncio.run(create_user())
