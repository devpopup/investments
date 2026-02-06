"use client";
import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { DCARequest, DCAProjectionResponse } from "@/lib/types";

export function useProjection() {
  const [data, setData] = useState<DCAProjectionResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runProjection = useCallback(async (req: DCARequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.getDCAProjection(req);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Projection failed"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, error, isLoading, runProjection };
}
