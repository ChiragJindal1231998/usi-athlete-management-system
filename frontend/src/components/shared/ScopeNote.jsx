import { Eye, Lock } from "lucide-react";

// Small inline banner that tells the user what slice of data they're seeing and
// whether the view is read-only. Driven by the RBAC layer (scopeLabel + readOnly).
// Keeps every module honest about role-based scoping without hiding the tab.
export function ScopeNote({ scopeLabel, readOnly = false, note, testId = "scope-note" }) {
  return (
    <div
      data-testid={testId}
      className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600"
    >
      {readOnly ? (
        <Lock className="h-3.5 w-3.5 text-slate-400" />
      ) : (
        <Eye className="h-3.5 w-3.5 text-slate-400" />
      )}
      <span className="font-medium text-slate-700">Viewing:</span>
      <span>{scopeLabel}</span>
      {readOnly && (
        <span className="ml-1 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Read-only
        </span>
      )}
      {note && <span className="ml-1 text-slate-400">· {note}</span>}
    </div>
  );
}
