"use client";
import {
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { IndicatorData } from "@/lib/types";

interface IndicatorChartProps {
  data: IndicatorData;
  color: string;
}

export function IndicatorChart({ data, color }: IndicatorChartProps) {
  const chartData = data.timestamps.map((ts, i) => ({
    timestamp: ts,
    price: data.prices[i],
    sma_20: data.sma_20[i],
    sma_50: data.sma_50[i],
    ema_12: data.ema_12[i],
    ema_26: data.ema_26[i],
  }));

  const rsiData = data.timestamps.map((ts, i) => ({
    timestamp: ts,
    rsi: data.rsi_14[i],
  }));

  const macdData = data.timestamps.map((ts, i) => ({
    timestamp: ts,
    macd: data.macd_line[i],
    signal: data.macd_signal[i],
    histogram: data.macd_histogram[i],
  }));

  return (
    <div className="space-y-4">
      {/* Price + SMA/EMA overlay */}
      <div>
        <h4 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
          Price & Moving Averages
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="timestamp" tickFormatter={formatDate} className="text-xs" minTickGap={50} />
            <YAxis tickFormatter={(v) => formatCurrency(v, 0)} className="text-xs" />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              labelFormatter={(ts) => formatDate(Number(ts))}
              contentStyle={{ backgroundColor: "rgba(255,255,255,0.95)", border: "1px solid #e5e7eb", borderRadius: "8px" }}
            />
            <Area type="monotone" dataKey="price" stroke={color} fill={color} fillOpacity={0.1} strokeWidth={2} name="Price" />
            <Line type="monotone" dataKey="sma_20" stroke="#F59E0B" strokeWidth={1} dot={false} name="SMA 20" />
            <Line type="monotone" dataKey="sma_50" stroke="#8B5CF6" strokeWidth={1} dot={false} name="SMA 50" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* RSI */}
      <div>
        <h4 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
          RSI (14)
        </h4>
        <ResponsiveContainer width="100%" height={150}>
          <ComposedChart data={rsiData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="timestamp" tickFormatter={formatDate} className="text-xs" minTickGap={50} />
            <YAxis domain={[0, 100]} className="text-xs" />
            <Tooltip
              formatter={(value) => Number(value).toFixed(2)}
              labelFormatter={(ts) => formatDate(Number(ts))}
              contentStyle={{ backgroundColor: "rgba(255,255,255,0.95)", border: "1px solid #e5e7eb", borderRadius: "8px" }}
            />
            <ReferenceLine y={70} stroke="#FF1744" strokeDasharray="3 3" />
            <ReferenceLine y={30} stroke="#00C853" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="rsi" stroke="#0052FF" strokeWidth={1.5} dot={false} name="RSI" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* MACD */}
      <div>
        <h4 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
          MACD
        </h4>
        <ResponsiveContainer width="100%" height={150}>
          <ComposedChart data={macdData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="timestamp" tickFormatter={formatDate} className="text-xs" minTickGap={50} />
            <YAxis className="text-xs" />
            <Tooltip
              formatter={(value) => Number(value).toFixed(4)}
              labelFormatter={(ts) => formatDate(Number(ts))}
              contentStyle={{ backgroundColor: "rgba(255,255,255,0.95)", border: "1px solid #e5e7eb", borderRadius: "8px" }}
            />
            <ReferenceLine y={0} stroke="#9CA3AF" />
            <Bar dataKey="histogram" name="Histogram" fill="#93C5FD" />
            <Line type="monotone" dataKey="macd" stroke="#0052FF" strokeWidth={1.5} dot={false} name="MACD" />
            <Line type="monotone" dataKey="signal" stroke="#FF1744" strokeWidth={1.5} dot={false} name="Signal" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
