"""set default values for phase gate fields

Revision ID: 3c56c780657c
Revises: ed1b294f2768
Create Date: 2025-09-30 20:12:54.693548

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3c56c780657c'
down_revision: Union[str, None] = 'ed1b294f2768'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Set default empty JSON objects for existing NULL values
    op.execute("UPDATE projects SET phase_completion = '{}' WHERE phase_completion IS NULL")
    op.execute("UPDATE projects SET gate_approvals = '{}' WHERE gate_approvals IS NULL")


def downgrade() -> None:
    pass