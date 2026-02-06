"use client";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface SparklineChartProps {
  data: number[];
  color: string;
  positive: boolean;
}

export function SparklineChart({ data, color, positive }: SparklineChartProps) {
  const chartData = data.map((value, i) => ({ value, i }));
  const strokeColor = positive ? "#00C853" : "#FF1744";

  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={strokeColor}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
