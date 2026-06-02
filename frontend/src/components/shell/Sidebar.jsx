import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Activity,
  HeartPulse,
  FlaskConical,
  Apple,
  Target,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true, id: "nav-dashboard" },
  { to: "/athletes", label: "Athletes", icon: Users, id: "nav-athletes" },
  { to: "/training", label: "Training", icon: Activity, id: "nav-training" },
  { to: "/medical", label: "Medical & injury", icon: HeartPulse, id: "nav-medical" },
  { to: "/sports-science", label: "Sports science", icon: FlaskConical, id: "nav-sports-science" },
  { to: "/nutrition", label: "Nutrition", icon: Apple, id: "nav-nutrition" },
  { to: "/assessments", label: "Assessments & TID", icon: Target, id: "nav-assessments" },
  { to: "/analytics", label: "Analytics & BI", icon: BarChart3, id: "nav-analytics" },
  { to: "/copilot", label: "AI copilot", icon: Sparkles, id: "nav-copilot" },
];

export function Sidebar() {
  return (
    <aside
      data-testid="sidebar"
      className="fixed left-0 top-0 z-30 flex h-screen w-60 flex-col border-r border-slate-200 bg-white"
    >
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E40AF] text-white shadow-sm">
          <span className="text-[13px] font-bold tracking-tight">U</span>
        </div>
        <div className="leading-tight">
          <p className="text-[13px] font-semibold tracking-tight text-slate-900">
            USI
          </p>
          <p className="text-[11px] text-slate-500">Athlete management</p>
        </div>
      </div>

      <div className="px-3 pb-2 pt-1">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Modules
        </p>
        <nav className="flex flex-col gap-0.5">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              data-testid={item.id}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-[#1E40AF] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600")}
                  />
                  <span className="truncate font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto border-t border-slate-100 p-4">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Demo build
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Athlete Management v0.9 · Operational prototype
          </p>
        </div>
      </div>
    </aside>
  );
}
