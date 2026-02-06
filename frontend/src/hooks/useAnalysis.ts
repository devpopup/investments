"use client";
import useSWR from "swr";
import { API_BASE } from "@/lib/constants";
import { fetcher } from "@/lib/api";
import type { IndicatorResponse } from "@/lib/types";

export function useAnalysis(assetId: string | null, days = 365) {
  const { data, error, isLoading } = useSWR<IndicatorResponse>(
    assetId ? `${API_BASE}/analysis/${assetId}/indicators?days=${days}` : null,
    fetcher
  );
  return { data, error, isLoading };
}
