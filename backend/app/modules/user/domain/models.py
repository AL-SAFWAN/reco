import uuid
from datetime import datetime


import sqlalchemy as sa
from pydantic import ConfigDict, EmailStr
from sqlmodel import Field, SQLModel


class UserBase(SQLModel):
    # User specific information
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    first_name: str | None = Field(default=None, max_length=255)
    last_name: str | None = Field(default=None, max_length=255)


class User(UserBase, table=True):
    __table_args__ = (
        sa.CheckConstraint(
            "token_balance >= 0", name="ck_user_token_balance_non_negative"
        ),
    )
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    created_at: datetime | None = Field(
        default=None,
        sa_column=sa.Column(
            sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
    )
    otp_secret: str
    email_verified: bool = Field(default=False, nullable=True)
    token_balance: int = Field(
        default=0,
        sa_column=sa.Column(sa.Integer, nullable=False, server_default="0"),
    )


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)
    email_verified: bool = False


class UserRegister(SQLModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    first_name: str = Field(min_length=1, max_length=255)
    last_name: str = Field(min_length=1, max_length=255)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=40)


class UserUpdateMe(SQLModel):
    # personal information
    first_name: str | None = None
    last_name: str | None = None


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


class BasicUserPublic(SQLModel):
    email: EmailStr
    first_name: str
    last_name: str


class UserPublic(UserBase):
    id: uuid.UUID
    created_at: datetime
    email_verified: bool
    token_balance: int


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int
