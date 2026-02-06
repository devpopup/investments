import httpx
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from config import ASSETS, COINGECKO_BASE_URL
from models.enums import AssetType
from services.cache import price_cache, history_cache

YAHOO_CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart"
YAHOO_HEADERS = {"User-Agent": "Mozilla/5.0"}


async def fetch_crypto_prices(asset_ids: list[str]) -> dict:
    """Fetch current prices for crypto assets from CoinGecko."""
    coingecko_ids = [
        ASSETS[aid]["coingecko_id"] for aid in asset_ids if ASSETS[aid]["type"] == AssetType.CRYPTO
    ]
    if not coingecko_ids:
        return {}

    cache_key = f"crypto_prices_{'_'.join(sorted(coingecko_ids))}"
    if cache_key in price_cache:
        return price_cache[cache_key]

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{COINGECKO_BASE_URL}/coins/markets",
            params={
                "vs_currency": "usd",
                "ids": ",".join(coingecko_ids),
                "sparkline": "true",
                "price_change_percentage": "24h",
            },
            timeout=15.0,
        )
        resp.raise_for_status()
        data = resp.json()

    result = {}
    for coin in data:
        result[coin["id"]] = {
            "current_price": coin.get("current_price"),
            "price_change_24h": coin.get("price_change_24h"),
            "price_change_percentage_24h": coin.get("price_change_percentage_24h"),
            "ath": coin.get("ath"),
            "ath_date": coin.get("ath_date"),
            "sparkline_7d": coin.get("sparkline_in_7d", {}).get("price", []),
        }
    price_cache[cache_key] = result
    return result


async def fetch_traditional_price(ticker: str) -> dict:
    """Fetch current price for traditional assets from Yahoo Finance chart API."""
    cache_key = f"trad_price_{ticker}"
    if cache_key in price_cache:
        return price_cache[cache_key]

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{YAHOO_CHART_URL}/{ticker}",
                params={"range": "7d", "interval": "1d"},
                headers=YAHOO_HEADERS,
                timeout=10.0,
                follow_redirects=True,
            )
            resp.raise_for_status()
            data = resp.json()

        chart = data["chart"]["result"][0]
        meta = chart["meta"]
        closes = chart["indicators"]["quote"][0]["close"]
        # Filter out None values
        valid_closes = [c for c in closes if c is not None]

        if not valid_closes:
            return {}

        current = meta.get("regularMarketPrice", valid_closes[-1])
        prev = valid_closes[-2] if len(valid_closes) > 1 else current
        change = current - prev
        change_pct = (change / prev) * 100 if prev else 0

        result = {
            "current_price": float(current),
            "price_change_24h": float(change),
            "price_change_percentage_24h": float(change_pct),
            "sparkline_7d": [float(c) for c in valid_closes],
        }
        price_cache[cache_key] = result
        return result
    except Exception:
        return {}


async def fetch_crypto_history(coingecko_id: str, days: int = 365) -> pd.DataFrame:
    """Fetch historical OHLC data from CoinGecko."""
    cache_key = f"crypto_hist_{coingecko_id}_{days}"
    if cache_key in history_cache:
        return history_cache[cache_key]

    try:
        async with httpx.AsyncClient() as client:
            if days <= 90:
                resp = await client.get(
                    f"{COINGECKO_BASE_URL}/coins/{coingecko_id}/ohlc",
                    params={"vs_currency": "usd", "days": str(days)},
                    timeout=15.0,
                )
                resp.raise_for_status()
                data = resp.json()
                df = pd.DataFrame(data, columns=["timestamp", "open", "high", "low", "close"])
            else:
                resp = await client.get(
                    f"{COINGECKO_BASE_URL}/coins/{coingecko_id}/market_chart",
                    params={"vs_currency": "usd", "days": str(days)},
                    timeout=15.0,
                )
                resp.raise_for_status()
                data = resp.json()
                prices = data.get("prices", [])
                df = pd.DataFrame(prices, columns=["timestamp", "close"])
                df["open"] = df["close"]
                df["high"] = df["close"]
                df["low"] = df["close"]

        df["timestamp"] = df["timestamp"].astype(int)
        df = df.sort_values("timestamp").reset_index(drop=True)
        history_cache[cache_key] = df
        return df
    except Exception:
        return pd.DataFrame()


async def fetch_traditional_history(ticker: str, days: int = 365) -> pd.DataFrame:
    """Fetch historical OHLCV data from Yahoo Finance chart API."""
    cache_key = f"trad_hist_{ticker}_{days}"
    if cache_key in history_cache:
        return history_cache[cache_key]

    # Map days to Yahoo range/interval
    if days <= 30:
        range_str, interval = "1mo", "1d"
    elif days <= 90:
        range_str, interval = "3mo", "1d"
    elif days <= 180:
        range_str, interval = "6mo", "1d"
    elif days <= 365:
        range_str, interval = "1y", "1d"
    elif days <= 730:
        range_str, interval = "2y", "1d"
    elif days <= 1825:
        range_str, interval = "5y", "1wk"
    else:
        range_str, interval = "max", "1wk"

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{YAHOO_CHART_URL}/{ticker}",
                params={"range": range_str, "interval": interval},
                headers=YAHOO_HEADERS,
                timeout=10.0,
                follow_redirects=True,
            )
            resp.raise_for_status()
            data = resp.json()

        chart = data["chart"]["result"][0]
        timestamps = chart["timestamp"]
        quote = chart["indicators"]["quote"][0]

        df = pd.DataFrame({
            "timestamp": [int(ts * 1000) for ts in timestamps],
            "open": quote.get("open", []),
            "high": quote.get("high", []),
            "low": quote.get("low", []),
            "close": quote.get("close", []),
            "volume": quote.get("volume", []),
        })
        # Drop rows with None close
        df = df.dropna(subset=["close"]).reset_index(drop=True)
        history_cache[cache_key] = df
        return df
    except Exception:
        return pd.DataFrame()


async def fetch_history(asset_id: str, days: int = 365) -> pd.DataFrame:
    """Unified history fetcher."""
    asset = ASSETS.get(asset_id)
    if not asset:
        return pd.DataFrame()

    if asset["type"] == AssetType.CRYPTO:
        return await fetch_crypto_history(asset["coingecko_id"], days)
    else:
        return await fetch_traditional_history(asset["yahoo_ticker"], days)


async def fetch_full_history(asset_id: str) -> pd.DataFrame:
    """Fetch maximum available history for an asset."""
    asset = ASSETS.get(asset_id)
    if not asset:
        return pd.DataFrame()

    # Use Yahoo Finance for all assets — it provides full history
    # (CoinGecko free API limits crypto to 365 days)
    return await fetch_traditional_history(asset["yahoo_ticker"], days=7300)
