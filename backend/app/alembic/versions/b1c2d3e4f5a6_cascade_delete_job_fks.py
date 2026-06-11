"""cascade delete job foreign keys

Revision ID: b1c2d3e4f5a6
Revises: 4f3c029f14d8
Create Date: 2026-06-11 09:00:00.000000

"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "b1c2d3e4f5a6"
down_revision = "4f3c029f14d8"
branch_labels = None
depends_on = None


def upgrade():
    # leadpurchase.job_id → ON DELETE CASCADE
    op.drop_constraint("leadpurchase_job_id_fkey", "leadpurchase", type_="foreignkey")
    op.create_foreign_key(
        "leadpurchase_job_id_fkey",
        "leadpurchase",
        "job",
        ["job_id"],
        ["id"],
        ondelete="CASCADE",
    )

    # savedjob.job_id → ON DELETE CASCADE
    op.drop_constraint("savedjob_job_id_fkey", "savedjob", type_="foreignkey")
    op.create_foreign_key(
        "savedjob_job_id_fkey",
        "savedjob",
        "job",
        ["job_id"],
        ["id"],
        ondelete="CASCADE",
    )

    # jobupdatelog.job_id → ON DELETE CASCADE
    op.drop_constraint("jobupdatelog_job_id_fkey", "jobupdatelog", type_="foreignkey")
    op.create_foreign_key(
        "jobupdatelog_job_id_fkey",
        "jobupdatelog",
        "job",
        ["job_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade():
    op.drop_constraint("jobupdatelog_job_id_fkey", "jobupdatelog", type_="foreignkey")
    op.create_foreign_key(
        "jobupdatelog_job_id_fkey", "jobupdatelog", "job", ["job_id"], ["id"]
    )

    op.drop_constraint("savedjob_job_id_fkey", "savedjob", type_="foreignkey")
    op.create_foreign_key("savedjob_job_id_fkey", "savedjob", "job", ["job_id"], ["id"])

    op.drop_constraint("leadpurchase_job_id_fkey", "leadpurchase", type_="foreignkey")
    op.create_foreign_key(
        "leadpurchase_job_id_fkey", "leadpurchase", "job", ["job_id"], ["id"]
    )
