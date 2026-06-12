from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.models import Message
from app.modules.auth.domain import service
from app.modules.auth.domain.models import NewPassword, Token, VerifyOTP
from app.modules.deps import CurrentUser, SessionDep
from app.modules.email.domain.service import (
    generate_new_account_email,
    generate_password_reset_token,
    generate_reset_password_email,
    send_email,
    verify_password_reset_token,
)
from app.modules.user.domain.models import (
    User,
    UserCreate,
    UserPublic,
    UserRegister,
    UserUpdateMe,
)
from app.modules.user.infrastructure import repository as user_repository

router = APIRouter()


@router.post("/login")
async def login(
    session: SessionDep,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = await service.authenticate_user(
        session=session, email=form_data.username, password=form_data.password
    )

    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token = service.create_access_token_for_user(user_id=user.id)
    return Token(access_token=access_token)


@router.post("/login/access-token")
async def login_access_token(
    session: SessionDep,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    """
    OAuth2 compatible token login, get an access token for future requests
    """

    user = await service.authenticate_user(
        session=session, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token = service.create_access_token_for_user(user_id=user.id)

    return Token(access_token=access_token)


@router.post("/login/test-token", response_model=UserPublic)
async def test_token(current_user: CurrentUser) -> Any:
    """
    Test access token
    """
    return current_user


@router.post("/logout")
async def logout():
    """
    Logout the user.
    """
    return Message(message="Successfully logged out.")


@router.post("/register")
async def create_account(session: SessionDep, user_in: UserRegister) -> Token:
    """
    Create an Account
    """
    user = await user_repository.get_user_by_email(session=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )

    user_create = UserCreate.model_validate(
        user_in,
        update={
            "email_verified": False,
        },
    )
    user = await user_repository.create_user(session=session, user_in=user_create)

    if settings.emails_enabled and user_create.email:
        email_data_otp = service.create_otp_email(user)
        email_data = generate_new_account_email(
            email_to=user_create.email,
            firstName=user_create.first_name,
            lastName=user_create.last_name,
        )
        send_email(
            email_to=user_create.email,
            subject=email_data.subject,
            html_content=email_data.html_content,
        )
        send_email(
            email_to=user_create.email,
            subject=email_data_otp.subject,
            html_content=email_data_otp.html_content,
        )

    access_token = service.create_access_token_for_user(user_id=user.id)
    return Token(access_token=access_token)


@router.post("/password-recovery/{email}")
async def recover_password(email: str, session: SessionDep) -> Message:
    """
    Password Recovery
    """
    user = await user_repository.get_user_by_email(session=session, email=email)

    if not user:
        return Message(message="If an account exists, you will receive an email")

    password_reset_token = generate_password_reset_token(email=email)
    email_data = generate_reset_password_email(
        first_name=user.first_name, token=password_reset_token
    )
    send_email(
        email_to=user.email,
        subject=email_data.subject,
        html_content=email_data.html_content,
    )
    return Message(message="If an account exists, you will receive an email")


@router.post("/reset-password/")
async def reset_password(session: SessionDep, body: NewPassword) -> Message:
    """
    Reset password
    """
    email = verify_password_reset_token(token=body.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid token")
    user = await user_repository.get_user_by_email(session=session, email=email)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this email does not exist in the system.",
        )

    await user_repository.update_me_password(
        session=session, current_user=user, new_password=body.password
    )

    return Message(message="Password updated successfully")


@router.post("/request-otp/{email}")
async def request_otp(email: str, session: SessionDep) -> Message:
    user = await user_repository.get_user_by_email(session=session, email=email)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this email does not exist in the system.",
        )

    email_data = service.create_otp_email(user)

    send_email(
        email_to=user.email,
        subject=email_data.subject,
        html_content=email_data.html_content,
    )
    return Message(message="Verification email sent")


@router.post("/verify-otp/")
async def verify_otp(
    session: SessionDep,
    body: VerifyOTP,
    current_user: CurrentUser,
) -> UserPublic:
    user = await session.get(User, current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    secret = user.otp_secret
    if not secret:
        raise HTTPException(status_code=404, detail="User secret not found.")

    code_valid = service.verify_otp_code(secret, body.otp)
    if not code_valid:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP.")

    await user_repository.update_user_email_verified(
        session=session, user=user, email_verified=True
    )
    return user


@router.post("/complete-account/")
async def complete_account(
    session: SessionDep,
    user_in: UserUpdateMe,
    current_user: CurrentUser,
):
    """
    Completes the user account
    """
    db_user = await session.get(User, current_user.id)
    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )

    updated_user = await user_repository.update_me(
        session=session, user_in=user_in, current_user=db_user
    )
    return updated_user
