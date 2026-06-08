from enum import Enum

from sqlmodel import SQLModel


class Message(SQLModel):
    message: str
