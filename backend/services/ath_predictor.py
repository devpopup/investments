import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from config import ASSETS, BTC_HALVING_DATES
from models.enums import AssetType
from models.schemas import ATHPredictionResponse
from services.data_fetcher import fetch_full_history, fetch_crypto_prices, fetch_traditional_price
from services.technical_analysis import compute_indicators


async def predict_ath(asset_id: str) -> ATHPredictionResponse:
    """Predict the next ATH for an asset."""
    asset = ASSETS[asset_id]
    df = await fetch_full_history(asset_id)

    if df.empty:
        raise ValueError(f"No data for {asset_id}")

    prices = df["close"].values.astype(float)
    timestamps = df["timestamp"].values

    # Find current ATH
    ath_idx = np.argmax(prices)
    current_ath = float(prices[ath_idx])

    # Get current price
    if asset["type"] == AssetType.CRYPTO:
        price_data = await fetch_crypto_prices([asset_id])
        current_price = price_data.get(asset["coingecko_id"], {}).get("current_price", float(prices[-1]))
    else:
        price_data = await fetch_traditional_price(asset["yahoo_ticker"])
        current_price = price_data.get("current_price", float(prices[-1]))

    # Find historical ATH events (local maxima that set new highs)
    ath_events = find_ath_events(prices, timestamps)

    # Compute ATH growth rates
    growth_rates = []
    for i in range(1, len(ath_events)):
        prev_ath = ath_events[i - 1]["price"]
        curr_ath = ath_events[i]["price"]
        growth_rates.append(curr_ath / prev_ath)

    # Predict next ATH value
    if growth_rates:
        # Use decaying growth rate (ATH growth tends to diminish)
        recent_growth = np.mean(growth_rates[-3:]) if len(growth_rates) >= 3 else np.mean(growth_rates)
        # Dampen growth rate
        dampened_growth = 1 + (recent_growth - 1) * 0.6
        predicted_ath = current_ath * dampened_growth
    else:
        predicted_ath = current_ath * 1.5

    # Predict timing
    factors = []
    confidence = 0.5

    if asset_id == "bitcoin":
        date_range, btc_confidence, btc_factors = btc_cycle_prediction()
        confidence = btc_confidence
        factors.extend(btc_factors)
    elif asset["type"] == AssetType.CRYPTO:
        # Crypto follows BTC cycles loosely
        date_range = {
            "earliest": (datetime.now() + timedelta(days=90)).strftime("%Y-%m-%d"),
            "latest": (datetime.now() + timedelta(days=730)).strftime("%Y-%m-%d"),
        }
        factors.append("Crypto markets tend to follow BTC cycle patterns")
        confidence = 0.35
    else:
        # Traditional: based on historical recovery times
        if ath_events and len(ath_events) >= 2:
            intervals = []
            for i in range(1, len(ath_events)):
                dt = ath_events[i]["timestamp"] - ath_events[i - 1]["timestamp"]
                intervals.append(dt / (1000 * 86400))  # Convert ms to days
            avg_interval = np.mean(intervals)
            last_ath_ts = ath_events[-1]["timestamp"]
            days_since_ath = (datetime.now().timestamp() * 1000 - last_ath_ts) / (1000 * 86400)
            est_days = max(30, avg_interval - days_since_ath)
        else:
            est_days = 365

        date_range = {
            "earliest": (datetime.now() + timedelta(days=est_days * 0.5)).strftime("%Y-%m-%d"),
            "latest": (datetime.now() + timedelta(days=est_days * 1.5)).strftime("%Y-%m-%d"),
        }
        factors.append("Based on historical ATH interval analysis")
        pct_from_ath = (current_ath - current_price) / current_ath * 100
        if pct_from_ath < 5:
            confidence = 0.7
            factors.append(f"Price is within {pct_from_ath:.1f}% of ATH")
        elif pct_from_ath < 15:
            confidence = 0.55
            factors.append(f"Price is {pct_from_ath:.1f}% below ATH")
        else:
            confidence = 0.3
            factors.append(f"Price is {pct_from_ath:.1f}% below ATH - significant recovery needed")

    # Try to add technical indicator factors
    try:
        indicators = await compute_indicators(asset_id, 365)
        for signal_name, signal_val in indicators.signals.items():
            if signal_name == "rsi":
                factors.append(f"RSI signal: {signal_val}")
            elif signal_name == "macd":
                factors.append(f"MACD signal: {signal_val}")
            elif signal_name == "sma_crossover":
                factors.append(f"SMA crossover: {signal_val}")
                if signal_val == "bullish":
                    confidence = min(confidence + 0.05, 0.9)
                else:
                    confidence = max(confidence - 0.05, 0.1)
    except Exception:
        pass

    return ATHPredictionResponse(
        asset_id=asset_id,
        asset_name=asset["name"],
        current_price=round(current_price, 2),
        current_ath=round(current_ath, 2),
        predicted_next_ath=round(predicted_ath, 2),
        predicted_date_range=date_range,
        confidence=round(confidence, 2),
        factors=factors,
    )


def find_ath_events(prices: np.ndarray, timestamps: np.ndarray) -> list[dict]:
    """Find points where price set a new all-time high."""
    events = []
    running_max = 0.0
    # Sample at intervals to avoid too many events
    step = max(1, len(prices) // 1000)
    for i in range(0, len(prices), step):
        if prices[i] > running_max:
            running_max = prices[i]
            events.append({
                "price": float(prices[i]),
                "timestamp": float(timestamps[i]),
            })
    return events


def btc_cycle_prediction() -> tuple[dict, float, list[str]]:
    """BTC-specific cycle analysis using halving dates."""
    halving_dates = [datetime.strptime(d, "%Y-%m-%d") for d in BTC_HALVING_DATES]
    now = datetime.now()

    # Find most recent halving
    past_halvings = [h for h in halving_dates if h < now]
    if not past_halvings:
        return (
            {
                "earliest": (now + timedelta(days=365)).strftime("%Y-%m-%d"),
                "latest": (now + timedelta(days=730)).strftime("%Y-%m-%d"),
            },
            0.3,
            ["No past halving data available"],
        )

    last_halving = past_halvings[-1]
    days_since_halving = (now - last_halving).days

    factors = [
        f"Last BTC halving: {last_halving.strftime('%Y-%m-%d')} ({days_since_halving} days ago)",
        "Historical pattern: ATH typically 12-18 months post-halving",
    ]

    # ATH typically 12-18 months after halving (365-550 days)
    target_start = last_halving + timedelta(days=365)
    target_end = last_halving + timedelta(days=550)

    if now < target_start:
        confidence = 0.55
        factors.append("Still in early post-halving accumulation phase")
    elif now < target_end:
        confidence = 0.7
        factors.append("Currently in historical ATH window (12-18 months post-halving)")
    else:
        confidence = 0.4
        factors.append("Past typical ATH window - extended cycle possible")
        target_start = now + timedelta(days=60)
        target_end = now + timedelta(days=365)

    date_range = {
        "earliest": max(target_start, now + timedelta(days=30)).strftime("%Y-%m-%d"),
        "latest": max(target_end, now + timedelta(days=180)).strftime("%Y-%m-%d"),
    }

    return date_range, confidence, factors
