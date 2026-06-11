import uuid
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING

import sqlalchemy as sa
from sqlmodel import Field, Relationship, SQLModel


class TransactionDirection(str, Enum):
    credit = "credit"
    debit = "debit"


class TransactionCategory(str, Enum):
    purchase = "purchase"  # tokens credited via real-money pack purchase
    lead_purchase = "lead_purchase"  # tokens spent on a lead


class TokenPackage(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(nullable=False)
    token_count: int = Field(nullable=False)
    price: float = Field(nullable=False)  # ex-VAT price in GBP
    description: str | None = None
    is_active: bool = Field(default=True, nullable=False)


class TokenTransaction(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", nullable=False, index=True)
    amount: int = Field(nullable=False)  # always positive
    direction: TransactionDirection = Field(nullable=False)
    category: TransactionCategory = Field(nullable=False)
    reference_id: str = Field(
        nullable=False
    )  # package_id for purchases, job_id for leads
    description: str | None = None
    created_at: datetime | None = Field(
        default=None,
        sa_column=sa.Column(
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )


# ── Public Schemas ──────────────────────────────────────────────────────────


class TokenPackagePublic(SQLModel):
    id: uuid.UUID
    name: str
    token_count: int
    price: float
    description: str | None
    is_active: bool


class TokenTransactionPublic(SQLModel):
    id: uuid.UUID
    amount: int
    direction: TransactionDirection
    category: TransactionCategory
    reference_id: str
    description: str | None
    created_at: datetime


class TokenBalancePublic(SQLModel):
    token_balance: int


class TokenPurchaseResponse(SQLModel):
    token_balance: int
    tokens_added: int
