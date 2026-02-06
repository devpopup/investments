import { cn } from "@/lib/utils";

interface SignalBadgeProps {
  label: string;
  value: string;
}

const colorMap: Record<string, string> = {
  bullish: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  bearish: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  overbought: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  oversold: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  neutral: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  above_sma50: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  below_sma50: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export function SignalBadge({ label, value }: SignalBadgeProps) {
  const colorClass = colorMap[value] || colorMap.neutral;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}:</span>
      <span
        className={cn(
          "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
          colorClass
        )}
      >
        {value.replace(/_/g, " ")}
      </span>
    </div>
  );
}
