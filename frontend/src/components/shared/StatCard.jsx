import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function StatCard({ label, value, trend, trendLabel, accent = false, testId, suffix }) {
  const Icon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor =
    trend > 0 ? "text-emerald-600" : trend < 0 ? "text-red-600" : "text-slate-500";
  return (
    <div
      data-testid={testId}
      className={cn(
        "rounded-xl border bg-white p-5 transition-shadow hover:shadow-sm",
        accent ? "border-[#1E40AF]/20" : "border-slate-200"
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        {accent && <span className="ai-pulse-dot h-1.5 w-1.5 rounded-full bg-[#1E40AF]" />}
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold tracking-tight text-slate-900">
          {value}
        </span>
        {suffix && <span className="text-sm text-slate-500">{suffix}</span>}
      </div>
      {trend !== undefined && (
        <div className={cn("mt-2 flex items-center gap-1 text-xs", trendColor)}>
          <Icon className="h-3.5 w-3.5" />
          <span className="font-medium">
            {trend > 0 ? "+" : ""}
            {trend}
            {typeof trend === "number" ? "%" : ""}
          </span>
          {trendLabel && <span className="text-slate-500">· {trendLabel}</span>}
        </div>
      )}
    </div>
  );
}
