"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { SignalBadge } from "./SignalBadge";
import { IndicatorChart } from "@/components/charts/IndicatorChart";
import { Skeleton } from "@/components/ui/Skeleton";
import type { IndicatorResponse } from "@/lib/types";

interface IndicatorPanelProps {
  data: IndicatorResponse | undefined;
  isLoading: boolean;
  color: string;
}

const signalLabels: Record<string, string> = {
  sma_crossover: "SMA Crossover",
  rsi: "RSI",
  macd: "MACD",
  trend: "Trend",
};

export function IndicatorPanel({ data, isLoading, color }: IndicatorPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[150px] w-full" />
        <Skeleton className="h-[150px] w-full" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Signals</CardTitle>
        </CardHeader>
        <div className="flex flex-wrap gap-4">
          {Object.entries(data.signals).map(([key, value]) => (
            <SignalBadge
              key={key}
              label={signalLabels[key] || key}
              value={value}
            />
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Technical Indicators</CardTitle>
        </CardHeader>
        <IndicatorChart data={data.data} color={color} />
      </Card>
    </div>
  );
}
