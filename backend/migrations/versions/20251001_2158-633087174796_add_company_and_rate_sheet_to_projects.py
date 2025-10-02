"""add_company_and_rate_sheet_to_projects

Revision ID: 633087174796
Revises: 27259e3efa33
Create Date: 2025-10-01 21:58:42.451494

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '633087174796'
down_revision: Union[str, None] = '27259e3efa33'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add company_id and rate_sheet_id columns to projects table
    op.add_column('projects', sa.Column('company_id', sa.UUID(), nullable=True))
    op.add_column('projects', sa.Column('rate_sheet_id', sa.UUID(), nullable=True))

    # Create foreign key constraints
    op.create_foreign_key('fk_projects_company_id', 'projects', 'companies', ['company_id'], ['id'])
    op.create_foreign_key('fk_projects_rate_sheet_id', 'projects', 'rate_sheets', ['rate_sheet_id'], ['id'])

    # Create indexes
    op.create_index('ix_projects_company_id', 'projects', ['company_id'])
    op.create_index('ix_projects_rate_sheet_id', 'projects', ['rate_sheet_id'])
    op.create_index('idx_project_company', 'projects', ['company_id'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('idx_project_company', 'projects')
    op.drop_index('ix_projects_rate_sheet_id', 'projects')
    op.drop_index('ix_projects_company_id', 'projects')

    # Drop foreign key constraints
    op.drop_constraint('fk_projects_rate_sheet_id', 'projects', type_='foreignkey')
    op.drop_constraint('fk_projects_company_id', 'projects', type_='foreignkey')

    # Drop columns
    op.drop_column('projects', 'rate_sheet_id')
    op.drop_column('projects', 'company_id')