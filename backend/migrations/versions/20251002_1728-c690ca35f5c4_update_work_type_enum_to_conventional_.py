"""update_work_type_enum_to_conventional_phase_gate_campaign

Revision ID: c690ca35f5c4
Revises: 7d0a7d8f248d
Create Date: 2025-10-02 17:28:09.092644

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c690ca35f5c4'
down_revision: Union[str, None] = '7d0a7d8f248d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Update work_type enum: DISCRETE_PROJECT -> CONVENTIONAL, add PHASE_GATE
    # PostgreSQL requires committing after ALTER TYPE ADD VALUE before using the new value

    # Step 1: Add new enum values (must be done outside transaction or with commit)
    connection = op.get_bind()
    connection.execute(sa.text("COMMIT"))  # Commit current transaction
    connection.execute(sa.text("ALTER TYPE worktype ADD VALUE IF NOT EXISTS 'CONVENTIONAL'"))
    connection.execute(sa.text("ALTER TYPE worktype ADD VALUE IF NOT EXISTS 'PHASE_GATE'"))

    # Step 2: Update existing DISCRETE_PROJECT rows to CONVENTIONAL
    op.execute("UPDATE projects SET work_type = 'CONVENTIONAL' WHERE work_type = 'DISCRETE_PROJECT'")

    # Note: Can't remove old enum value DISCRETE_PROJECT without recreating the enum type
    # which would require dropping and recreating the column. Since it won't be used,
    # we'll leave it in the enum but it won't appear in the application.


def downgrade() -> None:
    # Reverse the migration
    op.execute("UPDATE projects SET work_type = 'DISCRETE_PROJECT' WHERE work_type = 'CONVENTIONAL'")
    op.execute("UPDATE projects SET work_type = 'DISCRETE_PROJECT' WHERE work_type = 'PHASE_GATE'")