// Federation → Program → Squad drill-down used by the Admin / Director dashboards.
// Selecting a level re-scopes the surrounding dashboard data IN PLACE (KPIs, charts,
// lists, AI insight all recompute from the scoped roster). This is what makes the
// dashboard demonstrate both hierarchy filtering and drill-down analytics.
import { SQUAD_PROGRAM, PROGRAM_SQUADS } from "@/data/seed";
import { ChevronRight } from "lucide-react";

// Narrow an athlete list to the current {program, squad} selection.
export function scopeByHierarchy(athletes, { program, squad }) {
  return athletes.filter((a) => {
    if (squad) return a.squad === squad;
    if (program) return SQUAD_PROGRAM[a.squad] === program;
    return true;
  });
}

// Short label for the active scope (used in headings / AI insight copy).
export function hierarchyLabel({ program, squad }) {
  if (squad) return squad;
  if (program) return `${program} program`;
  return "Federation-wide";
}

export function HierarchyFilter({ athletes, value, onChange }) {
  const { program, squad } = value;

  // Options at the current drill level, each with a live athlete count.
  let level = null;
  let options = [];
  if (!program) {
    level = "program";
    options = Object.keys(PROGRAM_SQUADS)
      .map((p) => ({ key: p, count: athletes.filter((a) => SQUAD_PROGRAM[a.squad] === p).length }))
      .filter((o) => o.count > 0);
  } else if (!squad) {
    level = "squad";
    options = (PROGRAM_SQUADS[program] || [])
      .map((s) => ({ key: s, count: athletes.filter((a) => a.squad === s).length }))
      .filter((o) => o.count > 0);
  }

  const crumb = (label, target, testId, active) => (
    <button
      key={testId}
      data-testid={testId}
      onClick={() => onChange(target)}
      className={`rounded-md px-2 py-0.5 transition-colors ${active ? "font-semibold text-[#1E40AF]" : "text-slate-500 hover:text-slate-700"}`}
    >
      {label}
    </button>
  );

  return (
    <div data-testid="hierarchy-filter" className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      {/* Breadcrumb — click any segment to jump back up the hierarchy */}
      <div className="flex items-center gap-0.5 text-xs">
        {crumb("Federation", { program: null, squad: null }, "crumb-federation", !program)}
        {program && (
          <>
            <ChevronRight className="h-3 w-3 text-slate-300" />
            {crumb(program, { program, squad: null }, "crumb-program", !!program && !squad)}
          </>
        )}
        {squad && (
          <>
            <ChevronRight className="h-3 w-3 text-slate-300" />
            {crumb(squad, { program, squad }, "crumb-squad", true)}
          </>
        )}
      </div>

      {/* Drill options for the current level */}
      {level && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {options.map((o) => (
            <button
              key={o.key}
              data-testid={`drill-${level}-${o.key.replace(/\s+/g, "-").toLowerCase()}`}
              onClick={() => onChange(level === "program" ? { program: o.key, squad: null } : { program, squad: o.key })}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-[#1E40AF]/30 hover:bg-[#EFF6FF]"
            >
              {o.key}
              <span className="rounded-full bg-slate-100 px-1.5 text-[10px] text-slate-500">{o.count}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
