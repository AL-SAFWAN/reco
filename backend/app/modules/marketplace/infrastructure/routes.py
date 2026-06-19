import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, HTTPException, Response
from sqlalchemy.exc import IntegrityError
from sqlmodel import select

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
from app.modules.notifications.domain.models import NotificationType
from app.modules.notifications.infrastructure.repository import (
    create_notification_and_notify,
)

router = APIRouter()


@router.get(
    "/",
)
async def list_jobs(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 200
) -> Any:
    jobs = await job_repository.get_jobs(
        session=session, skip=skip, limit=limit, exclude_user_id=current_user.id
    )
    result = []
    for job in jobs:
        purchased = any(p.buyer_id == current_user.id for p in job.lead_purchases)
        if purchased and job.lead_status == "closed":
            result.append(
                JobMarketplaceFull.model_validate(job, update={"purchased": purchased})
            )
        else:
            result.append(
                JobMarketplacePartial.model_validate(
                    job, update={"purchased": purchased}
                )
            )

    return result


@router.get(
    "/leads",
    response_model=list[LeadPurchasePublic],
)
async def list_leads(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 200
) -> Any:
    return await repository.get_leads(
        session=session, user_id=current_user.id, skip=skip, limit=limit
    )


@router.post(
    "/leads/{job_id}/purchase",
    response_model=LeadPurchasePublic,
)
async def create_lead(
    *, session: SessionDep, job_id: uuid.UUID, current_user: CurrentUser
) -> Any:
    job = await job_repository.get_job_public(session=session, job_id=job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    try:
        # Debit tokens first (locks user row — race-condition safe)
        tx, new_balance = await token_repository.debit_tokens(
            session=session,
            user_id=current_user.id,
            amount=job.lead_price,
            reference_id=str(job_id),
            description=f"Lead purchase · {job.service_type}",
        )
    except ValueError:
        raise HTTPException(status_code=402, detail="Insufficient tokens")

    # Create the lead purchase (flush only — commit at end)
    new_lead = LeadPurchase(
        job_id=job_id,
        buyer_id=current_user.id,
        tokens_spent=job.lead_price,
        transaction_id=tx.id,
    )
    session.add(new_lead)
    try:
        await session.flush()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=409, detail="You already own this lead")

    # Reload all leads to check close threshold
    leads_result = await session.exec(
        select(LeadPurchase).where(LeadPurchase.job_id == job_id)
    )
    all_leads = list(leads_result.all())

    job_closed = len(all_leads) >= job.max_buyers

    if job_closed:
        job.lead_status = "closed"
        job.closed_at = new_lead.purchased_at or datetime.now(timezone.utc)
        session.add(job)

    # ── Notifications ─────────────────────────────────────────────

    # Notify the job poster: someone purchased their lead
    await create_notification_and_notify(
        session=session,
        user_id=job.created_by_id,
        notification_type=NotificationType.lead_purchased,
        job_id=job_id,
        payload={
            "service_type": job.service_type,
            "buyer_count": len(all_leads),
            "is_closed": job_closed,
        },
    )

    # If closed: notify every buyer (including the current one) that full info is now visible
    if job_closed:
        for purchase in all_leads:
            await create_notification_and_notify(
                session=session,
                user_id=purchase.buyer_id,
                notification_type=NotificationType.lead_closed,
                job_id=job_id,
                payload={"service_type": job.service_type},
            )

    await session.commit()
    await session.refresh(new_lead)
    return new_lead


# ── Saved Jobs ────────────────────────────────────────────────────


@router.get(
    "/saved",
    response_model=list[SavedJobPublic],
)
async def list_saved_jobs(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 200
) -> Any:
    return await repository.get_saved_jobs(
        session=session, user_id=current_user.id, skip=skip, limit=limit
    )


@router.post(
    "/saved/{job_id}",
    response_model=SavedJobPublic,
    status_code=201,
)
async def save_job(
    *, session: SessionDep, job_id: uuid.UUID, current_user: CurrentUser
) -> Any:
    if await repository.is_job_saved(
        session=session, job_id=job_id, user_id=current_user.id
    ):
        raise HTTPException(status_code=400, detail="Job already saved")
    job = await job_repository.get_job(session=session, job_id=job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return await repository.save_job(
        session=session, job_id=job_id, user_id=current_user.id
    )


@router.delete(
    "/saved/{job_id}",
    status_code=204,
)
async def unsave_job(
    *, session: SessionDep, job_id: uuid.UUID, current_user: CurrentUser
) -> Response:
    removed = await repository.unsave_job(
        session=session, job_id=job_id, user_id=current_user.id
    )
    if not removed:
        raise HTTPException(status_code=404, detail="Saved job not found")
    return Response(status_code=204)


@router.get("/{job_id}")
async def get_job(
    session: SessionDep, current_user: CurrentUser, job_id: uuid.UUID
) -> Any:
    job = await job_repository.get_job(
        session=session, job_id=job_id, exclude_user_id=current_user.id
    )
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    purchased = any(p.buyer_id == current_user.id for p in job.lead_purchases)
    if purchased and job.lead_status == "closed":
        return JobMarketplaceFull.model_validate(job, update={"purchased": purchased})
    else:
        return JobMarketplacePartial.model_validate(job, update={"purchased": purchased})
