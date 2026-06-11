import uuid

from sqlmodel import Session, select

from app.modules.tokens.domain.models import (
    TokenPackage,
    TokenTransaction,
    TransactionCategory,
    TransactionDirection,
)
from app.modules.user.domain.models import User

# ── Packages ────────────────────────────────────────────────────────────────


def get_all_packages(*, session: Session) -> list[TokenPackage]:
    return list(
        session.exec(select(TokenPackage).where(TokenPackage.is_active == True)).all()
    )


def get_package(*, session: Session, package_id: uuid.UUID) -> TokenPackage | None:
    return session.get(TokenPackage, package_id)


# ── Balance ─────────────────────────────────────────────────────────────────


def get_balance(*, session: Session, user_id: uuid.UUID) -> int:
    user = session.get(User, user_id)
    return user.token_balance if user else 0


# ── Transactions ─────────────────────────────────────────────────────────────


def get_transactions(
    *,
    session: Session,
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
    return list(session.exec(stmt).all())


def has_transaction_with_reference(
    *, session: Session, reference_id: str, category: TransactionCategory
) -> bool:
    stmt = select(TokenTransaction).where(
        TokenTransaction.reference_id == reference_id,
        TokenTransaction.category == category,
    )
    return session.exec(stmt).first() is not None


# ── Credit (token purchase) ──────────────────────────────────────────────────


def credit_tokens(
    *,
    session: Session,
    user_id: uuid.UUID,
    amount: int,
    reference_id: str,
    description: str | None = None,
) -> tuple[TokenTransaction, int]:
    """
    Idempotent token credit. Locks the user row, increases balance, records transaction.
    Returns (transaction, new_balance). Caller must manage the session transaction.
    """
    # Idempotency: skip if already credited for this reference
    if has_transaction_with_reference(
        session=session,
        reference_id=reference_id,
        category=TransactionCategory.purchase,
    ):
        user = session.get(User, user_id)
        # return a dummy transaction object instead of None for simplicity
        existing = session.exec(
            select(TokenTransaction).where(
                TokenTransaction.reference_id == reference_id,
                TokenTransaction.category == TransactionCategory.purchase,
            )
        ).first()
        return existing, user.token_balance

    # Lock user row to prevent race conditions
    stmt = select(User).where(User.id == user_id).with_for_update()
    user = session.exec(stmt).one()

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
    session.flush()

    return tx, user.token_balance


# ── Debit (lead purchase) ────────────────────────────────────────────────────


def debit_tokens(
    *,
    session: Session,
    user_id: uuid.UUID,
    amount: int,
    reference_id: str,
    description: str | None = None,
) -> tuple[TokenTransaction, int]:
    """
    Locks the user row and deducts tokens. Raises ValueError if balance is insufficient.
    Returns (transaction, new_balance). Caller must manage the session transaction.
    """
    # Lock user row
    stmt = select(User).where(User.id == user_id).with_for_update()
    user = session.exec(stmt).one()

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
    session.flush()

    return tx, user.token_balance
