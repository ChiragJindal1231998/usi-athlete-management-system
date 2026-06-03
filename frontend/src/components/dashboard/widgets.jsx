// Shared building blocks for the role-differentiated dashboards.
// Keep these lean — they lean on the existing design-system components.
import { StatusBadge, statusVariant, readinessVariant } from "@/components/shared/StatusBadge";
import { AlertTriangle, ChevronRight } from "lucide-react";

const SEV_ICON_STYLE = {
  severe: "bg-[#FECACA] text-[#DC2626]",
  moderate: "bg-[#FED7AA] text-[#EA580C]",
  mild: "bg-[#FEF3C7] text-[#D97706]",
};

export function initialsOf(name = "") {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("");
}

// AI-prioritised alert list (reused by admin / director / coach / physio).
export function AlertList({ alerts, athletes, onOpen, emptyLabel = "No active alerts." }) {
  if (!alerts.length) {
    return <p className="py-4 text-center text-sm text-slate-500">{emptyLabel}</p>;
  }
  return (
    <div className="space-y-2">
      {alerts.map((a) => {
        const ath = athletes.find((x) => x.id === a.athleteId);
        return (
          <div
            key={a.id}
            data-testid={`alert-${a.id}`}
            onClick={() => onOpen?.(a.athleteId)}
            className="group flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${SEV_ICON_STYLE[a.severity] || SEV_ICON_STYLE.mild}`}>
              <AlertTriangle className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-slate-900">{ath?.name || a.athleteId}</p>
                <StatusBadge variant={a.severity}>{a.severity}</StatusBadge>
                {a.aiGenerated && <span className="rounded-full bg-[#EFF6FF] px-1.5 py-0.5 text-[9px] font-medium text-[#1E40AF]">AI</span>}
              </div>
              <p className="mt-0.5 truncate text-xs font-medium text-slate-700">{a.title}</p>
              <p className="mt-0.5 truncate text-[11px] text-slate-500">{a.detail}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500" />
          </div>
        );
      })}
    </div>
  );
}

// Compact athlete row list. `meta` renders the right-hand cell per athlete.
export function AthleteList({ rows, onOpen, meta, testIdPrefix = "quick" }) {
  if (!rows.length) {
    return <p className="px-5 py-6 text-center text-sm text-slate-500">No athletes match this view.</p>;
  }
  return (
    <div className="divide-y divide-slate-100">
      {rows.map((a) => (
        <div
          key={a.id}
          data-testid={`${testIdPrefix}-${a.id}`}
          onClick={() => onOpen?.(a.id)}
          className="flex cursor-pointer items-center justify-between px-5 py-3 transition-colors hover:bg-slate-50"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
              {initialsOf(a.name)}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{a.name}</p>
              <p className="text-xs text-slate-500">{a.id} · {a.event}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {meta ? meta(a) : (
              <>
                <StatusBadge variant={readinessVariant(a.readiness)}>R {a.readiness}</StatusBadge>
                <StatusBadge variant={statusVariant(a.status)}>{a.status}</StatusBadge>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
