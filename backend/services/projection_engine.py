import numpy as np
import pandas as pd
from scipy import stats
from datetime import datetime, timedelta
from config import ASSETS, BTC_HALVING_DATES
from models.enums import AssetType, Frequency
from models.schemas import DCARequest, DCAProjectionResponse, ProjectionPoint
from services.data_fetcher import fetch_full_history


def frequency_to_days(freq: Frequency) -> int:
    return {
        Frequency.DAILY: 1,
        Frequency.WEEKLY: 7,
        Frequency.BIWEEKLY: 14,
        Frequency.MONTHLY: 30,
    }[freq]


def periods_per_year(freq: Frequency) -> float:
    return 365.0 / frequency_to_days(freq)


def power_law_projection(df: pd.DataFrame, years_ahead: int) -> dict:
    """
    Fit ln(P) = a * ln(t) + b on historical daily prices.
    Returns projected prices (low, mid, high) for each future year.
    """
    prices = df["close"].values.astype(float)
    n = len(prices)
    t = np.arange(1, n + 1, dtype=float)

    # Filter out zero/negative prices
    mask = prices > 0
    t_valid = t[mask]
    prices_valid = prices[mask]

    ln_t = np.log(t_valid)
    ln_p = np.log(prices_valid)

    slope, intercept, _, _, _ = stats.linregress(ln_t, ln_p)

    # Residual volatility
    ln_p_predicted = slope * ln_t + intercept
    residuals = ln_p - ln_p_predicted
    sigma = np.std(residuals)

    projections = {}
    for year in range(1, years_ahead + 1):
        future_t = n + year * 365
        ln_t_future = np.log(future_t)
        ln_p_mid = slope * ln_t_future + intercept

        price_mid = np.exp(ln_p_mid)
        price_low = np.exp(ln_p_mid - sigma)
        price_high = np.exp(ln_p_mid + sigma)

        projections[year] = {
            "price_low": float(price_low),
            "price_mid": float(price_mid),
            "price_high": float(price_high),
        }

    return projections


def cagr_projection(df: pd.DataFrame, years_ahead: int) -> dict:
    """
    Compute weighted CAGR from historical data.
    Weighted blend: 20% 5yr + 30% 10yr + 50% 20yr.
    """
    prices = df["close"].values.astype(float)
    n = len(prices)
    current_price = prices[-1]

    # Compute CAGRs for different periods
    cagrs = {}
    for label, period_days in [("5yr", 5 * 365), ("10yr", 10 * 365), ("20yr", 20 * 365)]:
        if n >= period_days:
            start_price = prices[max(0, n - period_days)]
            years = period_days / 365
            cagr = (current_price / start_price) ** (1 / years) - 1
            cagrs[label] = cagr

    # Weighted blend
    weights = {"5yr": 0.2, "10yr": 0.3, "20yr": 0.5}
    total_weight = sum(weights[k] for k in cagrs)
    blended_cagr = sum(cagrs[k] * weights[k] for k in cagrs) / total_weight if total_weight > 0 else 0.07

    # Historical volatility for confidence bands
    returns = np.diff(np.log(prices[prices > 0]))
    annual_vol = np.std(returns) * np.sqrt(252)

    projections = {}
    for year in range(1, years_ahead + 1):
        price_mid = current_price * (1 + blended_cagr) ** year
        vol_band = annual_vol * np.sqrt(year)
        price_low = price_mid * np.exp(-vol_band)
        price_high = price_mid * np.exp(vol_band)

        projections[year] = {
            "price_low": float(price_low),
            "price_mid": float(price_mid),
            "price_high": float(price_high),
        }

    return projections


def simulate_dca(
    current_price: float,
    price_projections: dict,
    amount_per_period: float,
    freq: Frequency,
    duration_years: int,
) -> list[ProjectionPoint]:
    """Simulate DCA on low/mid/high price paths."""
    ppy = periods_per_year(freq)
    results = []

    total_invested = 0.0
    units_low = 0.0
    units_mid = 0.0
    units_high = 0.0

    for year in range(1, duration_years + 1):
        proj = price_projections[year]
        periods_this_year = int(ppy)

        # Interpolate prices across each buy within the year
        prev_low = current_price if year == 1 else price_projections[year - 1]["price_low"]
        prev_mid = current_price if year == 1 else price_projections[year - 1]["price_mid"]
        prev_high = current_price if year == 1 else price_projections[year - 1]["price_high"]

        for i in range(periods_this_year):
            frac = (i + 1) / periods_this_year
            buy_price_low = prev_low + frac * (proj["price_low"] - prev_low)
            buy_price_mid = prev_mid + frac * (proj["price_mid"] - prev_mid)
            buy_price_high = prev_high + frac * (proj["price_high"] - prev_high)

            total_invested += amount_per_period
            units_low += amount_per_period / buy_price_low
            units_mid += amount_per_period / buy_price_mid
            units_high += amount_per_period / buy_price_high

        results.append(ProjectionPoint(
            year=year,
            total_invested=round(total_invested, 2),
            portfolio_value_low=round(units_low * proj["price_low"], 2),
            portfolio_value_mid=round(units_mid * proj["price_mid"], 2),
            portfolio_value_high=round(units_high * proj["price_high"], 2),
            units_held=round(units_mid, 6),
            price_low=round(proj["price_low"], 2),
            price_mid=round(proj["price_mid"], 2),
            price_high=round(proj["price_high"], 2),
        ))

    return results


async def run_dca_projection(req: DCARequest) -> DCAProjectionResponse:
    """Run full DCA projection pipeline."""
    asset = ASSETS[req.asset_id]
    df = await fetch_full_history(req.asset_id)

    if df.empty or len(df) < 30:
        raise ValueError(f"Insufficient data for {req.asset_id}")

    current_price = float(df["close"].iloc[-1])

    if asset["type"] == AssetType.CRYPTO:
        price_projections = power_law_projection(df, req.duration_years)
        model_type = "power_law_regression"
    else:
        price_projections = cagr_projection(df, req.duration_years)
        model_type = "weighted_cagr"

    projection_points = simulate_dca(
        current_price=current_price,
        price_projections=price_projections,
        amount_per_period=req.amount,
        freq=req.frequency,
        duration_years=req.duration_years,
    )

    return DCAProjectionResponse(
        asset_id=req.asset_id,
        asset_name=asset["name"],
        amount_per_period=req.amount,
        frequency=req.frequency.value,
        duration_years=req.duration_years,
        projections=projection_points,
        model_type=model_type,
    )
