"use client";
import { useAssets } from "@/hooks/useAssets";
import { useProjection } from "@/hooks/useProjection";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { DCAForm } from "@/components/projections/DCAForm";
import { DCAProjectionChart } from "@/components/charts/DCAProjectionChart";
import { ProjectionTable } from "@/components/projections/ProjectionTable";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

export default function ProjectionsPage() {
  const { assets, isLoading: assetsLoading } = useAssets();
  const { data, error, isLoading, runProjection } = useProjection();

  const assetColor =
    assets?.find((a) => a.id === data?.asset_id)?.color || "#0052FF";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          DCA Projections
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Simulate dollar-cost averaging strategies with historical models
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        {/* Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Configure</CardTitle>
            </CardHeader>
            {assetsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : assets ? (
              <DCAForm assets={assets} onSubmit={runProjection} isLoading={isLoading} />
            ) : null}
          </Card>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {isLoading && (
            <Card>
              <Skeleton className="h-[400px] w-full" />
            </Card>
          )}

          {error && (
            <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
              <p className="text-red-700 dark:text-red-400">{error.message}</p>
            </Card>
          )}

          {data && (
            <>
              {/* Summary */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Invested</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(data.projections[data.projections.length - 1].total_invested)}
                  </p>
                </Card>
                <Card>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Projected Value (Mid)</p>
                  <p className="mt-1 text-2xl font-bold text-[#0052FF]">
                    {formatCurrency(data.projections[data.projections.length - 1].portfolio_value_mid)}
                  </p>
                </Card>
                <Card>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Model</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white capitalize">
                    {data.model_type.replace(/_/g, " ")}
                  </p>
                </Card>
              </div>

              {/* Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {data.asset_name} - {data.duration_years}yr {data.frequency} DCA
                  </CardTitle>
                </CardHeader>
                <DCAProjectionChart data={data.projections} assetColor={assetColor} />
              </Card>

              {/* Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Year-by-Year Breakdown</CardTitle>
                </CardHeader>
                <ProjectionTable data={data.projections} />
              </Card>

              {/* Disclaimer */}
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/50">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  {data.disclaimer}
                </p>
              </div>
            </>
          )}

          {!data && !isLoading && !error && (
            <Card className="flex items-center justify-center py-20">
              <p className="text-gray-400 dark:text-gray-500">
                Configure your DCA strategy and click &quot;Run Projection&quot; to see results
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
