import uuid
from datetime import datetime

import sqlalchemy as sa
from sqlmodel import Field, SQLModel, Relationship
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.modules.job.domain.models import Job


class LeadPurchase(SQLModel, table=True):
    __table_args__ = (sa.UniqueConstraint("job_id", "buyer_id", name="uq_job_buyer"),)
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    job_id: uuid.UUID = Field(
        sa_column=sa.Column(
            sa.Uuid(),
            sa.ForeignKey("job.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        )
    )
    buyer_id: uuid.UUID = Field(foreign_key="user.id", nullable=False)
    purchased_at: datetime = Field(
        sa_column=sa.Column(sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    tokens_spent: int | None = Field(default=None, nullable=True)
    transaction_id: uuid.UUID | None = Field(
        default=None,
        foreign_key="tokentransaction.id",
        nullable=True,
    )
    job: "Job" = Relationship(back_populates="lead_purchases")


class LeadPurchasePublic(SQLModel):
    job_id: uuid.UUID
    purchased_at: datetime


class SavedJob(SQLModel, table=True):
    __tablename__ = "savedjob"
    __table_args__ = (
        sa.UniqueConstraint("job_id", "user_id", name="uq_saved_job_user"),
    )
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    job_id: uuid.UUID = Field(
        sa_column=sa.Column(
            sa.Uuid(),
            sa.ForeignKey("job.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        )
    )
    user_id: uuid.UUID = Field(foreign_key="user.id", nullable=False, index=True)
    saved_at: datetime = Field(
        sa_column=sa.Column(sa.DateTime(timezone=True), server_default=sa.func.now())
    )


class SavedJobPublic(SQLModel):
    job_id: uuid.UUID
    saved_at: datetime
