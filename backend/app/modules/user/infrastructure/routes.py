import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from app.core.config import settings
from app.modules.auth.domain import service as auth_service
from app.modules.deps import (
    CurrentUser,
    SessionDep,
)
from app.core.models import Message
from app.modules.user.domain.models import (
    UpdatePassword,
    User,
    UserPublic,
    UserRegister,
    UserUpdateMe,
)
from app.modules.user.infrastructure import repository

router = APIRouter()


@router.patch("/me", response_model=UserPublic)
def update_user_me(
    *, session: SessionDep, user_in: UserUpdateMe, current_user: CurrentUser
) -> Any:
    """
    Update own user.
    """

    if current_user.email:
        existing_user = repository.get_user_by_email(
            session=session, email=current_user.email
        )
        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(
                status_code=409, detail="User with this email already exists"
            )
    current_user = repository.update_me(
        session=session, user_in=user_in, current_user=current_user
    )
    return current_user


@router.patch("/me/password", response_model=Message)
def update_password_me(
    *, session: SessionDep, body: UpdatePassword, current_user: CurrentUser
) -> Any:
    """
    Update own password.
    """

    if not auth_service.verify_password(
        body.current_password, current_user.hashed_password
    ):
        raise HTTPException(status_code=400, detail="Incorrect password")
    if body.current_password == body.new_password:
        raise HTTPException(
            status_code=400,
            detail="New password cannot be the same as the current one",
        )
    repository.update_me_password(
        session=session, current_user=current_user, new_password=body.new_password
    )
    return Message(message="Password updated successfully")


@router.get("/me", response_model=UserPublic)
def read_user_me(current_user: CurrentUser) -> Any:
    """
    Get current user.
    """
    return current_user


@router.delete("/me", response_model=Message)
def delete_user_me(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Delete own user.
    """
    repository.delete_me(session=session, current_user=current_user)
    return Message(message="User deleted successfully")


@router.post("/signup", response_model=UserPublic)
def register_user(session: SessionDep, user_in: UserRegister) -> Any:
    """
    Create new user without the need to be logged in.
    """
    user = repository.get_user_by_email(session=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )
    user = repository.create_user(session=session, user_in=user_in)
    return user


@router.get("/{user_id}", response_model=UserPublic)
def read_user_by_id(
    user_id: uuid.UUID, session: SessionDep, current_user: CurrentUser
) -> Any:
    """
    Get a specific user by id.
    """
    user = session.get(User, user_id)
    if user == current_user:
        return user
    else:
        raise HTTPException(
            status_code=403,
            detail="The user doesn't have enough privileges",
        )
