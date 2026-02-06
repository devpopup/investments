"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ProjectionPoint } from "@/lib/types";
import { formatCompactCurrency } from "@/lib/utils";

interface DCAProjectionChartProps {
  data: ProjectionPoint[];
  assetColor: string;
}

export function DCAProjectionChart({ data, assetColor }: DCAProjectionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorMid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={assetColor} stopOpacity={0.3} />
            <stop offset="95%" stopColor={assetColor} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6B7280" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#6B7280" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis
          dataKey="year"
          tickFormatter={(y) => `Year ${y}`}
          className="text-xs"
        />
        <YAxis
          tickFormatter={(v) => formatCompactCurrency(v)}
          className="text-xs"
        />
        <Tooltip
          formatter={(value) => formatCompactCurrency(Number(value))}
          labelFormatter={(y) => `Year ${y}`}
          contentStyle={{
            backgroundColor: "rgba(255,255,255,0.95)",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
          }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="portfolio_value_high"
          name="High Estimate"
          stroke="#00C853"
          fill="none"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        <Area
          type="monotone"
          dataKey="portfolio_value_mid"
          name="Mid Estimate"
          stroke={assetColor}
          fill="url(#colorMid)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="portfolio_value_low"
          name="Low Estimate"
          stroke="#FF1744"
          fill="none"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        <Area
          type="monotone"
          dataKey="total_invested"
          name="Total Invested"
          stroke="#6B7280"
          fill="url(#colorInvested)"
          strokeWidth={1.5}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
