"""add selected_disciplines to projects

Revision ID: 8c472aed5cbc
Revises: cf17dc9b164d
Create Date: 2025-09-30 20:34:13.507176

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8c472aed5cbc'
down_revision: Union[str, None] = 'cf17dc9b164d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add selected_disciplines column
    op.add_column('projects', sa.Column('selected_disciplines', sa.JSON(), nullable=True))

    # Set default empty array for existing projects
    op.execute("UPDATE projects SET selected_disciplines = '[]' WHERE selected_disciplines IS NULL")


def downgrade() -> None:
    op.drop_column('projects', 'selected_disciplines')