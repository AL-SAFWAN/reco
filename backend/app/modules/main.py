from fastapi import APIRouter

from app.modules.auth.infrastructure import routes as auth
from app.modules.job.infrastructure import routes as jobs
from app.modules.user.infrastructure import routes as users
from app.modules.marketplace.infrastructure import routes as marketplace

api_router = APIRouter()
api_router.include_router(auth.router, tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
api_router.include_router(
    marketplace.router, prefix="/marketplace", tags=["Marketplace"]
)
