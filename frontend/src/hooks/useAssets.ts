"use client";
import useSWR from "swr";
import { API_BASE } from "@/lib/constants";
import { fetcher } from "@/lib/api";
import type { AssetInfo } from "@/lib/types";

export function useAssets() {
  const { data, error, isLoading } = useSWR<AssetInfo[]>(
    `${API_BASE}/assets`,
    fetcher,
    { refreshInterval: 60000 }
  );
  return { assets: data, error, isLoading };
}

export function useAssetPrice(id: string | null) {
  const { data, error, isLoading } = useSWR<AssetInfo>(
    id ? `${API_BASE}/assets/${id}/price` : null,
    fetcher,
    { refreshInterval: 60000 }
  );
  return { asset: data, error, isLoading };
}
