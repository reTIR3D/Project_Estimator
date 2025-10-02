"""refactor_project_size_and_type_enums

Revision ID: 5483951df80d
Revises: 8c472aed5cbc
Create Date: 2025-09-30 20:48:20.605231

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5483951df80d'
down_revision: Union[str, None] = '8c472aed5cbc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add PHASE_GATE to projectsize enum
    # Note: Must be committed before use - handled by Alembic transaction
    op.execute("ALTER TYPE projectsize ADD VALUE IF NOT EXISTS 'PHASE_GATE'")


def downgrade() -> None:
    # No downgrade for enum value addition
    # PostgreSQL doesn't support removing enum values
    pass