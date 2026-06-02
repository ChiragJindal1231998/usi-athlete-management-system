import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardHeader, CardBody } from "@/components/shared/Card";
import { AIInsight } from "@/components/shared/AIInsight";
import { StatusBadge, statusVariant, readinessVariant } from "@/components/shared/StatusBadge";
import { AthleteDrawer } from "@/components/shared/AthleteDrawer";
import { READINESS_TREND, ROLES } from "@/data/seed";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { stats, alerts, athletes, role, dismissAlert } = useApp();
  const [openId, setOpenId] = useState(null);
  const roleLabel = ROLES.find((r) => r.id === role)?.label || "Director";

  const greeting =
    role === "coach"
      ? "Sprint squad · Coach view"
      : role === "physio"
        ? "Medical operations · Physio view"
        : role === "admin"
          ? "Federation overview"
          : "Performance overview";

  const topAthletes =
    role === "coach"
      ? athletes.filter((a) => a.squad?.startsWith("Sprint")).slice(0, 5)
      : role === "physio"
        ? athletes.filter((a) => a.status !== "available").slice(0, 5)
        : athletes.slice(0, 5);

  const activeAlerts = alerts.filter((a) => a.status === "active");

  const loadBars = athletes.slice(0, 8).map((a) => ({
    name: a.id.split("-")[1] || a.id,
    acwr: Number(a.acwr.toFixed(2)),
    band: 1.3,
  }));

  return (
    <div data-testid="dashboard-page">
      <PageHeader
        title="Command center"
        subtitle={`${greeting} · ${roleLabel}`}
        action={
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600">
            Week 8 · pre-competition
          </div>
        }
      />

      <div className="grid grid-cols-4 gap-4">
        <StatCard testId="stat-total" label="Total athletes" value={stats.total} trend={4} trendLabel="vs last month" />
        <StatCard testId="stat-available" label="Available" value={stats.available} trend={-3} trendLabel="this week" />
        <StatCard testId="stat-injured" label="Injured / rehab" value={stats.injured} trend={2} trendLabel="this week" />
        <StatCard testId="stat-readiness" label="Avg squad readiness" value={stats.avgReadiness} accent suffix="/ 100" trend={-2} />
      </div>

      <div className="mt-6 grid grid-cols-12 gap-4">
        <Card className="col-span-7">
          <CardHeader title="Squad readiness — past 7 days" subtitle="Daily wellness aggregate vs Arjun Sharma (rehab)" />
          <CardBody>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={READINESS_TREND} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} domain={[40, 100]} />
                <Tooltip
                  contentStyle={{
                    border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12, padding: "8px 10px",
                  }}
                />
                <Line type="monotone" dataKey="squad" stroke="#1E40AF" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="arjun" stroke="#DC2626" strokeWidth={2.5} strokeDasharray="5 4" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="h-1 w-3 rounded bg-[#1E40AF]" /> Squad avg</span>
              <span className="flex items-center gap-1.5"><span className="h-1 w-3 rounded bg-[#DC2626]" /> Arjun (rehab)</span>
            </div>
          </CardBody>
        </Card>

        <Card className="col-span-5">
          <CardHeader
            title="Active injury alerts"
            subtitle="Sorted by AI-assessed priority"
            action={<span className="text-xs text-slate-500">{activeAlerts.length} active</span>}
          />
          <CardBody className="space-y-2">
            {activeAlerts.map((a) => {
              const ath = athletes.find((x) => x.id === a.athleteId);
              return (
                <div
                  key={a.id}
                  data-testid={`alert-${a.id}`}
                  onClick={() => setOpenId(a.athleteId)}
                  className="group flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:border-slate-300 hover:bg-slate-50"
                >
                  <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${a.severity === "severe" ? "bg-[#FECACA] text-[#DC2626]" : a.severity === "moderate" ? "bg-[#FED7AA] text-[#EA580C]" : "bg-[#FEF3C7] text-[#D97706]"}`}>
                    <AlertTriangle className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {ath?.name || a.athleteId}
                      </p>
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
            {activeAlerts.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-500">No active alerts.</p>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <AIInsight
            title="AI recommendations · this week"
            confidence={82}
            testId="ai-rec-card"
            action={
              <Button size="sm" className="bg-[#1E40AF] hover:bg-[#1E3A8A]">
                Review in training
              </Button>
            }
          >
            <p>
              <strong>3 athletes</strong> trending toward elevated load this week. ACWR drift detected for Sandeep Yadav (+38%) and Aditya Patel (+24%).
              Arjun Sharma is on a recovery-only block — keep him in rehab progression.
            </p>
          </AIInsight>
        </div>
        <Card className="col-span-5">
          <CardHeader title="Squad workload (ACWR)" subtitle="Bands: <0.8 detrained · 0.8–1.3 optimal · >1.3 elevated" />
          <CardBody>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={loadBars} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="acwr" radius={[4, 4, 0, 0]} fill="#1E40AF" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4">
        <Card>
          <CardHeader title="Athletes — quick view" subtitle={`Filtered for ${roleLabel}`} />
          <CardBody className="p-0">
            <div className="divide-y divide-slate-100">
              {topAthletes.map((a) => (
                <div
                  key={a.id}
                  data-testid={`quick-${a.id}`}
                  onClick={() => setOpenId(a.id)}
                  className="flex cursor-pointer items-center justify-between px-5 py-3 transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                      {a.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{a.name}</p>
                      <p className="text-xs text-slate-500">{a.id} · {a.event}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge variant={readinessVariant(a.readiness)}>R {a.readiness}</StatusBadge>
                    <StatusBadge variant={statusVariant(a.status)}>{a.status}</StatusBadge>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <AthleteDrawer athleteId={openId} open={!!openId} onOpenChange={(o) => !o && setOpenId(null)} />
    </div>
  );
}
