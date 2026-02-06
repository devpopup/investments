from fastapi import APIRouter
from api.endpoints import assets, projections, analysis, ath

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(assets.router)
api_router.include_router(projections.router)
api_router.include_router(analysis.router)
api_router.include_router(ath.router)
