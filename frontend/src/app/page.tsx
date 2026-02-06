"use client";
import Link from "next/link";
import { useAssets } from "@/hooks/useAssets";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { SparklineChart } from "@/components/charts/SparklineChart";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { ASSET_ICONS } from "@/lib/constants";
import { TrendingUp, Activity, Target } from "lucide-react";

export default function Dashboard() {
  const { assets, isLoading, error } = useAssets();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Market Overview
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Track prices and explore investment projections
        </p>
      </div>

      {/* Asset Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="space-y-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-10 w-full" />
              </Card>
            ))
          : assets?.map((asset) => {
              const positive = (asset.price_change_percentage_24h ?? 0) >= 0;
              return (
                <Link key={asset.id} href={`/analysis/${asset.id}`}>
                  <Card className="cursor-pointer transition-shadow hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
                          style={{ backgroundColor: `${asset.color}20`, color: asset.color }}
                        >
                          {ASSET_ICONS[asset.id] || asset.symbol[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {asset.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {asset.symbol}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(asset.current_price)}
                        </p>
                        <p
                          className={`text-sm font-medium ${
                            positive ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {formatPercent(asset.price_change_percentage_24h)}
                        </p>
                      </div>
                      <div className="w-24">
                        {asset.sparkline_7d && asset.sparkline_7d.length > 0 && (
                          <SparklineChart
                            data={asset.sparkline_7d}
                            color={asset.color}
                            positive={positive}
                          />
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <p className="text-red-700 dark:text-red-400">
            Failed to load market data. Make sure the backend is running on port 8000.
          </p>
        </Card>
      )}

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/projections">
          <Card className="group cursor-pointer transition-shadow hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-[#0052FF] dark:bg-blue-950">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-[#0052FF] dark:text-white">
                  DCA Projections
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Simulate investment strategies
                </p>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/analysis/bitcoin">
          <Card className="group cursor-pointer transition-shadow hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950">
                <Activity size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-purple-600 dark:text-white">
                  Technical Analysis
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  SMA, RSI, MACD indicators
                </p>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/ath">
          <Card className="group cursor-pointer transition-shadow hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950">
                <Target size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-amber-600 dark:text-white">
                  ATH Predictions
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  All-time high forecasts
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
