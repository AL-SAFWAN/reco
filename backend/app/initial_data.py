import logging

from sqlmodel import Session, select

from app.core.db import engine, init_db
from app.modules.tokens.domain.models import TokenPackage

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

TOKEN_PACKAGES = [
    {
        "name": "Starter",
        "token_count": 20,
        "price": 36.00,
        "description": "Perfect for getting started - 20 tokens at £1.80 per token.",
    },
    {
        "name": "Popular",
        "token_count": 40,
        "price": 69.99,
        "description": "Best value for regular buyers - 40 tokens at £1.75 per token.",
    },
    {
        "name": "Pro",
        "token_count": 80,
        "price": 129.99,
        "description": "Maximum savings for high-volume use - 80 tokens at £1.62 per token.",
    },
]


def seed_token_packages(session: Session) -> None:
    for pkg in TOKEN_PACKAGES:
        existing = session.exec(
            select(TokenPackage).where(TokenPackage.name == pkg["name"])
        ).first()
        if not existing:
            session.add(TokenPackage(**pkg))
    session.commit()


def init() -> None:
    with Session(engine) as session:
        init_db(session)
        seed_token_packages(session)


def main() -> None:
    logger.info("Creating initial data")
    init()
    logger.info("Initial data created")


if __name__ == "__main__":
    main()
