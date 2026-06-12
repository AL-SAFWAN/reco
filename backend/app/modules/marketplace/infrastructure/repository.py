import uuid

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.modules.marketplace.domain.models import LeadPurchase, SavedJob


async def create_lead(
    *,
    session: AsyncSession,
    data: LeadPurchase,
) -> LeadPurchase:
    db_lead = LeadPurchase(**data.model_dump())
    session.add(db_lead)
    await session.commit()
    await session.refresh(db_lead)
    return db_lead


async def get_leads(
    *,
    session: AsyncSession,
    job_id: uuid.UUID | None = None,
    user_id: uuid.UUID | None = None,
    skip: int = 0,
    limit: int = 200,
) -> list[LeadPurchase]:
    stmt = select(LeadPurchase)
    if job_id:
        stmt = stmt.where(LeadPurchase.job_id == job_id)
    if user_id:
        stmt = stmt.where(LeadPurchase.buyer_id == user_id)
    stmt = stmt.offset(skip).limit(limit)
    result = await session.exec(stmt)
    return list(result.all())


# ── Saved Jobs ────────────────────────────────────────────────────


async def save_job(
    *, session: AsyncSession, job_id: uuid.UUID, user_id: uuid.UUID
) -> SavedJob:
    db_saved = SavedJob(job_id=job_id, user_id=user_id)
    session.add(db_saved)
    await session.commit()
    await session.refresh(db_saved)
    return db_saved


async def unsave_job(
    *, session: AsyncSession, job_id: uuid.UUID, user_id: uuid.UUID
) -> bool:
    stmt = select(SavedJob).where(SavedJob.job_id == job_id, SavedJob.user_id == user_id)
    result = await session.exec(stmt)
    db_saved = result.first()
    if not db_saved:
        return False
    await session.delete(db_saved)
    await session.commit()
    return True


async def get_saved_jobs(
    *,
    session: AsyncSession,
    user_id: uuid.UUID,
    skip: int = 0,
    limit: int = 200,
) -> list[SavedJob]:
    stmt = (
        select(SavedJob)
        .where(SavedJob.user_id == user_id)
        .order_by(SavedJob.saved_at.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await session.exec(stmt)
    return list(result.all())


async def is_job_saved(
    *, session: AsyncSession, job_id: uuid.UUID, user_id: uuid.UUID
) -> bool:
    stmt = select(SavedJob).where(SavedJob.job_id == job_id, SavedJob.user_id == user_id)
    result = await session.exec(stmt)
    return result.first() is not None
