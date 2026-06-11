"""tokens

Revision ID: cdac05c5697d
Revises: 9d4b2e1f7a3c
Create Date: 2026-06-10 14:36:38.398889

"""

from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "cdac05c5697d"
down_revision = "9d4b2e1f7a3c"
branch_labels = None
depends_on = None


def upgrade():
    # Create the enum types first, then cast existing VARCHAR values into them
    transactiondirection = sa.Enum("credit", "debit", name="transactiondirection")
    transactioncategory = sa.Enum(
        "purchase", "lead_purchase", name="transactioncategory"
    )

    transactiondirection.create(op.get_bind(), checkfirst=True)
    transactioncategory.create(op.get_bind(), checkfirst=True)

    op.alter_column(
        "tokentransaction",
        "direction",
        existing_type=sa.VARCHAR(),
        type_=transactiondirection,
        postgresql_using="direction::transactiondirection",
        existing_nullable=False,
    )
    op.alter_column(
        "tokentransaction",
        "category",
        existing_type=sa.VARCHAR(),
        type_=transactioncategory,
        postgresql_using="category::transactioncategory",
        existing_nullable=False,
    )
    op.alter_column(
        "tokentransaction",
        "created_at",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        nullable=False,
        existing_server_default=sa.text("now()"),
    )


def downgrade():
    op.alter_column(
        "tokentransaction",
        "created_at",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        nullable=True,
        existing_server_default=sa.text("now()"),
    )
    op.alter_column(
        "tokentransaction",
        "category",
        existing_type=sa.Enum("purchase", "lead_purchase", name="transactioncategory"),
        type_=sa.VARCHAR(),
        existing_nullable=False,
    )
    op.alter_column(
        "tokentransaction",
        "direction",
        existing_type=sa.Enum("credit", "debit", name="transactiondirection"),
        type_=sa.VARCHAR(),
        existing_nullable=False,
    )
    sa.Enum(name="transactioncategory").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="transactiondirection").drop(op.get_bind(), checkfirst=True)
