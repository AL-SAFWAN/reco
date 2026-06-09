import uuid

from sqlmodel import Session, select

from app.modules.marketplace.domain.models import LeadPurchase, SavedJob


def create_lead(
    *,
    session: Session,
    data: LeadPurchase,
) -> LeadPurchase:
    db_lead = LeadPurchase(**data.model_dump())
    session.add(db_lead)
    session.commit()
    session.refresh(db_lead)
    return db_lead


def get_leads(
    *,
    session: Session,
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
    return list(session.exec(stmt).all())


# ── Saved Jobs ────────────────────────────────────────────────────


def save_job(*, session: Session, job_id: uuid.UUID, user_id: uuid.UUID) -> SavedJob:
    db_saved = SavedJob(job_id=job_id, user_id=user_id)
    session.add(db_saved)
    session.commit()
    session.refresh(db_saved)
    return db_saved


def unsave_job(*, session: Session, job_id: uuid.UUID, user_id: uuid.UUID) -> bool:
    stmt = select(SavedJob).where(SavedJob.job_id == job_id, SavedJob.user_id == user_id)
    db_saved = session.exec(stmt).first()
    if not db_saved:
        return False
    session.delete(db_saved)
    session.commit()
    return True


def get_saved_jobs(
    *,
    session: Session,
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
    return list(session.exec(stmt).all())


def is_job_saved(*, session: Session, job_id: uuid.UUID, user_id: uuid.UUID) -> bool:
    stmt = select(SavedJob).where(SavedJob.job_id == job_id, SavedJob.user_id == user_id)
    return session.exec(stmt).first() is not None
