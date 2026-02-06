"use client";
import type { ProjectionPoint } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface ProjectionTableProps {
  data: ProjectionPoint[];
}

export function ProjectionTable({ data }: ProjectionTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Year</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Invested</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Low</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Mid</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">High</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Units</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const midReturn = ((row.portfolio_value_mid - row.total_invested) / row.total_invested) * 100;
            return (
              <tr
                key={row.year}
                className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
              >
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                  Year {row.year}
                </td>
                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                  {formatCurrency(row.total_invested)}
                </td>
                <td className="px-4 py-3 text-right text-red-600 dark:text-red-400">
                  {formatCurrency(row.portfolio_value_low)}
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                  {formatCurrency(row.portfolio_value_mid)}
                  <span
                    className={`ml-1 text-xs ${midReturn >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    ({midReturn >= 0 ? "+" : ""}{midReturn.toFixed(1)}%)
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-green-600 dark:text-green-400">
                  {formatCurrency(row.portfolio_value_high)}
                </td>
                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                  {formatNumber(row.units_held, 6)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
