from fastapi import APIRouter, HTTPException, Query
from config import ASSETS
from models.schemas import AssetInfo, PricePoint
from services.data_fetcher import fetch_asset_price, fetch_history

router = APIRouter(prefix="/assets", tags=["assets"])


@router.get("", response_model=list[AssetInfo])
async def get_assets():
    """Get all assets with current prices and 24h change."""
    result = []
    for asset_id, asset in ASSETS.items():
        info = AssetInfo(
            id=asset["id"],
            name=asset["name"],
            symbol=asset["symbol"],
            type=asset["type"],
            color=asset["color"],
        )

        price_data = await fetch_asset_price(asset["yahoo_ticker"])
        info.current_price = price_data.get("current_price")
        info.price_change_24h = price_data.get("price_change_24h")
        info.price_change_percentage_24h = price_data.get("price_change_percentage_24h")
        info.sparkline_7d = price_data.get("sparkline_7d")

        result.append(info)
    return result


@router.get("/{asset_id}/price", response_model=AssetInfo)
async def get_asset_price(asset_id: str):
    """Get single asset price with 7d sparkline."""
    asset = ASSETS.get(asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset '{asset_id}' not found")

    info = AssetInfo(
        id=asset["id"],
        name=asset["name"],
        symbol=asset["symbol"],
        type=asset["type"],
        color=asset["color"],
    )

    price_data = await fetch_asset_price(asset["yahoo_ticker"])
    info.current_price = price_data.get("current_price")
    info.price_change_24h = price_data.get("price_change_24h")
    info.price_change_percentage_24h = price_data.get("price_change_percentage_24h")
    info.sparkline_7d = price_data.get("sparkline_7d")
    return info


@router.get("/{asset_id}/history", response_model=list[PricePoint])
async def get_asset_history(asset_id: str, days: int = Query(default=365, ge=1, le=3650)):
    """Get historical OHLC data."""
    if asset_id not in ASSETS:
        raise HTTPException(status_code=404, detail=f"Asset '{asset_id}' not found")

    df = await fetch_history(asset_id, days)
    if df.empty:
        return []

    result = []
    for _, row in df.iterrows():
        result.append(PricePoint(
            timestamp=int(row["timestamp"]),
            open=row.get("open"),
            high=row.get("high"),
            low=row.get("low"),
            close=float(row["close"]),
            volume=row.get("volume"),
        ))
    return result
