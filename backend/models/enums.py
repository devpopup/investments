from enum import Enum


class AssetType(str, Enum):
    CRYPTO = "crypto"
    TRADITIONAL = "traditional"


class Frequency(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    BIWEEKLY = "biweekly"
    MONTHLY = "monthly"
