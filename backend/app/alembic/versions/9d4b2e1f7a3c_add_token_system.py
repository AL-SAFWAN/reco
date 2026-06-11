"""add token system

Revision ID: 9d4b2e1f7a3c
Revises: 3c1e8f2a7b9d
Create Date: 2026-06-10 00:00:00.000000

"""

from alembic import op
import sqlalchemy as sa

revision = "9d4b2e1f7a3c"
down_revision = "3c1e8f2a7b9d"
branch_labels = None
depends_on = None


def upgrade():
    # ── user: add token_balance + check constraint ───────────────────────────
    op.add_column(
        "user",
        sa.Column(
            "token_balance",
            sa.Integer(),
            nullable=False,
            server_default="0",
        ),
    )
    op.create_check_constraint(
        "ck_user_token_balance_non_negative",
        "user",
        "token_balance >= 0",
    )

    # ── tokenpackage table ────────────────────────────────────────────────────
    op.create_table(
        "tokenpackage",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("token_count", sa.Integer(), nullable=False),
        sa.Column("price", sa.Float(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.PrimaryKeyConstraint("id"),
    )

    # ── tokentransaction table ────────────────────────────────────────────────
    op.create_table(
        "tokentransaction",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("amount", sa.Integer(), nullable=False),
        sa.Column("direction", sa.String(), nullable=False),
        sa.Column("category", sa.String(), nullable=False),
        sa.Column("reference_id", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_tokentransaction_user_id"),
        "tokentransaction",
        ["user_id"],
        unique=False,
    )

    # ── leadpurchase: add tokens_spent + transaction_id ───────────────────────
    op.add_column(
        "leadpurchase",
        sa.Column("tokens_spent", sa.Integer(), nullable=True),
    )
    op.add_column(
        "leadpurchase",
        sa.Column("transaction_id", sa.Uuid(), nullable=True),
    )
    op.create_foreign_key(
        "fk_leadpurchase_transaction_id",
        "leadpurchase",
        "tokentransaction",
        ["transaction_id"],
        ["id"],
    )


def downgrade():
    op.drop_constraint(
        "fk_leadpurchase_transaction_id", "leadpurchase", type_="foreignkey"
    )
    op.drop_column("leadpurchase", "transaction_id")
    op.drop_column("leadpurchase", "tokens_spent")
    op.drop_index(op.f("ix_tokentransaction_user_id"), table_name="tokentransaction")
    op.drop_table("tokentransaction")
    op.drop_table("tokenpackage")
    op.drop_constraint("ck_user_token_balance_non_negative", "user", type_="check")
    op.drop_column("user", "token_balance")
