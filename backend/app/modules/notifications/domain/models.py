import uuid
from datetime import datetime
from enum import Enum

import sqlalchemy as sa
from sqlmodel import Field, SQLModel


class NotificationType(str, Enum):
    lead_purchased = "lead_purchased"  # poster: someone bought your lead
    lead_closed = "lead_closed"  # buyer: lead is now closed (full info visible)
    customer_updated = "customer_updated"  # poster + buyers: customer updated their form


class Notification(SQLModel, table=True):
    __tablename__ = "notification"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(
        sa_column=sa.Column(
            sa.Uuid(),
            sa.ForeignKey("user.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        )
    )
    type: str = Field(sa_column=sa.Column(sa.String(64), nullable=False))
    job_id: uuid.UUID = Field(
        sa_column=sa.Column(
            sa.Uuid(),
            sa.ForeignKey("job.id", ondelete="CASCADE"),
            nullable=False,
        )
    )
    # JSON-encoded dict — stored as text to avoid dialect-specific JSON quirks
    payload: str = Field(
        sa_column=sa.Column(sa.Text, nullable=False, server_default="{}")
    )
    read: bool = Field(
        default=False,
        sa_column=sa.Column(sa.Boolean, nullable=False, default=False),
    )
    created_at: datetime = Field(
        sa_column=sa.Column(
            sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        )
    )


class NotificationPublic(SQLModel):
    id: uuid.UUID
    type: NotificationType
    job_id: uuid.UUID
    payload: dict
    read: bool
    created_at: datetime
    is_owner: bool  # only included in list endpoint, not SSE stream
