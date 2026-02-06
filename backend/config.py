from models.enums import AssetType

ASSETS = {
    "bitcoin": {
        "id": "bitcoin",
        "name": "Bitcoin",
        "symbol": "BTC",
        "type": AssetType.CRYPTO,
        "yahoo_ticker": "BTC-USD",
        "color": "#F7931A",
    },
    "ethereum": {
        "id": "ethereum",
        "name": "Ethereum",
        "symbol": "ETH",
        "type": AssetType.CRYPTO,
        "yahoo_ticker": "ETH-USD",
        "color": "#627EEA",
    },
    "solana": {
        "id": "solana",
        "name": "Solana",
        "symbol": "SOL",
        "type": AssetType.CRYPTO,
        "yahoo_ticker": "SOL-USD",
        "color": "#9945FF",
    },
    "nasdaq": {
        "id": "nasdaq",
        "name": "NASDAQ Composite",
        "symbol": "^IXIC",
        "type": AssetType.TRADITIONAL,
        "yahoo_ticker": "^IXIC",
        "color": "#0082CA",
    },
    "sp500": {
        "id": "sp500",
        "name": "S&P 500",
        "symbol": "^GSPC",
        "type": AssetType.TRADITIONAL,
        "yahoo_ticker": "^GSPC",
        "color": "#E4002B",
    },
}

# BTC halving dates for cycle analysis
BTC_HALVING_DATES = [
    "2012-11-28",
    "2016-07-09",
    "2020-05-11",
    "2024-04-20",
]

CACHE_TTL_PRICES = 60  # 1 minute
CACHE_TTL_HISTORY = 3600  # 1 hour
CACHE_TTL_INDICATORS = 1800  # 30 minutes
