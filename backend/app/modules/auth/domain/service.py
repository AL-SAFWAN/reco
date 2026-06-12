from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
import pyotp
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.config import settings
from app.core.security import ALGORITHM, pwd_context
from app.modules.email.domain.service import (
    generate_otp_email,
)

from app.modules.user.domain.models import User


async def authenticate_user(
    *, session: AsyncSession, email: str, password: str
) -> User | None:
    from app.modules.user.infrastructure.repository import get_user_by_email

    db_user = await get_user_by_email(session=session, email=email)
    if not db_user:
        return None
    if not verify_password(password, db_user.hashed_password):
        return None
    return db_user


def create_access_token(subject: str | Any, expires_delta: timedelta) -> str:
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token_for_user(user_id: str):
    """Create a JWT access token for the given user."""
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return create_access_token(user_id, expires_delta=access_token_expires)


def create_otp_email(user: User):
    """Create a OTP email for the given user."""
    secret = user.otp_secret
    totp = pyotp.TOTP(secret, interval=300)
    current_otp = totp.now()  # Generate the current OTP
    return generate_otp_email(otp=current_otp)


def verify_otp_code(secret: str, otp_code: str):
    """Verify the OTP code for the given user."""
    totp = pyotp.TOTP(secret, interval=300)
    # `valid_window=1` allows a 1-step grace period
    # (useful if there's a slight time drift).
    return totp.verify(otp_code, valid_window=1)
