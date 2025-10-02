"""add phase_gate to projecttype enum

Revision ID: cf17dc9b164d
Revises: 3c56c780657c
Create Date: 2025-09-30 20:14:46.571583

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cf17dc9b164d'
down_revision: Union[str, None] = '3c56c780657c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add PHASE_GATE to the projecttype enum
    op.execute("ALTER TYPE projecttype ADD VALUE IF NOT EXISTS 'PHASE_GATE'")


def downgrade() -> None:
    pass