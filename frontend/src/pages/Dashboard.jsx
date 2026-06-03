import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { AthleteDrawer } from "@/components/shared/AthleteDrawer";
import { ROLES, STAFF } from "@/data/seed";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import DirectorDashboard from "@/components/dashboard/DirectorDashboard";
import CoachDashboard from "@/components/dashboard/CoachDashboard";
import PhysioDashboard from "@/components/dashboard/PhysioDashboard";
import ScientistDashboard from "@/components/dashboard/ScientistDashboard";
import NutritionistDashboard from "@/components/dashboard/NutritionistDashboard";
import OpsDashboard from "@/components/dashboard/OpsDashboard";
import AthleteSelfView from "@/components/dashboard/AthleteSelfView";

// Each role lands on a job-specific view. The dashboard is a thin router that
// dispatches by role and owns the shared athlete drawer.
const VIEWS = {
  admin: AdminDashboard,
  director: DirectorDashboard,
  coach: CoachDashboard,
  physio: PhysioDashboard,
  scientist: ScientistDashboard,
  nutritionist: NutritionistDashboard,
  ops: OpsDashboard,
  athlete: AthleteSelfView,
};

// Role-aware header copy: what this persona is here to do and the scope they own.
const HEADER = {
  admin: { title: "Federation command center", scope: "All squads · org-wide" },
  director: { title: "Performance overview", scope: "Selection & risk · all programs" },
  coach: { title: "Squad command center", scope: "Sprint A · today's training" },
  physio: { title: "Medical operations", scope: "Return-to-play & wellness" },
  scientist: { title: "Performance science", scope: "Load, recovery & anomaly detection" },
  nutritionist: { title: "Nutrition & fuelling", scope: "Compliance · all athletes" },
  ops: { title: "Operations & logistics", scope: "Onboarding · documents · scheduling" },
  athlete: { title: "My day", scope: "Personal · readiness, rehab & tasks" },
};

export default function Dashboard() {
  const { role } = useApp();
  const [openId, setOpenId] = useState(null);

  const View = VIEWS[role] || DirectorDashboard;
  const head = HEADER[role] || HEADER.director;
  const roleLabel = ROLES.find((r) => r.id === role)?.label || "Performance director";
  const staff = STAFF[role];
  const isAthlete = role === "athlete";

  return (
    <div data-testid="dashboard-page">
      {!isAthlete && (
        <PageHeader
          title={head.title}
          subtitle={`${roleLabel}${staff ? ` · ${staff.name}` : ""} · ${head.scope}`}
          testId={`dashboard-header-${role}`}
          action={
            <div className="flex items-center gap-2">
              <span data-testid="role-context-chip" className="flex items-center gap-1.5 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1.5 text-xs font-medium text-[#1E40AF]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1E40AF]" /> {roleLabel}
              </span>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600">
                Week 8 · pre-competition
              </div>
            </div>
          }
        />
      )}

      <View onOpenAthlete={setOpenId} />

      <AthleteDrawer athleteId={openId} open={!!openId} onOpenChange={(o) => !o && setOpenId(null)} />
    </div>
  );
}
