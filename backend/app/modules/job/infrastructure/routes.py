import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Response

from app.modules.deps import (
    CurrentUser,
    SessionDep,
)
from app.modules.job.infrastructure import repository
from app.modules.job.domain.models import Job, JobCreate, JobPublic, JobUpdate

router = APIRouter()


@router.get(
    "/",
    response_model=list[Job],
)
def list_jobs(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 200
) -> Any:
    print("Listing jobs with skip:", skip, "and limit:", limit)
    return repository.get_jobs(
        session=session, user_id=current_user.id, skip=skip, limit=limit
    )


@router.post(
    "/",
    response_model=JobPublic,
)
def create_job(
    *, session: SessionDep, body: JobCreate, current_user: CurrentUser
) -> Any:
    job = repository.create_job(
        session=session, data=Job(**body.model_dump(), created_by_id=current_user.id)
    )
    return job


@router.get("/{job_id}", response_model=JobPublic)
def read_job(job_id: uuid.UUID, session: SessionDep, current_user: CurrentUser) -> Any:
    job = repository.get_job(session=session, user_id=current_user.id, job_id=job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.patch("/{job_id}", response_model=JobPublic)
def update_job(
    *,
    job_id: uuid.UUID,
    body: JobUpdate,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    db_job = repository.get_job(session=session, user_id=current_user.id, job_id=job_id)
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")

    return repository.update_job(session=session, db_job=db_job, updates=body)


@router.delete("/{job_id}", status_code=204)
def delete_job(
    *,
    job_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
) -> Response:
    db_job = repository.get_job(session=session, user_id=current_user.id, job_id=job_id)
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")

    repository.delete_job(session=session, db_job=db_job)
    return Response(status_code=204)
