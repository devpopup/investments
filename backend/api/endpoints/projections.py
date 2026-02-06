from fastapi import APIRouter, HTTPException
from config import ASSETS
from models.schemas import DCARequest, DCAProjectionResponse
from services.projection_engine import run_dca_projection

router = APIRouter(prefix="/projections", tags=["projections"])


@router.post("/dca", response_model=DCAProjectionResponse)
async def dca_projection(req: DCARequest):
    """Run a DCA projection simulation."""
    if req.asset_id not in ASSETS:
        raise HTTPException(status_code=404, detail=f"Asset '{req.asset_id}' not found")

    try:
        result = await run_dca_projection(req)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return result
