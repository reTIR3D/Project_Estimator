"""add equipment and deliverables config to projects

Revision ID: 3d1e25d308a1
Revises: 9a1b9b2fcb50
Create Date: 2025-10-02 23:38:17.677916

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3d1e25d308a1'
down_revision: Union[str, None] = '9a1b9b2fcb50'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new columns to projects table
    op.add_column('projects', sa.Column('equipment_list', sa.JSON(), nullable=True, server_default='[]'))
    op.add_column('projects', sa.Column('deliverables_config', sa.JSON(), nullable=True, server_default='[]'))


def downgrade() -> None:
    # Remove columns from projects table
    op.drop_column('projects', 'deliverables_config')
    op.drop_column('projects', 'equipment_list')