import { useApp } from "@/context/AppContext";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardHeader, CardBody } from "@/components/shared/Card";
import { AIInsight } from "@/components/shared/AIInsight";
import { AlertList } from "@/components/dashboard/widgets";
import { FED_ANALYTICS } from "@/data/seed";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Federation Admin — org-wide overview across every squad.
export default function AdminDashboard({ onOpenAthlete }) {
  const { stats, athletes, alerts } = useApp();
  const activeAlerts = alerts.filter((a) => a.status === "active");

  // Aggregate by squad.
  const squads = [...new Set(athletes.map((a) => a.squad))].map((squad) => {
    const members = athletes.filter((a) => a.squad === squad);
    const injured = members.filter((a) => a.status !== "available").length;
    const avgReadiness = Math.round(members.reduce((s, a) => s + a.readiness, 0) / members.length);
    return { squad, count: members.length, injured, avgReadiness };
  });

  // Org-level framing — name the squads carrying load, not individual athletes.
  const loadedSquads = squads
    .filter((s) => s.injured > 0)
    .sort((a, b) => b.injured - a.injured)
    .map((s) => s.squad);
  const loadedLabel =
    loadedSquads.length === 0
      ? "no squad"
      : loadedSquads.length === 1
        ? loadedSquads[0]
        : `${loadedSquads.slice(0, -1).join(", ")} and ${loadedSquads[loadedSquads.length - 1]}`;

  return (
    <div data-testid="dashboard-admin-view">
      <div className="grid grid-cols-4 gap-4">
        <StatCard testId="stat-total" label="Total athletes" value={stats.total} trend={4} trendLabel="vs last month" />
        <StatCard testId="stat-available" label="Available" value={stats.available} trend={-3} trendLabel="this week" />
        <StatCard testId="stat-injured" label="Injured / rehab" value={stats.injured} trend={2} trendLabel="this week" />
        <StatCard testId="stat-readiness" label="Avg readiness" value={stats.avgReadiness} accent suffix="/ 100" trend={-2} />
      </div>

      <div className="mt-4">
        <AIInsight title="Federation health · this week" confidence={80} testId="ai-admin">
          <p>
            Across <strong>{stats.total} athletes</strong> in {squads.length} squads, availability is at{" "}
            <strong>{Math.round((stats.available / stats.total) * 100)}%</strong> with <strong>{stats.injured}</strong> currently in rehab or
            return-to-play. The <strong>{loadedLabel}</strong> {loadedSquads.length > 1 ? "squads" : "squad"} carry the active injury load.
            No federation-wide compliance or registration breaches outstanding.
          </p>
        </AIInsight>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <Card className="col-span-7" data-testid="admin-squad-breakdown">
          <CardHeader title="Squad breakdown" subtitle="Headcount, availability and average readiness per squad" />
          <CardBody className="p-0">
            <div className="divide-y divide-slate-100">
              {squads.map((s) => (
                <div key={s.squad} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{s.squad}</p>
                    <p className="text-xs text-slate-500">{s.count} athletes · {s.injured} unavailable</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full bg-[#1E40AF]" style={{ width: `${s.avgReadiness}%` }} />
                    </div>
                    <span className="w-10 text-right text-sm font-semibold text-slate-900">{s.avgReadiness}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className="col-span-5">
          <CardHeader title="Active alerts" subtitle="AI-prioritised, all squads" action={<span className="text-xs text-slate-500">{activeAlerts.length} active</span>} />
          <CardBody>
            <AlertList alerts={activeAlerts} athletes={athletes} onOpen={onOpenAthlete} />
          </CardBody>
        </Card>
      </div>

      <div className="mt-4">
        <Card>
          <CardHeader title="Participation by program" subtitle="Available vs total athletes — federation-wide" />
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={FED_ANALYTICS.participation} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="program" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="athletes" radius={[4, 4, 0, 0]} fill="#94A3B8" />
                <Bar dataKey="available" radius={[4, 4, 0, 0]} fill="#1E40AF" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="h-1 w-3 rounded bg-[#94A3B8]" /> Total roster</span>
              <span className="flex items-center gap-1.5"><span className="h-1 w-3 rounded bg-[#1E40AF]" /> Available</span>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
