from fastapi import APIRouter, HTTPException, Query
from config import ASSETS
from models.schemas import IndicatorResponse
from services.technical_analysis import compute_indicators

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.get("/{asset_id}/indicators", response_model=IndicatorResponse)
async def get_indicators(asset_id: str, days: int = Query(default=365, ge=30, le=3650)):
    """Get technical indicators for an asset."""
    if asset_id not in ASSETS:
        raise HTTPException(status_code=404, detail=f"Asset '{asset_id}' not found")

    result = await compute_indicators(asset_id, days)
    return result
