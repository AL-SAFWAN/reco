import uuid

from sqlmodel import Session, select

from app.modules.job.domain.models import Job, JobUpdate


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


def get_jobs(*, session: Session, skip: int = 0, limit: int = 200) -> list[Job]:
    stmt = (
        select(Job)
        .order_by(Job.created_at.desc())  # type: ignore[union-attr]
        .offset(skip)
        .limit(limit)
    )
    return list(session.exec(stmt).all())


def get_job(*, session: Session, job_id: uuid.UUID) -> Job | None:
    return session.get(Job, job_id)


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
