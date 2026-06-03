import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardHeader, CardBody } from "@/components/shared/Card";
import { AIInsight } from "@/components/shared/AIInsight";
import { StatusBadge, statusVariant, readinessVariant } from "@/components/shared/StatusBadge";
import { AthleteList } from "@/components/dashboard/widgets";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { CalendarDays, ArrowRight } from "lucide-react";

const ATT_STYLE = {
  present: "text-[#065F46]",
  late: "text-[#92400E]",
  absent: "text-[#991B1B]",
  excused: "text-slate-500",
};

// Coach — their squad (Sprint A): roster, today's session, attendance, attention list.
export default function CoachDashboard({ onOpenAthlete }) {
  const { athletes, alerts, microPlan, attendance, aiLoadAccepted } = useApp();
  const squad = athletes.filter((a) => a.squad === "Sprint A");
  const attention = squad.filter((a) => a.status !== "available" || a.readiness < 70 || a.acwr > 1.3);
  const squadAlerts = alerts.filter((a) => a.status === "active" && squad.some((s) => s.id === a.athleteId));

  // Today's session = first non-rest day in the microcycle.
  const today = microPlan.find((d) => d.type !== "Recovery") || microPlan[0];
  const attCounts = attendance.roster.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {});

  const loadBars = squad.map((a) => ({ name: a.name.split(" ")[0], acwr: Number(a.acwr.toFixed(2)) }));

  return (
    <div data-testid="dashboard-coach-view">
      <div className="grid grid-cols-4 gap-4">
        <StatCard testId="stat-squad" label="Squad size" value={squad.length} trend={0} trendLabel="Sprint A" />
        <StatCard testId="stat-available" label="Available" value={squad.filter((a) => a.status === "available").length} trend={-1} />
        <StatCard testId="stat-attention" label="Need attention" value={attention.length} accent trend={1} trendLabel="load / injury / wellness" />
        <StatCard testId="stat-present" label="Present today" value={`${attCounts.present || 0}/${attendance.roster.length}`} trend={0} trendLabel="session roster" />
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <Card className="col-span-5" data-testid="coach-today-session">
          <CardHeader
            title="Today's session"
            subtitle={<span className="flex items-center gap-1.5 text-xs text-slate-500"><CalendarDays className="h-3 w-3" /> {today?.day} · {aiLoadAccepted ? "AI-adjusted plan" : "Standard plan"}</span>}
          />
          <CardBody>
            <div className="rounded-lg bg-slate-50 p-4">
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">{today?.type}</span>
              <p className="mt-2 text-base font-semibold text-slate-900">{today?.session}</p>
              <p className="mt-1 text-xs text-slate-500">Planned load · {today?.load}</p>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
              {["present", "late", "absent", "excused"].map((k) => (
                <div key={k} className="rounded-lg border border-slate-200 py-2">
                  <p className={`text-lg font-semibold ${ATT_STYLE[k]}`}>{attCounts[k] || 0}</p>
                  <p className="capitalize text-slate-500">{k}</p>
                </div>
              ))}
            </div>
            <Link to="/training" data-testid="coach-open-training" className="mt-3 flex items-center justify-center gap-1 rounded-lg border border-slate-200 py-2 text-xs font-medium text-[#1E40AF] hover:bg-slate-50">
              Open training & attendance <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardBody>
        </Card>

        <Card className="col-span-7">
          <CardHeader title="Squad workload (ACWR)" subtitle="Sprint A · band 0.8–1.3 optimal" />
          <CardBody>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={loadBars} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} domain={[0, 1.8]} />
                <Tooltip contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
                <ReferenceLine y={1.3} stroke="#DC2626" strokeDasharray="4 4" />
                <Bar dataKey="acwr" radius={[4, 4, 0, 0]} fill="#1E40AF" />
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-2 text-[11px] text-slate-500">Red line = upper safe band (1.3). Bars above it need a load conversation.</p>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4">
        <AIInsight title="Coaching focus · this week" confidence={78} testId="ai-coach">
          <p>
            <strong>{attention.length} of {squad.length}</strong> Sprint A athletes need attention. Lead item: Arjun Sharma is on a
            recovery-only block (rehab day 14) — keep him out of max-velocity work. Watch Neha Joshi&rsquo;s ACWR drift.
            {!aiLoadAccepted && " A load-reduction recommendation is pending acceptance in Training."}
          </p>
        </AIInsight>
      </div>

      <div className="mt-4">
        <Card>
          <CardHeader title="Sprint A roster" subtitle="Athletes needing attention surface first" />
          <CardBody className="p-0">
            <AthleteList
              rows={[...squad].sort((a, b) => Number(attention.includes(b)) - Number(attention.includes(a)))}
              onOpen={onOpenAthlete}
              testIdPrefix="coach-athlete"
              meta={(a) => (
                <>
                  <StatusBadge variant={readinessVariant(a.readiness)}>R {a.readiness}</StatusBadge>
                  <StatusBadge variant={statusVariant(a.status)}>{a.status}</StatusBadge>
                </>
              )}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
