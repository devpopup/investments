import { API_BASE } from "./constants";
import type {
  AssetInfo,
  PricePoint,
  DCARequest,
  DCAProjectionResponse,
  IndicatorResponse,
  ATHPredictionResponse,
} from "./types";

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  getAssets: () => fetchJSON<AssetInfo[]>(`${API_BASE}/assets`),

  getAssetPrice: (id: string) => fetchJSON<AssetInfo>(`${API_BASE}/assets/${id}/price`),

  getAssetHistory: (id: string, days = 365) =>
    fetchJSON<PricePoint[]>(`${API_BASE}/assets/${id}/history?days=${days}`),

  getDCAProjection: (req: DCARequest) =>
    fetchJSON<DCAProjectionResponse>(`${API_BASE}/projections/dca`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    }),

  getIndicators: (id: string, days = 365) =>
    fetchJSON<IndicatorResponse>(`${API_BASE}/analysis/${id}/indicators?days=${days}`),

  getATHPrediction: (id: string) =>
    fetchJSON<ATHPredictionResponse>(`${API_BASE}/ath/${id}/prediction`),
};

// SWR fetcher
export const fetcher = <T>(url: string): Promise<T> => fetchJSON<T>(url);
