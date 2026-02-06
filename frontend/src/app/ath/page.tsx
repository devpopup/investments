"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { api } from "@/lib/api";
import { ASSET_ICONS } from "@/lib/constants";
import { AlertTriangle, ArrowUp, Calendar, Target } from "lucide-react";
import type { ATHPredictionResponse } from "@/lib/types";

const ASSETS_LIST = [
  { id: "bitcoin", name: "Bitcoin" },
  { id: "ethereum", name: "Ethereum" },
  { id: "solana", name: "Solana" },
  { id: "nasdaq", name: "NASDAQ" },
  { id: "sp500", name: "S&P 500" },
];

export default function ATHPage() {
  const [selectedAsset, setSelectedAsset] = useState("bitcoin");
  const [prediction, setPrediction] = useState<ATHPredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    api
      .getATHPrediction(selectedAsset)
      .then(setPrediction)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [selectedAsset]);

  const pctFromATH = prediction
    ? ((prediction.current_ath - prediction.current_price) / prediction.current_ath) * 100
    : 0;

  const athGrowth = prediction
    ? ((prediction.predicted_next_ath - prediction.current_price) / prediction.current_price) * 100
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          ATH Predictions
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          All-time high predictions based on historical patterns and cycle analysis
        </p>
      </div>

      {/* Asset selector */}
      <div className="flex flex-wrap gap-2">
        {ASSETS_LIST.map((a) => (
          <Button
            key={a.id}
            variant={a.id === selectedAsset ? "primary" : "secondary"}
            size="sm"
            onClick={() => setSelectedAsset(a.id)}
          >
            {ASSET_ICONS[a.id]} {a.name}
          </Button>
        ))}
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="mt-2 h-8 w-32" />
            </Card>
          ))}
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </Card>
      )}

      {prediction && !isLoading && (
        <>
          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>Current Price</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(prediction.current_price)}
              </p>
            </Card>
            <Card>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <ArrowUp size={14} />
                <span>Current ATH</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(prediction.current_ath)}
              </p>
              <p className="text-sm text-red-500">-{pctFromATH.toFixed(1)}% from ATH</p>
            </Card>
            <Card>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Target size={14} />
                <span>Predicted Next ATH</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-green-600">
                {formatCurrency(prediction.predicted_next_ath)}
              </p>
              <p className="text-sm text-green-600">+{athGrowth.toFixed(1)}% potential</p>
            </Card>
            <Card>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar size={14} />
                <span>Confidence</span>
              </div>
              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(prediction.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-2 rounded-full bg-[#0052FF]"
                    style={{ width: `${prediction.confidence * 100}%` }}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Time Window */}
          <Card>
            <CardHeader>
              <CardTitle>Predicted Window</CardTitle>
            </CardHeader>
            <div className="flex items-center gap-4 text-gray-700 dark:text-gray-300">
              <div className="rounded-lg bg-blue-50 px-4 py-2 dark:bg-blue-950">
                <p className="text-xs text-gray-500">Earliest</p>
                <p className="font-semibold">{prediction.predicted_date_range.earliest}</p>
              </div>
              <div className="text-gray-400">to</div>
              <div className="rounded-lg bg-blue-50 px-4 py-2 dark:bg-blue-950">
                <p className="text-xs text-gray-500">Latest</p>
                <p className="font-semibold">{prediction.predicted_date_range.latest}</p>
              </div>
            </div>
          </Card>

          {/* Factors */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Factors</CardTitle>
            </CardHeader>
            <ul className="space-y-2">
              {prediction.factors.map((factor, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#0052FF]" />
                  {factor}
                </li>
              ))}
            </ul>
          </Card>

          {/* Disclaimer */}
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/50">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              {prediction.disclaimer}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
