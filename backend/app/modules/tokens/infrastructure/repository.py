import uuid

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.modules.tokens.domain.models import (
    TokenPackage,
    TokenTransaction,
    TransactionCategory,
    TransactionDirection,
)
from app.modules.user.domain.models import User

# ── Packages ────────────────────────────────────────────────────────────────


async def get_all_packages(*, session: AsyncSession) -> list[TokenPackage]:
    result = await session.exec(
        select(TokenPackage).where(TokenPackage.is_active == True)  # noqa: E712
    )
    return list(result.all())


async def get_package(
    *, session: AsyncSession, package_id: uuid.UUID
) -> TokenPackage | None:
    return await session.get(TokenPackage, package_id)


# ── Balance ─────────────────────────────────────────────────────────────────


async def get_balance(*, session: AsyncSession, user_id: uuid.UUID) -> int:
    user = await session.get(User, user_id)
    return user.token_balance if user else 0


# ── Transactions ─────────────────────────────────────────────────────────────


async def get_transactions(
    *,
    session: AsyncSession,
    user_id: uuid.UUID,
    skip: int = 0,
    limit: int = 50,
) -> list[TokenTransaction]:
    stmt = (
        select(TokenTransaction)
        .where(TokenTransaction.user_id == user_id)
        .order_by(TokenTransaction.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await session.exec(stmt)
    return list(result.all())


async def has_transaction_with_reference(
    *, session: AsyncSession, reference_id: str, category: TransactionCategory
) -> bool:
    stmt = select(TokenTransaction).where(
        TokenTransaction.reference_id == reference_id,
        TokenTransaction.category == category,
    )
    result = await session.exec(stmt)
    return result.first() is not None


# ── Credit (token purchase) ──────────────────────────────────────────────────


async def credit_tokens(
    *,
    session: AsyncSession,
    user_id: uuid.UUID,
    amount: int,
    reference_id: str,
    description: str | None = None,
) -> tuple[TokenTransaction, int]:
    """
    Idempotent token credit. Locks the user row, increases balance, records transaction.
    Returns (transaction, new_balance). Caller must manage the session transaction.
    """
    if await has_transaction_with_reference(
        session=session,
        reference_id=reference_id,
        category=TransactionCategory.purchase,
    ):
        user = await session.get(User, user_id)
        existing_result = await session.exec(
            select(TokenTransaction).where(
                TokenTransaction.reference_id == reference_id,
                TokenTransaction.category == TransactionCategory.purchase,
            )
        )
        existing = existing_result.first()
        return existing, user.token_balance

    # Lock user row to prevent race conditions
    stmt = select(User).where(User.id == user_id).with_for_update()
    result = await session.exec(stmt)
    user = result.one()

    user.token_balance += amount
    session.add(user)

    tx = TokenTransaction(
        user_id=user_id,
        amount=amount,
        direction=TransactionDirection.credit,
        category=TransactionCategory.purchase,
        reference_id=reference_id,
        description=description or f"Token pack purchase (+{amount} tokens)",
    )
    session.add(tx)
    await session.flush()

    return tx, user.token_balance


# ── Debit (lead purchase) ────────────────────────────────────────────────────


async def debit_tokens(
    *,
    session: AsyncSession,
    user_id: uuid.UUID,
    amount: int,
    reference_id: str,
    description: str | None = None,
) -> tuple[TokenTransaction, int]:
    """
    Locks the user row and deducts tokens. Raises ValueError if balance is insufficient.
    Returns (transaction, new_balance). Caller must manage the session transaction.
    """
    stmt = select(User).where(User.id == user_id).with_for_update()
    result = await session.exec(stmt)
    user = result.one()

    if user.token_balance < amount:
        raise ValueError("Insufficient tokens")

    user.token_balance -= amount
    session.add(user)

    tx = TokenTransaction(
        user_id=user_id,
        amount=amount,
        direction=TransactionDirection.debit,
        category=TransactionCategory.lead_purchase,
        reference_id=reference_id,
        description=description,
    )
    session.add(tx)
    await session.flush()

    return tx, user.token_balance
