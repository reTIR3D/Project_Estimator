"""
Migration script to update existing projects with new work_type and process_type fields.

This script:
1. Sets work_type to DISCRETE_PROJECT for all existing projects
2. Determines process_type based on existing size field
3. Migrates PHASE_GATE size to LARGE size with PHASE_GATE process type
4. Sets appropriate defaults for new campaign-specific fields
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path so we can import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select, update, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal
from app.models.project import Project, WorkType, ProcessType, ProjectSize


async def migrate_projects():
    """Migrate existing projects to new structure."""

    async with AsyncSessionLocal() as db:
        try:
            # Get all existing projects
            result = await db.execute(select(Project))
            projects = result.scalars().all()

            print(f"Found {len(projects)} projects to migrate")

            migrated_count = 0
            for project in projects:
                changes = []

                # Set work_type to DISCRETE_PROJECT if not already set
                if not project.work_type:
                    project.work_type = WorkType.DISCRETE_PROJECT
                    changes.append("work_type=DISCRETE_PROJECT")

                # Handle size and process_type migration
                if project.size == 'PHASE_GATE':
                    # Migrate PHASE_GATE size to LARGE with PHASE_GATE process
                    project.size = ProjectSize.LARGE
                    project.process_type = ProcessType.PHASE_GATE
                    project.process_type_recommended = ProcessType.PHASE_GATE
                    project.process_type_overridden = False
                    changes.append("size=LARGE (was PHASE_GATE)")
                    changes.append("process_type=PHASE_GATE")
                else:
                    # Set process_type to CONVENTIONAL if not set
                    if not project.process_type:
                        project.process_type = ProcessType.CONVENTIONAL
                        project.process_type_recommended = ProcessType.CONVENTIONAL
                        project.process_type_overridden = False
                        changes.append("process_type=CONVENTIONAL")

                # Ensure campaign-specific fields are None for discrete projects
                if project.work_type == WorkType.DISCRETE_PROJECT:
                    if project.campaign_duration_months is not None:
                        project.campaign_duration_months = None
                        changes.append("cleared campaign fields")
                    project.campaign_service_level = None
                    project.campaign_site_count = None
                    project.campaign_response_requirement = None
                    project.campaign_monthly_hours = None
                    project.campaign_scheduled_deliverables = None
                    project.campaign_pricing_model = None

                if changes:
                    migrated_count += 1
                    print(f"  Migrating '{project.name}': {', '.join(changes)}")

            # Commit all changes
            await db.commit()

            print(f"\n✓ Successfully migrated {migrated_count} projects")
            print(f"  - {len(projects) - migrated_count} projects already up to date")

        except Exception as e:
            await db.rollback()
            print(f"\n✗ Migration failed: {e}")
            raise


async def verify_migration():
    """Verify migration results."""

    async with AsyncSessionLocal() as db:
        print("\nMigration Verification:")
        print("=" * 50)

        # Get counts
        discrete_count = await db.scalar(
            select(func.count())
            .select_from(Project)
            .where(Project.work_type == WorkType.DISCRETE_PROJECT)
        ) or 0

        campaign_count = await db.scalar(
            select(func.count())
            .select_from(Project)
            .where(Project.work_type == WorkType.CAMPAIGN)
        ) or 0

        conventional_count = await db.scalar(
            select(func.count())
            .select_from(Project)
            .where(Project.process_type == ProcessType.CONVENTIONAL)
        ) or 0

        phase_gate_count = await db.scalar(
            select(func.count())
            .select_from(Project)
            .where(Project.process_type == ProcessType.PHASE_GATE)
        ) or 0

        print(f"Work Types:")
        print(f"  - Discrete Projects: {discrete_count}")
        print(f"  - Campaigns: {campaign_count}")
        print(f"\nProcess Types:")
        print(f"  - Conventional: {conventional_count}")
        print(f"  - Phase-Gate: {phase_gate_count}")

        # Check for any remaining PHASE_GATE sizes
        phase_gate_size_count = await db.scalar(
            select(func.count())
            .select_from(Project)
            .where(Project.size == 'PHASE_GATE')
        ) or 0

        if phase_gate_size_count > 0:
            print(f"\n⚠ Warning: {phase_gate_size_count} projects still have PHASE_GATE as size")
        else:
            print(f"\n✓ No projects with PHASE_GATE size remaining")


async def main():
    """Run migration and verification."""
    print("=" * 50)
    print("Project Migration Script")
    print("=" * 50)
    print()

    # Run migration
    await migrate_projects()

    # Verify results
    await verify_migration()

    print("\n" + "=" * 50)
    print("Migration Complete")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
