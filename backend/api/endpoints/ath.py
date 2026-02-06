from fastapi import APIRouter, HTTPException
from config import ASSETS
from models.schemas import ATHPredictionResponse
from services.ath_predictor import predict_ath

router = APIRouter(prefix="/ath", tags=["ath"])


@router.get("/{asset_id}/prediction", response_model=ATHPredictionResponse)
async def get_ath_prediction(asset_id: str):
    """Get ATH prediction for an asset."""
    if asset_id not in ASSETS:
        raise HTTPException(status_code=404, detail=f"Asset '{asset_id}' not found")

    result = await predict_ath(asset_id)
    return result
