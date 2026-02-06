export interface AssetInfo {
  id: string;
  name: string;
  symbol: string;
  type: "crypto" | "traditional";
  color: string;
  current_price: number | null;
  price_change_24h: number | null;
  price_change_percentage_24h: number | null;
  sparkline_7d: number[] | null;
}

export interface PricePoint {
  timestamp: number;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number;
  volume: number | null;
}

export interface DCARequest {
  asset_id: string;
  amount: number;
  frequency: "daily" | "weekly" | "biweekly" | "monthly";
  duration_years: number;
}

export interface ProjectionPoint {
  year: number;
  total_invested: number;
  portfolio_value_low: number;
  portfolio_value_mid: number;
  portfolio_value_high: number;
  units_held: number;
  price_low: number;
  price_mid: number;
  price_high: number;
}

export interface DCAProjectionResponse {
  asset_id: string;
  asset_name: string;
  amount_per_period: number;
  frequency: string;
  duration_years: number;
  projections: ProjectionPoint[];
  model_type: string;
  disclaimer: string;
}

export interface IndicatorData {
  timestamps: number[];
  prices: number[];
  sma_20: (number | null)[];
  sma_50: (number | null)[];
  ema_12: (number | null)[];
  ema_26: (number | null)[];
  rsi_14: (number | null)[];
  macd_line: (number | null)[];
  macd_signal: (number | null)[];
  macd_histogram: (number | null)[];
}

export interface IndicatorResponse {
  asset_id: string;
  asset_name: string;
  data: IndicatorData;
  signals: Record<string, string>;
}

export interface ATHPredictionResponse {
  asset_id: string;
  asset_name: string;
  current_price: number;
  current_ath: number;
  predicted_next_ath: number;
  predicted_date_range: { earliest: string; latest: string };
  confidence: number;
  factors: string[];
  disclaimer: string;
}
