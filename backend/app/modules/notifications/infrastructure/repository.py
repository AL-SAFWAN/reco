import json
import uuid

from sqlalchemy import text, update
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession


from app.modules.notifications.domain.models import Notification, NotificationType
from app.modules.job.domain.models import Job


def _channel(user_id: uuid.UUID) -> str:
    """Postgres LISTEN channel name for a given user (valid unquoted identifier)."""
    return f"user_{user_id.hex}"


async def create_notification_and_notify(
    *,
    session: AsyncSession,
    user_id: uuid.UUID,
    notification_type: NotificationType,
    job_id: uuid.UUID,
    payload: dict,
) -> Notification:
    """
    Add a Notification row and queue a pg_notify within the current transaction.
    Caller must call session.commit() — both fire atomically on commit.
    """
    notif = Notification(
        user_id=user_id,
        type=notification_type,
        job_id=job_id,
        payload=json.dumps(payload),
    )
    session.add(notif)

    # pg_notify fires when the outer transaction commits
    channel = _channel(user_id)
    pg_payload = {
        "id": str(notif.id),
        "type": notification_type,
        "job_id": str(job_id),
        "payload": payload,
        "read": False,
    }
    await session.execute(
        text("SELECT pg_notify(:channel, :payload)"),
        {"channel": channel, "payload": json.dumps(pg_payload)},
    )
    return notif


async def get_notifications(
    *, session: AsyncSession, user_id: uuid.UUID, limit: int = 50
) -> list[Notification]:
    stmt = (
        select(Notification, (Job.created_by_id == user_id).label("is_owner"))
        .join(Job, Notification.job_id == Job.id)
        .where(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())  # type: ignore[arg-type]
        .limit(limit)
    )
    result = await session.exec(stmt)
    return list(result.all())


async def mark_all_read(*, session: AsyncSession, user_id: uuid.UUID) -> None:
    await session.execute(
        update(Notification)  # type: ignore[arg-type]
        .where(Notification.user_id == user_id)  # type: ignore[arg-type]
        .where(Notification.read == False)  # noqa: E712
        .values(read=True)
    )
    await session.commit()
