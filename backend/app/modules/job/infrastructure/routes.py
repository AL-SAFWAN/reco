import uuid
from typing import Any

from fastapi import APIRouter, HTTPException, Response

from app.modules.deps import (
    CurrentUser,
    SessionDep,
)
from app.modules.email.domain.service import (
    generate_job_edit_email,
    generate_job_edit_token,
    send_email,
    verify_job_edit_token,
)
from app.modules.job.infrastructure import repository
from app.modules.job.domain.models import (
    Job,
    JobCreate,
    JobCustomerUpdate,
    JobPublic,
    JobUpdate,
    JobUpdateLogPublic,
    LeadStatus,
)
from app.modules.notifications.domain.models import NotificationType
from app.modules.notifications.infrastructure.repository import (
    create_notification_and_notify,
)

router = APIRouter()


# ── Helpers ───────────────────────────────────────────────────────


def _send_customer_edit_link(job: Job) -> None:
    """Fire-and-forget: generate a token and email the customer."""
    if not job.customer_email:
        return
    token = generate_job_edit_token(str(job.id))
    email_data = generate_job_edit_email(
        customer_name=job.customer_name or "Customer",
        token=token,
    )
    send_email(
        email_to=str(job.customer_email),
        subject=email_data.subject,
        html_content=email_data.html_content,
    )


# ── Standard CRUD ─────────────────────────────────────────────────


@router.get(
    "/",
    response_model=list[Job],
)
async def list_jobs(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 200
) -> Any:
    return await repository.get_jobs(
        session=session, user_id=current_user.id, skip=skip, limit=limit
    )


@router.post(
    "/",
    response_model=JobPublic,
)
async def create_job(
    *, session: SessionDep, body: JobCreate, current_user: CurrentUser
) -> Any:
    job = await repository.create_job(
        session=session, data=Job(**body.model_dump(), created_by_id=current_user.id)
    )
    if job.send_email_notification and job.customer_email:
        from app.core.config import settings

        if settings.emails_enabled:
            _send_customer_edit_link(job)
    return job


# ── Customer edit endpoints (no auth — token only) ────────────────
# IMPORTANT: these must be declared before /{job_id} routes so that
# the literal "customer" segment is matched before UUID validation.


@router.get("/customer/{token}", response_model=JobPublic)
async def get_job_for_customer(*, token: str, session: SessionDep) -> Any:
    """Return editable job fields using a signed edit-link token."""
    job_id_str = verify_job_edit_token(token)
    if not job_id_str:
        raise HTTPException(status_code=401, detail="Invalid or expired link")
    try:
        job_id = uuid.UUID(job_id_str)
    except ValueError:
        raise HTTPException(status_code=400, detail="Malformed token")
    job = await repository.get_job_public(session=session, job_id=job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.patch("/customer/{token}", response_model=JobPublic)
async def update_job_as_customer(
    *,
    token: str,
    body: JobCustomerUpdate,
    session: SessionDep,
) -> Any:
    """Customer updates their job fields; changes are logged and buyers/poster are notified."""
    job_id_str = verify_job_edit_token(token)
    if not job_id_str:
        raise HTTPException(status_code=401, detail="Invalid or expired link")
    try:
        job_id = uuid.UUID(job_id_str)
    except ValueError:
        raise HTTPException(status_code=400, detail="Malformed token")

    job = await repository.get_job_public(session=session, job_id=job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    update_data = body.model_dump(exclude_unset=True)
    if not update_data:
        return job

    old_snapshot = {k: getattr(job, k) for k in update_data}

    for field, value in update_data.items():
        setattr(job, field, value)
    session.add(job)

    # Log the change
    from app.modules.job.domain.models import JobUpdateLog
    import json as _json

    changes = {
        field: {"old": old_snapshot.get(field), "new": update_data[field]}
        for field in update_data
        if update_data[field] != old_snapshot.get(field)
    }
    log = JobUpdateLog(
        job_id=job_id,
        changed_by="customer",
        changes=_json.dumps(changes),
    )
    session.add(log)

    # Notify job poster
    notif_payload = {
        "service_type": job.service_type,
        "fields_changed": list(update_data.keys()),
    }
    await create_notification_and_notify(
        session=session,
        user_id=job.created_by_id,
        notification_type=NotificationType.customer_updated,
        job_id=job_id,
        payload=notif_payload,
    )

    # Notify all buyers if closed
    if job.lead_status == LeadStatus.closed:
        for purchase in job.lead_purchases:
            if purchase.buyer_id != job.created_by_id:
                await create_notification_and_notify(
                    session=session,
                    user_id=purchase.buyer_id,
                    notification_type=NotificationType.customer_updated,
                    job_id=job_id,
                    payload=notif_payload,
                )

    await session.commit()
    await session.refresh(job)
    return job


@router.get("/customer/{token}/changelog", response_model=list[JobUpdateLogPublic])
async def get_job_changelog_for_customer(*, token: str, session: SessionDep) -> Any:
    """Return the update history using the customer edit-link token (no auth required)."""
    job_id_str = verify_job_edit_token(token)
    if not job_id_str:
        raise HTTPException(status_code=401, detail="Invalid or expired link")
    try:
        job_id = uuid.UUID(job_id_str)
    except ValueError:
        raise HTTPException(status_code=400, detail="Malformed token")

    logs = await repository.get_update_logs(session=session, job_id=job_id)
    return [JobUpdateLogPublic.from_orm_log(log) for log in logs]


# ── UUID-keyed routes ─────────────────────────────────────────────


@router.get("/{job_id}", response_model=JobPublic)
@router.get("/{job_id}", response_model=JobPublic)
async def read_job(
    job_id: uuid.UUID, session: SessionDep, current_user: CurrentUser
) -> Any:
    job = await repository.get_job(
        session=session, user_id=current_user.id, job_id=job_id
    )
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.patch("/{job_id}", response_model=JobPublic)
async def update_job(
    *,
    job_id: uuid.UUID,
    body: JobUpdate,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    db_job = await repository.get_job(
        session=session, user_id=current_user.id, job_id=job_id
    )
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")

    if (
        db_job.lead_status == LeadStatus.closed
        and body.lead_status is not None
        and body.lead_status != LeadStatus.closed
    ):
        raise HTTPException(
            status_code=422,
            detail="A closed job cannot be re-opened.",
        )

    return await repository.update_job(session=session, db_job=db_job, updates=body)


@router.delete("/{job_id}", status_code=204)
async def delete_job(
    *,
    job_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
) -> Response:
    db_job = await repository.get_job(
        session=session, user_id=current_user.id, job_id=job_id
    )
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")

    await repository.delete_job(session=session, db_job=db_job)
    return Response(status_code=204)


# ── Resend customer edit link ─────────────────────────────────────


@router.post("/{job_id}/send-edit-link", status_code=204)
async def send_edit_link(
    *,
    job_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
) -> Response:
    """(Re)send a tokenised edit link to the customer's email."""
    job = await repository.get_job(
        session=session, user_id=current_user.id, job_id=job_id
    )
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if not job.customer_email:
        raise HTTPException(status_code=422, detail="Job has no customer email")
    _send_customer_edit_link(job)
    return Response(status_code=204)


# ── Changelog ────────────────────────────────────────────────────


@router.get("/{job_id}/changelog", response_model=list[JobUpdateLogPublic] | None)
async def get_job_changelog(
    *,
    job_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """Return the update history — accessible to the job owner or any lead purchaser when closed."""
    job = await repository.get_job(session=session, job_id=job_id)
    is_owner = job and job.created_by_id == current_user.id
    is_purchaser = await repository.is_lead_purchaser(
        session=session, job_id=job_id, user_id=current_user.id
    )
    if not is_owner and not is_purchaser:
        raise HTTPException(status_code=403, detail="Access denied")
    if is_purchaser and job.lead_status:
        if job.lead_status != LeadStatus.closed:
            return None

    logs = await repository.get_update_logs(session=session, job_id=job_id)
    return [JobUpdateLogPublic.from_orm_log(log) for log in logs]
