from typing import Any
from uuid import UUID

import pyotp
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.modules.user.domain.models import (
    User,
    UserCreate,
    UserRegister,
    UserUpdate,
    UserUpdateMe,
)


async def update_me(
    *, session: AsyncSession, user_in: UserUpdateMe, current_user: User
) -> Any:
    user_data = user_in.model_dump(exclude_unset=True)
    current_user.sqlmodel_update(user_data)
    session.add(current_user)
    await session.commit()
    await session.refresh(current_user)
    return current_user


async def update_me_password(
    *, session: AsyncSession, current_user: User, new_password: str
) -> Any:
    from app.modules.auth.domain.service import get_password_hash

    hashed_password = get_password_hash(new_password)
    current_user.hashed_password = hashed_password
    session.add(current_user)
    await session.commit()


async def delete_me(session: AsyncSession, current_user: User):
    await session.delete(current_user)
    await session.commit()


async def create_user(
    *, session: AsyncSession, user_in: UserRegister | UserCreate
) -> User:
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
    await session.commit()
    await session.refresh(db_obj)
    return db_obj


async def update_user(
    *, session: AsyncSession, db_user: User, user_in: UserUpdate
) -> Any:
    from app.modules.auth.domain.service import get_password_hash

    user_data = user_in.model_dump(exclude_unset=True)
    extra_data = {}
    if "password" in user_data:
        password = user_data["password"]
        hashed_password = get_password_hash(password)
        extra_data["hashed_password"] = hashed_password
    db_user.sqlmodel_update(user_data, update=extra_data)
    session.add(db_user)
    await session.commit()
    await session.refresh(db_user)
    return db_user


async def update_user_email_verified(
    *, session: AsyncSession, user: User, email_verified: bool
) -> User:
    user.email_verified = email_verified
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def get_user_by_email(*, session: AsyncSession, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    result = await session.exec(statement)
    return result.first()


async def get_user_by_id(*, session: AsyncSession, id: UUID) -> User | None:
    statement = select(User).where(User.id == id)
    result = await session.exec(statement)
    return result.first()


async def delete_user(session: AsyncSession, user: User):
    await session.delete(user)
    await session.commit()
