from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel import Session, create_engine, select

from app.core.config import settings
from app.modules.user.domain.models import User, UserCreate
from app.modules.user.infrastructure import repository

# ── Sync engine — used by Alembic migrations and startup scripts ──
engine = create_engine(
    str(settings.SQLALCHEMY_DATABASE_URI),
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=3600,
)

# ── Async engine — used by all FastAPI routes ─────────────────────
_async_url = str(settings.SQLALCHEMY_DATABASE_URI).replace(
    "postgresql+psycopg", "postgresql+psycopg_async"
)
async_engine = create_async_engine(
    _async_url,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=3600,
)


# make sure all SQLModel models are imported (app.models) before initializing DB
# otherwise, SQLModel might fail to initialize relationships properly
# for more details: https://github.com/fastapi/full-stack-fastapi-template/issues/28


def init_db(session: Session) -> None:
    # Tables should be created with Alembic migrations
    # But if you don't want to use migrations, create
    # the tables un-commenting the next lines
    # from sqlmodel import SQLModel

    # from app.core.engine import engine
    # This works because the models are already imported and registered from app.models
    # SQLModel.metadata.create_all(engine)

    user = session.exec(
        select(User).where(User.email == settings.FIRST_SUPERUSER)
    ).first()
    if not user:
        print("Creating initial user...")
        user_in = UserCreate(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            first_name=settings.FIRST_SUPERUSER_FIRSTNAME,
            last_name=settings.FIRST_SUPERUSER_LASTNAME,
            email_verified=True,
        )
        user = repository.create_user(session=session, user_in=user_in)
