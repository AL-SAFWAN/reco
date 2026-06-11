import json
import uuid

from sqlalchemy import and_
from sqlmodel import Session, func, select

from app.modules.job.domain.models import Job, JobUpdate, JobUpdateLog
from app.modules.marketplace.domain.models import LeadPurchase


def create_job(
    *,
    session: Session,
    data: Job,
) -> Job:
    db_job = Job(**data.model_dump())
    session.add(db_job)
    session.commit()
    session.refresh(db_job)
    return db_job


def get_jobs(
    *,
    session: Session,
    user_id: uuid.UUID | None = None,
    skip: int = 0,
    limit: int = 200,
    exclude_user_id: uuid.UUID | None = None,
) -> list[Job]:
    stmt = select(Job)
    if user_id is not None:
        stmt = stmt.where(Job.created_by_id == user_id)
    if exclude_user_id is not None:
        stmt = stmt.where(Job.created_by_id != exclude_user_id)
    stmt = stmt.order_by(Job.created_at.desc()).offset(skip).limit(limit)
    return list(session.exec(stmt).all())


def get_job(
    *, session: Session, user_id: uuid.UUID | None = None, job_id: uuid.UUID
) -> Job | None:
    stmt = select(Job).where(Job.id == job_id)
    if user_id is not None:
        stmt = stmt.where(Job.created_by_id == user_id)
    return session.exec(stmt).first()


def update_job(*, session: Session, db_job: Job, updates: JobUpdate) -> Job:
    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_job, field, value)
    session.add(db_job)
    session.commit()
    session.refresh(db_job)
    return db_job


def delete_job(*, session: Session, db_job: Job) -> None:
    session.delete(db_job)
    session.commit()


# ── Public (token-authenticated) helpers ─────────────────────────


def get_job_public(*, session: Session, job_id: uuid.UUID) -> Job | None:
    """Fetch a job without owner check — used for customer edit-link flow."""
    return session.exec(select(Job).where(Job.id == job_id)).first()


# ── Changelog helpers ─────────────────────────────────────────────


def create_update_log(
    *,
    session: Session,
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
    session.commit()
    session.refresh(log)
    return log


def get_update_logs(*, session: Session, job_id: uuid.UUID) -> list[JobUpdateLog]:
    stmt = (
        select(JobUpdateLog)
        .where(JobUpdateLog.job_id == job_id)
        .order_by(JobUpdateLog.changed_at.desc())
    )
    return list(session.exec(stmt).all())


def is_lead_purchaser(
    *, session: Session, job_id: uuid.UUID, user_id: uuid.UUID
) -> bool:
    stmt = select(LeadPurchase).where(
        and_(LeadPurchase.job_id == job_id, LeadPurchase.buyer_id == user_id)
    )
    return session.exec(stmt).first() is not None
