import json
import uuid
from typing import Any, AsyncIterator

import psycopg
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.core.config import settings
from app.core.db import async_engine
from app.modules.deps import CurrentUser, CurrentUserFromTokenParam, SessionDep
from app.modules.notifications.domain.models import Notification, NotificationPublic
from app.modules.notifications.infrastructure import repository

router = APIRouter()


def _channel(user_id: uuid.UUID) -> str:
    return f"user_{user_id.hex}"


def _to_public(n: Notification, o: bool) -> dict:
    return NotificationPublic(
        id=n.id,
        type=n.type,
        job_id=n.job_id,
        payload=json.loads(n.payload),
        read=n.read,
        created_at=n.created_at,
        is_owner=o if o is not None else None,
    ).model_dump(mode="json")


def _raw_dsn() -> str:
    """Convert SQLAlchemy URL to a plain psycopg DSN."""
    return (
        str(settings.SQLALCHEMY_DATABASE_URI)
        .replace("postgresql+psycopg_async", "postgresql")
        .replace("postgresql+psycopg", "postgresql")
    )


# ── REST endpoints ────────────────────────────────────────────────


@router.get("/", response_model=list[NotificationPublic])
async def list_notifications(session: SessionDep, current_user: CurrentUser) -> Any:
    notifs = await repository.get_notifications(session=session, user_id=current_user.id)
    return [_to_public(n, o) for n, o in notifs]


@router.patch("/read", status_code=204)
async def mark_read(session: SessionDep, current_user: CurrentUser) -> None:
    await repository.mark_all_read(session=session, user_id=current_user.id)


# ── SSE stream ────────────────────────────────────────────────────


@router.get("/stream")
async def notification_stream(
    current_user: CurrentUserFromTokenParam,
) -> StreamingResponse:
    """
    SSE endpoint.  On connect:
      1. Immediately flushes all stored notifications (online + offline catch-up).
      2. Listens on user-specific Postgres channel for real-time pushes.
      3. Sends `: keepalive` comments every ~25 s to prevent proxy timeouts.
    """
    user_id = current_user.id
    channel = _channel(user_id)

    async def event_stream() -> AsyncIterator[str]:
        # ── Initial flush (offline catch-up) ──────────────────────
        from sqlmodel.ext.asyncio.session import AsyncSession

        async with AsyncSession(async_engine, expire_on_commit=False) as session:
            notifs = await repository.get_notifications(session=session, user_id=user_id)

        if notifs:
            yield f"data: {json.dumps([_to_public(n,o) for n,o in notifs])}\n\n"

        # ── Live LISTEN loop ──────────────────────────────────────
        dsn = _raw_dsn()
        async with await psycopg.AsyncConnection.connect(dsn, autocommit=True) as conn:
            await conn.execute(f"LISTEN {channel}")
            while True:
                # timeout=25 s → restart loop to send keepalive so proxies
                # don't close the connection
                async for notify in conn.notifies(timeout=25.0):
                    try:
                        data = json.loads(notify.payload)
                        yield f"data: {json.dumps([data])}\n\n"
                    except (json.JSONDecodeError, Exception):
                        pass
                # Keepalive comment (SSE spec: lines starting with ":" are ignored by client)
                yield ": keepalive\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )
