"""add deliverable dependency and issue state configuration

Revision ID: 9a1b9b2fcb50
Revises: c690ca35f5c4
Create Date: 2025-10-02 23:35:27.009206

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9a1b9b2fcb50'
down_revision: Union[str, None] = 'c690ca35f5c4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new columns to deliverables table
    op.add_column('deliverables', sa.Column('equipment_id', sa.String(255), nullable=True))
    op.add_column('deliverables', sa.Column('discipline', sa.String(100), nullable=True))
    op.add_column('deliverables', sa.Column('base_hours', sa.Integer(), nullable=True))
    op.add_column('deliverables', sa.Column('issue_states', sa.JSON(), nullable=True, server_default='["IFR", "IFC"]'))
    op.add_column('deliverables', sa.Column('review_cycles', sa.Integer(), nullable=True, server_default='1'))
    op.add_column('deliverables', sa.Column('rework_factor', sa.Integer(), nullable=True, server_default='25'))


def downgrade() -> None:
    # Remove columns from deliverables table
    op.drop_column('deliverables', 'rework_factor')
    op.drop_column('deliverables', 'review_cycles')
    op.drop_column('deliverables', 'issue_states')
    op.drop_column('deliverables', 'base_hours')
    op.drop_column('deliverables', 'discipline')
    op.drop_column('deliverables', 'equipment_id')