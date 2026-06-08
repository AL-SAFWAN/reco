from typing import Any
from uuid import UUID

import pyotp
from sqlmodel import Session, select

from app.modules.user.domain.models import (
    User,
    UserCreate,
    UserRegister,
    UserUpdate,
    UserUpdateMe,
)


def update_me(*, session: Session, user_in: UserUpdateMe, current_user: User) -> Any:
    user_data = user_in.model_dump(exclude_unset=True)
    current_user.sqlmodel_update(user_data)
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user


def update_me_password(
    *, session: Session, current_user: User, new_password: str
) -> Any:
    from app.modules.auth.domain.service import get_password_hash

    hashed_password = get_password_hash(new_password)
    current_user.hashed_password = hashed_password
    session.add(current_user)
    session.commit()


def delete_me(session: Session, current_user: User):
    # statement = delete(Item).where(col(Item.owner_id) == current_user.id)
    # session.exec(statement)  # type: ignore
    session.delete(current_user)
    session.commit()


def create_user(*, session: Session, user_in: UserRegister | UserCreate) -> User:
    from app.modules.auth.domain.service import get_password_hash

    user_create = UserCreate.model_validate(user_in)
    secret = pyotp.random_base32()
    db_obj = User.model_validate(
        user_create,
        update={
            "hashed_password": get_password_hash(user_create.password),
            "otp_secret": secret,
        },
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_user(*, session: Session, db_user: User, user_in: UserUpdate) -> Any:
    from app.modules.auth.domain.service import get_password_hash

    user_data = user_in.model_dump(exclude_unset=True)
    extra_data = {}
    if "password" in user_data:
        password = user_data["password"]
        hashed_password = get_password_hash(password)
        extra_data["hashed_password"] = hashed_password
    db_user.sqlmodel_update(user_data, update=extra_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def update_user_email_verified(
    *, session: Session, user: User, email_verified: bool
) -> User:
    user.email_verified = email_verified
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def get_user_by_email(*, session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    session_user = session.exec(statement).first()
    return session_user


def get_user_by_id(*, session: Session, id: UUID) -> User | None:
    statement = select(User).where(User.id == id)
    session_user = session.exec(statement).first()
    return session_user


def delete_user(session: Session, user: User):
    # statement = delete(Item).where(col(Item.owner_id) == user.id)
    # session.exec(statement)  # type: ignore
    session.delete(user)
    session.commit()
