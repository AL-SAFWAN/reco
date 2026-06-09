"""add saved jobs

Revision ID: 3c1e8f2a7b9d
Revises: 8fa98549924f
Create Date: 2026-06-09 00:00:00.000000

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "3c1e8f2a7b9d"
down_revision = "8fa98549924f"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "savedjob",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("job_id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column(
            "saved_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(["job_id"], ["job.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("job_id", "user_id", name="uq_saved_job_user"),
    )
    op.create_index(op.f("ix_savedjob_job_id"), "savedjob", ["job_id"], unique=False)
    op.create_index(op.f("ix_savedjob_user_id"), "savedjob", ["user_id"], unique=False)


def downgrade():
    op.drop_index(op.f("ix_savedjob_user_id"), table_name="savedjob")
    op.drop_index(op.f("ix_savedjob_job_id"), table_name="savedjob")
    op.drop_table("savedjob")
