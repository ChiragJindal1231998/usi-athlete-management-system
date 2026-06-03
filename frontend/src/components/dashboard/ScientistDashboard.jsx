import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardHeader, CardBody } from "@/components/shared/Card";
import { AIInsight } from "@/components/shared/AIInsight";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { BarChart, Bar, ScatterChart, Scatter, Cell, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from "recharts";
import { Activity, ArrowRight } from "lucide-react";

// Sports scientist — squad-wide load/ACWR monitoring, anomaly detection, highest-risk by load.
// Framed around the whole monitored squad, not a single athlete.
export default function ScientistDashboard({ onOpenAthlete }) {
  const { athletes } = useApp();

  // Highest mechanical risk first — ACWR outside the safe band is the headline signal.
  const byLoad = [...athletes].sort((a, b) => b.acwr - a.acwr);
  const elevated = byLoad.filter((a) => a.acwr > 1.3);
  const detrained = byLoad.filter((a) => a.acwr < 0.8);
  const avgAcwr = athletes.length ? Number((athletes.reduce((s, a) => s + a.acwr, 0) / athletes.length).toFixed(2)) : 0;
  const loadBars = byLoad.slice(0, 8).map((a) => ({ name: a.name.split(" ")[0], acwr: Number(a.acwr.toFixed(2)) }));

  // Whole-squad scatter: workload (ACWR) against readiness — the population view.
  const scatter = athletes.map((a) => ({
    name: a.name,
    acwr: Number(a.acwr.toFixed(2)),
    readiness: a.readiness,
    risk: a.acwr > 1.3 || a.readiness < 60,
  }));

  const top = byLoad[0];
  const second = byLoad[1];

  return (
    <div data-testid="dashboard-scientist-view">
      <div className="grid grid-cols-4 gap-4">
        <StatCard testId="stat-elevated" label="Elevated ACWR" value={elevated.length} accent trend={1} trendLabel="> 1.30 band" />
        <StatCard testId="stat-peak-acwr" label="Highest ACWR" value={top?.acwr.toFixed(2)} trend={1} trendLabel={top?.name} />
        <StatCard testId="stat-avg-acwr" label="Squad avg ACWR" value={avgAcwr.toFixed(2)} trend={0} trendLabel="0.8–1.3 optimal" />
        <StatCard testId="stat-monitored" label="Athletes monitored" value={athletes.length} trend={0} trendLabel="wearables live" />
      </div>

      <div className="mt-4">
        <AIInsight title="Anomaly detection · squad load + autonomic signals" confidence={78} testId="ai-scientist">
          <p>
            <strong>{elevated.length} athletes</strong> are above the 1.30 acute:chronic band and carry elevated tissue-overload risk.
            {top && (
              <> <strong>{top.name}</strong> ({top.acwr.toFixed(2)}) and <strong>{second?.name}</strong> ({second?.acwr.toFixed(2)}) are the highest mechanical-risk cases —
              the model recommends a 10–15% volume taper before the next high-intensity block.</>
            )}
            {detrained.length > 0 && <> {detrained.length} athlete{detrained.length > 1 ? "s are" : " is"} detrained (ACWR &lt; 0.8) and can absorb more load.</>}
          </p>
        </AIInsight>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <Card className="col-span-7" data-testid="scientist-acwr-chart">
          <CardHeader
            title="Acute:chronic workload ratio"
            subtitle="Per athlete · shaded band 0.8–1.3 optimal"
            action={
              <Link to="/sports-science" data-testid="scientist-open-science" className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-[#1E40AF] hover:bg-slate-50">
                <Activity className="h-3.5 w-3.5" /> Load lab
              </Link>
            }
          />
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={loadBars} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <ReferenceArea y1={0.8} y2={1.3} fill="#DBEAFE" fillOpacity={0.5} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} domain={[0, 1.8]} />
                <Tooltip contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="acwr" radius={[4, 4, 0, 0]} fill="#1E40AF" />
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-2 text-[11px] text-slate-500">Blue band = optimal load. Bars above it carry elevated tissue-overload risk.</p>
          </CardBody>
        </Card>

        <Card className="col-span-5" data-testid="scientist-scatter-chart">
          <CardHeader title="Squad · load vs readiness" subtitle="Each point is an athlete — red = flagged" />
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <ScatterChart margin={{ top: 8, right: 16, left: -20, bottom: 4 }}>
                <CartesianGrid stroke="#F1F5F9" />
                <ReferenceArea x1={0.8} x2={1.3} fill="#DBEAFE" fillOpacity={0.5} />
                <XAxis type="number" dataKey="acwr" name="ACWR" domain={[0.7, 1.7]} stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis type="number" dataKey="readiness" name="Readiness" domain={[40, 100]} stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <ZAxis range={[60, 60]} />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} formatter={(v, n) => [v, n]} labelFormatter={() => ""} />
                <Scatter data={scatter}>
                  {scatter.map((d, i) => (
                    <Cell key={i} fill={d.risk ? "#DC2626" : "#1E40AF"} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <p className="mt-2 text-[11px] text-slate-500">High ACWR with low readiness (top-right shaded edge → bottom) is the danger quadrant.</p>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4">
        <Card data-testid="scientist-risk-table">
          <CardHeader title="Highest mechanical risk" subtitle="Ranked by acute:chronic workload ratio — click to open profile" />
          <CardBody className="p-0">
            <div className="divide-y divide-slate-100">
              {byLoad.slice(0, 6).map((a) => {
                const band = a.acwr > 1.3 ? "severe" : a.acwr < 0.8 ? "mild" : "cleared";
                return (
                  <button key={a.id} data-testid={`scientist-risk-${a.id}`} onClick={() => onOpenAthlete?.(a.id)} className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-slate-50">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{a.name}</p>
                      <p className="text-xs text-slate-500">{a.event} · {a.squad}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-900">ACWR {a.acwr.toFixed(2)}</span>
                      <StatusBadge variant={band}>{a.acwr > 1.3 ? "elevated" : a.acwr < 0.8 ? "detrained" : "optimal"}</StatusBadge>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
                    </div>
                  </button>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
