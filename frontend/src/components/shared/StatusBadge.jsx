import { cn } from "@/lib/utils";

const VARIANTS = {
  healthy: "bg-slate-100 text-slate-700 ring-slate-200",
  available: "bg-slate-100 text-slate-700 ring-slate-200",
  good: "bg-slate-100 text-slate-700 ring-slate-200",
  mild: "bg-[#FEF3C7] text-[#92400E] ring-[#FCD34D]/60",
  low: "bg-[#FEF3C7] text-[#92400E] ring-[#FCD34D]/60",
  moderate: "bg-[#FED7AA] text-[#9A3412] ring-[#FB923C]/60",
  medium: "bg-[#FED7AA] text-[#9A3412] ring-[#FB923C]/60",
  severe: "bg-[#FECACA] text-[#991B1B] ring-[#F87171]/60",
  high: "bg-[#FECACA] text-[#991B1B] ring-[#F87171]/60",
  danger: "bg-[#FECACA] text-[#991B1B] ring-[#F87171]/60",
  rehab: "bg-[#DBEAFE] text-[#1D4ED8] ring-[#60A5FA]/60",
  progress: "bg-[#DBEAFE] text-[#1D4ED8] ring-[#60A5FA]/60",
  injured: "bg-[#FECACA] text-[#991B1B] ring-[#F87171]/60",
  cleared: "bg-[#D1FAE5] text-[#065F46] ring-[#34D399]/60",
  success: "bg-[#D1FAE5] text-[#065F46] ring-[#34D399]/60",
};

export function StatusBadge({ variant = "healthy", children, className, ...rest }) {
  const cls = VARIANTS[variant] || VARIANTS.healthy;
  return (
    <span
      data-testid={rest["data-testid"]}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        cls,
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
      {children}
    </span>
  );
}

export function readinessVariant(score) {
  if (score >= 80) return "cleared";
  if (score >= 70) return "healthy";
  if (score >= 60) return "mild";
  if (score >= 50) return "moderate";
  return "severe";
}

export function statusVariant(status) {
  if (status === "available") return "cleared";
  if (status === "injured") return "severe";
  if (status === "rehab") return "rehab";
  return "healthy";
}
