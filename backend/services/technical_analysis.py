import pandas as pd
import numpy as np
from ta.trend import SMAIndicator, EMAIndicator, MACD
from ta.momentum import RSIIndicator
from config import ASSETS
from models.schemas import IndicatorData, IndicatorResponse
from services.data_fetcher import fetch_history
from services.cache import indicator_cache


def generate_signals(df: pd.DataFrame) -> dict[str, str]:
    """Generate trading signals from indicator values."""
    signals = {}
    last = len(df) - 1

    # SMA signal
    if pd.notna(df["sma_20"].iloc[last]) and pd.notna(df["sma_50"].iloc[last]):
        if df["sma_20"].iloc[last] > df["sma_50"].iloc[last]:
            signals["sma_crossover"] = "bullish"
        else:
            signals["sma_crossover"] = "bearish"

    # RSI signal
    rsi_val = df["rsi_14"].iloc[last]
    if pd.notna(rsi_val):
        if rsi_val > 70:
            signals["rsi"] = "overbought"
        elif rsi_val < 30:
            signals["rsi"] = "oversold"
        else:
            signals["rsi"] = "neutral"

    # MACD signal
    macd_hist = df["macd_histogram"].iloc[last]
    if pd.notna(macd_hist):
        if macd_hist > 0:
            signals["macd"] = "bullish"
        else:
            signals["macd"] = "bearish"

    # Price vs SMA
    price = df["close"].iloc[last]
    sma_50 = df["sma_50"].iloc[last]
    if pd.notna(sma_50):
        if price > sma_50:
            signals["trend"] = "above_sma50"
        else:
            signals["trend"] = "below_sma50"

    return signals


async def compute_indicators(asset_id: str, days: int = 365) -> IndicatorResponse:
    """Compute technical indicators for an asset."""
    cache_key = f"indicators_{asset_id}_{days}"
    if cache_key in indicator_cache:
        return indicator_cache[cache_key]

    asset = ASSETS[asset_id]
    df = await fetch_history(asset_id, days)

    if df.empty or len(df) < 30:
        raise ValueError(f"Not enough data for {asset_id}")

    close = df["close"].astype(float)

    # SMA
    sma_20 = SMAIndicator(close=close, window=20).sma_indicator()
    sma_50 = SMAIndicator(close=close, window=50).sma_indicator()

    # EMA
    ema_12 = EMAIndicator(close=close, window=12).ema_indicator()
    ema_26 = EMAIndicator(close=close, window=26).ema_indicator()

    # RSI
    rsi_14 = RSIIndicator(close=close, window=14).rsi()

    # MACD
    macd = MACD(close=close, window_slow=26, window_fast=12, window_sign=9)
    macd_line = macd.macd()
    macd_signal = macd.macd_signal()
    macd_histogram = macd.macd_diff()

    # Build result dataframe for signal generation
    result_df = pd.DataFrame({
        "close": close,
        "sma_20": sma_20,
        "sma_50": sma_50,
        "rsi_14": rsi_14,
        "macd_histogram": macd_histogram,
    })

    signals = generate_signals(result_df)

    def to_list(series: pd.Series) -> list:
        return [None if pd.isna(v) else round(float(v), 4) for v in series]

    indicator_data = IndicatorData(
        timestamps=df["timestamp"].tolist(),
        prices=to_list(close),
        sma_20=to_list(sma_20),
        sma_50=to_list(sma_50),
        ema_12=to_list(ema_12),
        ema_26=to_list(ema_26),
        rsi_14=to_list(rsi_14),
        macd_line=to_list(macd_line),
        macd_signal=to_list(macd_signal),
        macd_histogram=to_list(macd_histogram),
    )

    response = IndicatorResponse(
        asset_id=asset_id,
        asset_name=asset["name"],
        data=indicator_data,
        signals=signals,
    )
    indicator_cache[cache_key] = response
    return response
