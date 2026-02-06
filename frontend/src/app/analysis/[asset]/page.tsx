"use client";
import { use, useState } from "react";
import Link from "next/link";
import { useAssetPrice } from "@/hooks/useAssets";
import { useAnalysis } from "@/hooks/useAnalysis";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IndicatorPanel } from "@/components/analysis/IndicatorPanel";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { ASSET_ICONS } from "@/lib/constants";

const ASSETS_LIST = [
  { id: "bitcoin", name: "Bitcoin" },
  { id: "ethereum", name: "Ethereum" },
  { id: "solana", name: "Solana" },
  { id: "nasdaq", name: "NASDAQ" },
  { id: "sp500", name: "S&P 500" },
];

const DAYS_OPTIONS = [
  { value: 90, label: "3M" },
  { value: 180, label: "6M" },
  { value: 365, label: "1Y" },
];

export default function AnalysisPage({ params }: { params: Promise<{ asset: string }> }) {
  const { asset: assetId } = use(params);
  const [days, setDays] = useState(365);
  const { asset, isLoading: priceLoading } = useAssetPrice(assetId);
  const { data: indicators, isLoading: indicatorsLoading } = useAnalysis(assetId, days);

  const positive = (asset?.price_change_percentage_24h ?? 0) >= 0;

  return (
    <div className="space-y-8">
      {/* Asset selector */}
      <div className="flex flex-wrap gap-2">
        {ASSETS_LIST.map((a) => (
          <Link key={a.id} href={`/analysis/${a.id}`}>
            <Button
              variant={a.id === assetId ? "primary" : "secondary"}
              size="sm"
            >
              {ASSET_ICONS[a.id]} {a.name}
            </Button>
          </Link>
        ))}
      </div>

      {/* Price header */}
      {priceLoading ? (
        <Card>
          <Skeleton className="h-12 w-48" />
        </Card>
      ) : asset ? (
        <Card>
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-xl"
              style={{ backgroundColor: `${asset.color}20`, color: asset.color }}
            >
              {ASSET_ICONS[asset.id] || asset.symbol[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {asset.name}
                <span className="ml-2 text-sm font-normal text-gray-500">{asset.symbol}</span>
              </h1>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(asset.current_price)}
                </span>
                <span className={`text-sm font-medium ${positive ? "text-green-600" : "text-red-600"}`}>
                  {formatPercent(asset.price_change_percentage_24h)} (24h)
                </span>
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      {/* Time range */}
      <div className="flex gap-2">
        {DAYS_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            variant={days === opt.value ? "primary" : "secondary"}
            size="sm"
            onClick={() => setDays(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {/* Indicators */}
      <IndicatorPanel
        data={indicators}
        isLoading={indicatorsLoading}
        color={asset?.color || "#0052FF"}
      />
    </div>
  );
}
