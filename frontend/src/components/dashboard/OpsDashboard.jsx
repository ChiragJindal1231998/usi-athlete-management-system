import { useApp } from "@/context/AppContext";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardHeader, CardBody } from "@/components/shared/Card";
import { AIInsight } from "@/components/shared/AIInsight";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { initialsOf } from "@/components/dashboard/widgets";
import { ONBOARDING_STAGES, PERIODISATION } from "@/data/seed";
import { UserPlus, FileCheck2, CalendarDays, ArrowRight } from "lucide-react";

const STAGE_VARIANT = { invited: "mild", pending: "moderate", review: "rehab", active: "cleared" };

// Operations — onboarding pipeline, document verification queue, scheduling.
export default function OpsDashboard({ onOpenAthlete }) {
  const { athletes, advanceOnboarding } = useApp();

  const pipeline = athletes.filter((a) => a.onboarding !== "active");
  const unverified = athletes.filter((a) => !a.docsVerified);
  const activeCount = athletes.filter((a) => a.onboarding === "active").length;

  // Funnel counts per stage.
  const funnel = ONBOARDING_STAGES.map((s) => ({ stage: s, count: athletes.filter((a) => a.onboarding === s).length }));

  return (
    <div data-testid="dashboard-ops-view">
      <div className="grid grid-cols-4 gap-4">
        <StatCard testId="stat-pipeline" label="In onboarding" value={pipeline.length} accent trend={1} trendLabel="not yet active" />
        <StatCard testId="stat-unverified" label="Docs to verify" value={unverified.length} trend={1} trendLabel="verification queue" />
        <StatCard testId="stat-active" label="Active athletes" value={activeCount} trend={0} trendLabel="fully registered" />
        <StatCard testId="stat-sessions" label="Sessions this week" value={PERIODISATION.micro.filter((d) => d.type !== "Recovery").length} trend={0} trendLabel="scheduled" />
      </div>

      <div className="mt-4">
        <AIInsight title="Operations status · registration & logistics" confidence={80} testId="ai-ops">
          <p>
            <strong>{pipeline.length} athletes</strong> are mid-onboarding and <strong>{unverified.length}</strong> have documents awaiting verification.
            Ritu Kapoor is still at the <strong>invited</strong> stage — chase the federation registration form to unblock her medical clearance.
            All Sprint A session bookings for the week are confirmed.
          </p>
        </AIInsight>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <Card className="col-span-7" data-testid="ops-onboarding-pipeline">
          <CardHeader title="Onboarding pipeline" subtitle="Advance athletes through registration — invited → pending → review → active" action={<span className="flex items-center gap-1 text-xs text-slate-500"><UserPlus className="h-3.5 w-3.5" /> {pipeline.length} in progress</span>} />
          <CardBody className="p-0">
            <div className="grid grid-cols-4 gap-2 px-5 pt-4">
              {funnel.map((f) => (
                <div key={f.stage} className="rounded-lg border border-slate-200 py-2 text-center">
                  <p className="text-lg font-semibold text-slate-900">{f.count}</p>
                  <p className="text-[11px] capitalize text-slate-500">{f.stage}</p>
                </div>
              ))}
            </div>
            <div className="mt-2 divide-y divide-slate-100">
              {pipeline.length === 0 && <p className="px-5 py-6 text-center text-sm text-slate-500">Everyone is fully onboarded.</p>}
              {pipeline.map((a) => (
                <div key={a.id} data-testid={`ops-pipeline-${a.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                  <button onClick={() => onOpenAthlete?.(a.id)} className="flex items-center gap-3 text-left">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">{initialsOf(a.name)}</div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{a.name}</p>
                      <p className="text-xs text-slate-500">{a.id} · {a.event}</p>
                    </div>
                  </button>
                  <div className="flex items-center gap-3">
                    <StatusBadge variant={STAGE_VARIANT[a.onboarding] || "mild"}>{a.onboarding}</StatusBadge>
                    <button
                      data-testid={`ops-advance-${a.id}`}
                      onClick={() => advanceOnboarding(a.id)}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-[#1E40AF] hover:bg-slate-50"
                    >
                      Advance <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className="col-span-5" data-testid="ops-verification-queue">
          <CardHeader title="Document verification" subtitle="Awaiting compliance sign-off" action={<span className="flex items-center gap-1 text-xs text-slate-500"><FileCheck2 className="h-3.5 w-3.5" /> {unverified.length} pending</span>} />
          <CardBody className="p-0">
            <div className="divide-y divide-slate-100">
              {unverified.length === 0 && <p className="px-5 py-6 text-center text-sm text-slate-500">All documents verified.</p>}
              {unverified.map((a) => (
                <button key={a.id} data-testid={`ops-verify-${a.id}`} onClick={() => onOpenAthlete?.(a.id)} className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-slate-50">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{a.name}</p>
                    <p className="text-xs text-slate-500">Registration + medical clearance</p>
                  </div>
                  <StatusBadge variant="moderate">unverified</StatusBadge>
                </button>
              ))}
            </div>
            <div className="border-t border-slate-100 px-5 py-3">
              <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><CalendarDays className="h-3.5 w-3.5" /> This week's schedule</p>
              <div className="mt-2 space-y-1.5">
                {PERIODISATION.micro.filter((d) => d.type !== "Recovery").slice(0, 4).map((d) => (
                  <div key={d.day} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{d.day}</span>
                    <span className="text-slate-500">{d.session}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
