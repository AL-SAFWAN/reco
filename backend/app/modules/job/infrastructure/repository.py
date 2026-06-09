import uuid

from sqlalchemy import and_
from sqlmodel import Session, func, select

from app.modules.job.domain.models import Job, JobUpdate
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
) -> list[Job]:
    stmt = select(Job)
    if user_id is not None:
        stmt = stmt.where(Job.created_by_id == user_id)
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
