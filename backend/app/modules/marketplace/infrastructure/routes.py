import uuid
from typing import Any

from fastapi import APIRouter, HTTPException, Response
from sqlalchemy.exc import IntegrityError

from app.modules.deps import (
    CurrentUser,
    SessionDep,
)
from app.modules.marketplace.infrastructure import repository
from app.modules.job.infrastructure import repository as job_repository
from app.modules.marketplace.domain.models import (
    LeadPurchase,
    LeadPurchasePublic,
    SavedJobPublic,
)
from app.modules.job.domain.models import (
    JobMarketplaceRedacted,
    JobMarketplacePartial,
    JobMarketplaceFull,
)
from app.modules.tokens.infrastructure import repository as token_repository

router = APIRouter()


@router.get(
    "/",
    # response_model=list[JobMarketplaceRedacted],
)
def list_jobs(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 200
) -> Any:
    jobs = job_repository.get_jobs(
        session=session, skip=skip, limit=limit, exclude_user_id=current_user.id
    )
    result = []
    for job in jobs:
        purchased = any(p.buyer_id == current_user.id for p in job.lead_purchases)
        if purchased:
            if job.lead_status == "closed":
                result.append(
                    JobMarketplaceFull.model_validate(
                        job, update={"purchased": purchased}
                    )
                )
            else:
                result.append(
                    JobMarketplacePartial.model_validate(
                        job, update={"purchased": purchased}
                    )
                )
        else:
            result.append(
                JobMarketplaceRedacted.model_validate(
                    job, update={"purchased": purchased}
                )
            )
    return result


@router.get(
    "/leads",
    response_model=list[LeadPurchasePublic],
)
def list_leads(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 200
) -> Any:
    return repository.get_leads(
        session=session, user_id=current_user.id, skip=skip, limit=limit
    )


@router.post(
    "/leads/{job_id}/purchase",
    response_model=LeadPurchasePublic,
)
def create_lead(
    *, session: SessionDep, job_id: uuid.UUID, current_user: CurrentUser
) -> Any:
    job = job_repository.get_job(session=session, job_id=job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    try:
        # Debit tokens first (locks user row — race-condition safe)
        tx, new_balance = token_repository.debit_tokens(
            session=session,
            user_id=current_user.id,
            amount=job.lead_price,
            reference_id=str(job_id),
            description=f"Lead purchase · {job.service_type}",
        )
    except ValueError:
        raise HTTPException(status_code=402, detail="Insufficient tokens")

    try:
        new_lead = repository.create_lead(
            session=session,
            data=LeadPurchase(
                job_id=job_id,
                buyer_id=current_user.id,
                tokens_spent=job.lead_price,
                transaction_id=tx.id,
            ),
        )
    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=409, detail="You already own this lead")

    # Check if job should be closed
    leads = repository.get_leads(session=session, job_id=job_id)
    if len(leads) >= job.max_buyers:
        job_repository.update_job(
            session=session,
            db_job=job,
            updates=job_repository.JobUpdate(
                lead_status="closed", closed_at=new_lead.purchased_at
            ),
        )

    return new_lead


# ── Saved Jobs ────────────────────────────────────────────────────


@router.get(
    "/saved",
    response_model=list[SavedJobPublic],
)
def list_saved_jobs(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 200
) -> Any:
    return repository.get_saved_jobs(
        session=session, user_id=current_user.id, skip=skip, limit=limit
    )


@router.post(
    "/saved/{job_id}",
    response_model=SavedJobPublic,
    status_code=201,
)
def save_job(
    *, session: SessionDep, job_id: uuid.UUID, current_user: CurrentUser
) -> Any:
    if repository.is_job_saved(session=session, job_id=job_id, user_id=current_user.id):
        raise HTTPException(status_code=400, detail="Job already saved")
    job = job_repository.get_job(session=session, job_id=job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return repository.save_job(session=session, job_id=job_id, user_id=current_user.id)


@router.delete(
    "/saved/{job_id}",
    status_code=204,
)
def unsave_job(
    *, session: SessionDep, job_id: uuid.UUID, current_user: CurrentUser
) -> Response:
    removed = repository.unsave_job(
        session=session, job_id=job_id, user_id=current_user.id
    )
    if not removed:
        raise HTTPException(status_code=404, detail="Saved job not found")
    return Response(status_code=204)
