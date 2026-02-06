"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, TrendingUp, Activity, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/projections", label: "Projections", icon: TrendingUp },
  { href: "/analysis/bitcoin", label: "Analysis", icon: Activity },
  { href: "/ath", label: "ATH Predictions", icon: Target },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0052FF] text-white font-bold text-sm">
            IP
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            InvestPredict
          </span>
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href.split("/").slice(0, 2).join("/")));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-[#0052FF] dark:bg-blue-950 dark:text-blue-400"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                )}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>

        {/* Mobile nav */}
        <div className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 sm:hidden">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href.split("/").slice(0, 2).join("/")));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-2 text-xs",
                  isActive
                    ? "text-[#0052FF] dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400"
                )}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
