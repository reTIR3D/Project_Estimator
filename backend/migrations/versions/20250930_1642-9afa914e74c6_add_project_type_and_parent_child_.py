"""add_project_type_and_parent_child_relationship

Revision ID: 9afa914e74c6
Revises: c525504e7282
Create Date: 2025-09-30 16:42:44.081197

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '9afa914e74c6'
down_revision: Union[str, None] = 'c525504e7282'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create ProjectType enum
    project_type_enum = postgresql.ENUM('STANDARD', 'FACILITY_PARENT', 'MODULE_CHILD', name='projecttype')
    project_type_enum.create(op.get_bind())

    # Add new 'skid' value to ProjectSize enum
    op.execute("ALTER TYPE projectsize ADD VALUE IF NOT EXISTS 'skid'")

    # Add project_type column with default 'STANDARD'
    op.add_column('projects', sa.Column('project_type', sa.Enum('STANDARD', 'FACILITY_PARENT', 'MODULE_CHILD', name='projecttype'), nullable=True))

    # Set default value for existing rows
    op.execute("UPDATE projects SET project_type = 'STANDARD' WHERE project_type IS NULL")

    # Make column non-nullable after setting defaults
    op.alter_column('projects', 'project_type', nullable=False)

    # Add parent_project_id column with foreign key
    op.add_column('projects', sa.Column('parent_project_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key('fk_projects_parent_project_id', 'projects', 'projects', ['parent_project_id'], ['id'])

    # Create index for parent_project_id
    op.create_index('ix_projects_parent_project_id', 'projects', ['parent_project_id'])


def downgrade() -> None:
    # Drop index
    op.drop_index('ix_projects_parent_project_id', table_name='projects')

    # Drop foreign key and column
    op.drop_constraint('fk_projects_parent_project_id', 'projects', type_='foreignkey')
    op.drop_column('projects', 'parent_project_id')

    # Drop project_type column
    op.drop_column('projects', 'project_type')

    # Drop ProjectType enum
    project_type_enum = postgresql.ENUM('STANDARD', 'FACILITY_PARENT', 'MODULE_CHILD', name='projecttype')
    project_type_enum.drop(op.get_bind())

    # Note: Cannot remove 'skid' from ProjectSize enum in PostgreSQL without recreating the enum