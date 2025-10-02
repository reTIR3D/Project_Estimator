"""update_project_type_and_size_data

Revision ID: f0e92ef1606f
Revises: 5483951df80d
Create Date: 2025-09-30 20:52:14.184831

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f0e92ef1606f'
down_revision: Union[str, None] = '5483951df80d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if projects table has any data before attempting updates
    conn = op.get_bind()
    result = conn.execute(sa.text("SELECT COUNT(*) FROM projects"))
    count = result.scalar()

    if count > 0:
        # Update existing PHASE_GATE project_type to STANDARD (since we're removing that enum value)
        op.execute("UPDATE projects SET project_type = 'STANDARD' WHERE project_type = 'PHASE_GATE'")

        # Update existing FACILITY_PARENT and MODULE_CHILD to STANDARD
        op.execute("UPDATE projects SET project_type = 'STANDARD' WHERE project_type IN ('FACILITY_PARENT', 'MODULE_CHILD')")

        # For projects that were using phase-gate type, set their size to PHASE_GATE if they have phase data
        op.execute("""
            UPDATE projects
            SET size = 'PHASE_GATE'
            WHERE size IN ('LARGE', 'MEDIUM')
            AND current_phase IS NOT NULL
        """)


def downgrade() -> None:
    # Downgrade: convert PHASE_GATE size back to LARGE
    op.execute("UPDATE projects SET size = 'LARGE' WHERE size = 'PHASE_GATE'")