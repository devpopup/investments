from pydantic import BaseModel, Field
from typing import Optional
from models.enums import AssetType, Frequency


class AssetInfo(BaseModel):
    id: str
    name: str
    symbol: str
    type: AssetType
    color: str
    current_price: Optional[float] = None
    price_change_24h: Optional[float] = None
    price_change_percentage_24h: Optional[float] = None
    sparkline_7d: Optional[list[float]] = None


class PricePoint(BaseModel):
    timestamp: int
    open: Optional[float] = None
    high: Optional[float] = None
    low: Optional[float] = None
    close: float
    volume: Optional[float] = None


class DCARequest(BaseModel):
    asset_id: str
    amount: float = Field(gt=0, description="Amount to invest per period")
    frequency: Frequency = Frequency.MONTHLY
    duration_years: int = Field(ge=1, le=30, default=5)


class ProjectionPoint(BaseModel):
    year: int
    total_invested: float
    portfolio_value_low: float
    portfolio_value_mid: float
    portfolio_value_high: float
    units_held: float
    price_low: float
    price_mid: float
    price_high: float


class DCAProjectionResponse(BaseModel):
    asset_id: str
    asset_name: str
    amount_per_period: float
    frequency: str
    duration_years: int
    projections: list[ProjectionPoint]
    model_type: str
    disclaimer: str = (
        "Projections are based on historical data. "
        "Past performance does not guarantee future results. "
        "For educational purposes only. Not financial advice."
    )


class IndicatorData(BaseModel):
    timestamps: list[int]
    prices: list[float]
    sma_20: list[Optional[float]]
    sma_50: list[Optional[float]]
    ema_12: list[Optional[float]]
    ema_26: list[Optional[float]]
    rsi_14: list[Optional[float]]
    macd_line: list[Optional[float]]
    macd_signal: list[Optional[float]]
    macd_histogram: list[Optional[float]]


class IndicatorResponse(BaseModel):
    asset_id: str
    asset_name: str
    data: IndicatorData
    signals: dict[str, str]


class ATHPredictionResponse(BaseModel):
    asset_id: str
    asset_name: str
    current_price: float
    current_ath: float
    predicted_next_ath: float
    predicted_date_range: dict[str, str]
    confidence: float
    factors: list[str]
    disclaimer: str = (
        "ATH predictions are speculative and based on historical patterns. "
        "Cryptocurrency investments are highly volatile. Not financial advice."
    )
