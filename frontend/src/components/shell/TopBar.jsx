import { useApp } from "@/context/AppContext";
import { ROLES, STAFF, ATHLETE_LOGINS, ATHLETES_SEED } from "@/data/seed";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Bell, Search, User2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const SEED_ATHLETE_IDS = new Set(ATHLETES_SEED.map((a) => a.id));
const STAGE_LABEL = {
  invited: "invited — awaiting self-register",
  pending: "self-registered — docs pending",
  review: "docs in review",
  active: "active",
  verified: "verified",
};

export function TopBar() {
  const { role, setRole, athleteId, loginAsAthlete, athletes, alerts, resetDemo } = useApp();
  // Athletes registered at runtime (not in the seed roster) become switchable so
  // the whole fresh-athlete journey can be demoed end to end across stakeholders.
  const registeredLogins = athletes
    .filter((a) => !SEED_ATHLETE_IDS.has(a.id))
    .map((a) => ({
      id: a.id,
      name: a.name,
      note: `${a.event || a.sport || "Athlete"} · ${STAGE_LABEL[a.onboarding] || a.onboarding || "active"}`,
    }));
  const athleteLogins = [...ATHLETE_LOGINS, ...registeredLogins];
  const currentRoleLabel = ROLES.find((r) => r.id === role)?.label;
  const activeAlerts = alerts.filter((a) => a.status === "active").length;
  // For the athlete role, the signed-in profile is the selected athlete, not a fixed staff member.
  const signedInAthlete = athletes.find((a) => a.id === athleteId);
  const signedIn =
    role === "athlete"
      ? { name: signedInAthlete?.name || "Athlete", role: `${signedInAthlete?.event || ""} · ${athleteId}` }
      : STAFF[role];

  return (
    <header
      data-testid="top-bar"
      className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur"
    >
      <div className="flex items-center gap-3">
        <p className="text-sm font-semibold tracking-tight text-slate-900">
          USI <span className="text-slate-300">·</span>{" "}
          <span className="font-medium text-slate-600">Athlete management</span>
        </p>
        <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500 md:inline-block">
          Production
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 md:flex">
          <Search className="h-3.5 w-3.5" />
          <span>Search athletes, sessions, injuries…</span>
          <kbd className="ml-2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
            ⌘K
          </kbd>
        </div>

        <button
          data-testid="topbar-alerts"
          className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
          title="Alerts"
        >
          <Bell className="h-4 w-4" />
          {activeAlerts > 0 && (
            <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#DC2626] px-1 text-[9px] font-semibold text-white ring-2 ring-white">
              {activeAlerts}
            </span>
          )}
        </button>

        <button
          data-testid="reset-demo"
          onClick={() => {
            resetDemo();
            toast.success("Demo state reset — Arjun is back in rehab stage 3");
          }}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
          title="Reset demo to seed state"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Reset</span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              data-testid="role-switcher"
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1E40AF]/10 text-[#1E40AF]">
                <User2 className="h-3.5 w-3.5" />
              </span>
              <span className="hidden md:inline">{currentRoleLabel}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs text-slate-500">
              Viewing as
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {ROLES.filter((r) => r.id !== "athlete").map((r) => (
              <DropdownMenuItem
                key={r.id}
                data-testid={`role-${r.id}`}
                onSelect={() => setRole(r.id)}
                className="cursor-pointer text-sm"
              >
                <span
                  className={`mr-1.5 h-1.5 w-1.5 rounded-full ${role === r.id ? "bg-[#1E40AF]" : "bg-slate-300"}`}
                />
                {r.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Login as athlete
            </DropdownMenuLabel>
            {athleteLogins.map((a) => {
              const active = role === "athlete" && athleteId === a.id;
              return (
                <DropdownMenuItem
                  key={a.id}
                  data-testid={`login-athlete-${a.id}`}
                  onSelect={() => loginAsAthlete(a.id)}
                  className="cursor-pointer text-sm"
                >
                  <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${active ? "bg-[#1E40AF]" : "bg-slate-300"}`} />
                  <span className="flex flex-col">
                    <span>{a.name}</span>
                    <span className="text-[10px] text-slate-400">{a.note}</span>
                  </span>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Signed in
            </DropdownMenuLabel>
            <div className="px-2 py-1.5 text-xs text-slate-600">
              {signedIn?.name || "—"}
              {signedIn?.role && (
                <span className="block text-[10px] text-slate-400">{signedIn.role}</span>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
