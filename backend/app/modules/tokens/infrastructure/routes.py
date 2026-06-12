import uuid
from typing import Any

from fastapi import APIRouter, HTTPException

from app.modules.deps import CurrentUser, SessionDep
from app.modules.tokens.domain.models import (
    TokenBalancePublic,
    TokenPackagePublic,
    TokenPurchaseResponse,
    TokenTransactionPublic,
)
from app.modules.tokens.infrastructure import repository

router = APIRouter()


# ── Balance ─────────────────────────────────────────────────────────────────


@router.get("/balance", response_model=TokenBalancePublic)
async def get_token_balance(session: SessionDep, current_user: CurrentUser) -> Any:
    balance = await repository.get_balance(session=session, user_id=current_user.id)
    return TokenBalancePublic(token_balance=balance)


# ── Transactions ─────────────────────────────────────────────────────────────


@router.get("/transactions", response_model=list[TokenTransactionPublic])
async def list_token_transactions(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 50,
) -> Any:
    return await repository.get_transactions(
        session=session, user_id=current_user.id, skip=skip, limit=limit
    )


# ── Packages ─────────────────────────────────────────────────────────────────


@router.get("/packages", response_model=list[TokenPackagePublic])
async def list_packages(session: SessionDep, current_user: CurrentUser) -> Any:
    return await repository.get_all_packages(session=session)


@router.post("/packages/{package_id}/purchase", response_model=TokenPurchaseResponse)
async def purchase_package(
    *,
    package_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    package = await repository.get_package(session=session, package_id=package_id)
    if not package or not package.is_active:
        raise HTTPException(status_code=404, detail="Package not found")

    # Use a dev reference id — replace with Stripe PaymentIntent ID in production
    reference_id = f"dev_{uuid.uuid4()}"

    # Capture before commit — avoids lazy-reload on expired ORM object
    tokens_added = package.token_count

    tx, new_balance = await repository.credit_tokens(
        session=session,
        user_id=current_user.id,
        amount=tokens_added,
        reference_id=reference_id,
        description=f"{package.name} pack — {tokens_added} tokens",
    )
    await session.commit()

    return TokenPurchaseResponse(
        token_balance=new_balance,
        tokens_added=tokens_added,
    )
