import json
import uuid

from sqlalchemy import and_
from sqlalchemy.orm import selectinload
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.modules.job.domain.models import Job, JobUpdate, JobUpdateLog
from app.modules.marketplace.domain.models import LeadPurchase


async def create_job(
    *,
    session: AsyncSession,
    data: Job,
) -> Job:
    db_job = Job(**data.model_dump())
    session.add(db_job)
    await session.commit()
    await session.refresh(db_job)
    return db_job


async def get_jobs(
    *,
    session: AsyncSession,
    user_id: uuid.UUID | None = None,
    skip: int = 0,
    limit: int = 200,
    exclude_user_id: uuid.UUID | None = None,
) -> list[Job]:
    stmt = select(Job).options(selectinload(Job.lead_purchases))
    if user_id is not None:
        stmt = stmt.where(Job.created_by_id == user_id)
    if exclude_user_id is not None:
        stmt = stmt.where(Job.created_by_id != exclude_user_id)
    stmt = stmt.order_by(Job.created_at.desc()).offset(skip).limit(limit)
    result = await session.exec(stmt)
    return list(result.all())


async def get_job(
    *,
    session: AsyncSession,
    user_id: uuid.UUID | None = None,
    exclude_user_id: uuid.UUID | None = None,
    job_id: uuid.UUID,
) -> Job | None:
    stmt = select(Job).options(selectinload(Job.lead_purchases)).where(Job.id == job_id)
    if user_id is not None:
        stmt = stmt.where(Job.created_by_id == user_id)
    if exclude_user_id is not None:
        stmt = stmt.where(Job.created_by_id != exclude_user_id)
    result = await session.exec(stmt)
    return result.first()


async def update_job(*, session: AsyncSession, db_job: Job, updates: JobUpdate) -> Job:
    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_job, field, value)
    session.add(db_job)
    await session.commit()
    await session.refresh(db_job)
    return db_job


async def delete_job(*, session: AsyncSession, db_job: Job) -> None:
    await session.delete(db_job)
    await session.commit()


# ── Public (token-authenticated) helpers ─────────────────────────


async def get_job_public(*, session: AsyncSession, job_id: uuid.UUID) -> Job | None:
    """Fetch a job with purchases eagerly loaded — used for customer edit-link and notifications."""
    stmt = select(Job).where(Job.id == job_id).options(selectinload(Job.lead_purchases))
    result = await session.exec(stmt)
    return result.first()


# ── Changelog helpers ─────────────────────────────────────────────


async def create_update_log(
    *,
    session: AsyncSession,
    job_id: uuid.UUID,
    changed_by: str,
    old_values: dict,
    new_values: dict,
) -> JobUpdateLog:
    """Record which fields changed, storing old and new values."""
    changes = {
        field: {"old": old_values.get(field), "new": new_values[field]}
        for field in new_values
        if new_values[field] != old_values.get(field)
    }
    log = JobUpdateLog(
        job_id=job_id,
        changed_by=changed_by,
        changes=json.dumps(changes),
    )
    session.add(log)
    await session.commit()
    await session.refresh(log)
    return log


async def get_update_logs(
    *, session: AsyncSession, job_id: uuid.UUID
) -> list[JobUpdateLog]:
    stmt = (
        select(JobUpdateLog)
        .where(JobUpdateLog.job_id == job_id)
        .order_by(JobUpdateLog.changed_at.desc())
    )
    result = await session.exec(stmt)
    return list(result.all())


async def is_lead_purchaser(
    *, session: AsyncSession, job_id: uuid.UUID, user_id: uuid.UUID
) -> bool:
    stmt = select(LeadPurchase).where(
        and_(LeadPurchase.job_id == job_id, LeadPurchase.buyer_id == user_id)
    )
    result = await session.exec(stmt)
    return result.first() is not None
