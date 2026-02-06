from cachetools import TTLCache
from config import CACHE_TTL_PRICES, CACHE_TTL_HISTORY, CACHE_TTL_INDICATORS

price_cache = TTLCache(maxsize=100, ttl=CACHE_TTL_PRICES)
history_cache = TTLCache(maxsize=50, ttl=CACHE_TTL_HISTORY)
indicator_cache = TTLCache(maxsize=50, ttl=CACHE_TTL_INDICATORS)
