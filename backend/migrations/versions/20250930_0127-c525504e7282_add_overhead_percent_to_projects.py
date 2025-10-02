"""add_overhead_percent_to_projects

Revision ID: c525504e7282
Revises: 37c4262f54f3
Create Date: 2025-09-30 01:27:24.525470

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c525504e7282'
down_revision: Union[str, None] = '37c4262f54f3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add overhead_percent column to projects table with default value of 10.0
    op.add_column('projects', sa.Column('overhead_percent', sa.Float(), nullable=True))

    # Set default value for existing rows
    op.execute("UPDATE projects SET overhead_percent = 10.0 WHERE overhead_percent IS NULL")

    # Make column non-nullable after setting defaults
    op.alter_column('projects', 'overhead_percent', nullable=False)


def downgrade() -> None:
    # Remove overhead_percent column
    op.drop_column('projects', 'overhead_percent')