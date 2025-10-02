"""add_industry_company_ratesheet_hierarchy

Revision ID: 27259e3efa33
Revises: 5a0604d6da71
Create Date: 2025-10-01 21:27:11.242359

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '27259e3efa33'
down_revision: Union[str, None] = '5a0604d6da71'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create industries table
    op.create_table(
        'industries',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('display_order', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('is_archived', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_industries_name'), 'industries', ['name'], unique=True)

    # Create companies table (new structure)
    op.create_table(
        'companies',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('industry_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('contact_name', sa.String(length=255), nullable=True),
        sa.Column('contact_email', sa.String(length=255), nullable=True),
        sa.Column('contact_phone', sa.String(length=50), nullable=True),
        sa.Column('client_type', sa.String(length=50), nullable=True, server_default='STANDARD'),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['industry_id'], ['industries.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_companies_code'), 'companies', ['code'], unique=True)
    op.create_index(op.f('ix_companies_industry_id'), 'companies', ['industry_id'], unique=False)
    op.create_index(op.f('ix_companies_name'), 'companies', ['name'], unique=False)

    # Create rate_sheets table
    op.create_table(
        'rate_sheets',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('company_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('rates', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('is_default', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_rate_sheets_company_id'), 'rate_sheets', ['company_id'], unique=False)

    # Migrate existing clients to new structure
    # 1. Create a default "General" industry for existing clients
    op.execute("""
        INSERT INTO industries (id, name, description, display_order, is_archived, created_at, updated_at)
        VALUES (gen_random_uuid(), 'General', 'Default industry for migrated clients', 0, false, NOW(), NOW())
    """)

    # 2. Migrate existing clients to companies table
    op.execute("""
        INSERT INTO companies (id, industry_id, name, code, description, contact_name, contact_email,
                              contact_phone, client_type, is_active, created_at, updated_at)
        SELECT
            c.id,
            (SELECT id FROM industries WHERE name = 'General'),
            c.name,
            c.code,
            c.description,
            c.contact_name,
            c.contact_email,
            c.contact_phone,
            c.client_type,
            c.is_active,
            c.created_at,
            c.updated_at
        FROM clients c
    """)

    # 3. Create rate sheets from existing clients' custom_rates
    op.execute("""
        INSERT INTO rate_sheets (id, company_id, name, description, rates, is_default, is_active, created_at, updated_at)
        SELECT
            gen_random_uuid(),
            c.id,
            'Standard Rates',
            'Migrated from original client configuration',
            COALESCE(c.custom_rates, '{}'::json),
            true,
            true,
            NOW(),
            NOW()
        FROM clients c
        WHERE c.custom_rates IS NOT NULL AND c.custom_rates::text != '{}'::text
    """)

    # Note: Keep the old 'clients' table for now for backward compatibility
    # We'll deprecate it in a future migration after updating all API endpoints


def downgrade() -> None:
    # Drop new tables in reverse order
    op.drop_index(op.f('ix_rate_sheets_company_id'), table_name='rate_sheets')
    op.drop_table('rate_sheets')

    op.drop_index(op.f('ix_companies_name'), table_name='companies')
    op.drop_index(op.f('ix_companies_industry_id'), table_name='companies')
    op.drop_index(op.f('ix_companies_code'), table_name='companies')
    op.drop_table('companies')

    op.drop_index(op.f('ix_industries_name'), table_name='industries')
    op.drop_table('industries')