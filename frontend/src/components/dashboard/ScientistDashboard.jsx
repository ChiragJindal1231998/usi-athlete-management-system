import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardHeader, CardBody } from "@/components/shared/Card";
import { AIInsight } from "@/components/shared/AIInsight";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from "recharts";
import { Activity, ArrowRight } from "lucide-react";

// Sports scientist — data-first: load/ACWR/HRV signals, anomaly detection, highest-risk by load.
export default function ScientistDashboard({ onOpenAthlete }) {
  const { athletes } = useApp();
  const arjun = athletes.find((a) => a.id === "SPR-014");

  // Highest mechanical risk first — ACWR outside the safe band is the headline signal.
  const byLoad = [...athletes].sort((a, b) => b.acwr - a.acwr);
  const elevated = byLoad.filter((a) => a.acwr > 1.3);
  const loadBars = byLoad.slice(0, 8).map((a) => ({ name: a.name.split(" ")[0], acwr: Number(a.acwr.toFixed(2)) }));

  // Arjun's HRV series — the signal that fired the prediction.
  const hrvSeries = (arjun?.hrv || []).map((v, i) => ({ day: `D${i + 1}`, hrv: v }));
  const avgHrv = hrvSeries.length ? Math.round(hrvSeries.reduce((s, d) => s + d.hrv, 0) / hrvSeries.length) : 0;

  return (
    <div data-testid="dashboard-scientist-view">
      <div className="grid grid-cols-4 gap-4">
        <StatCard testId="stat-elevated" label="Elevated ACWR" value={elevated.length} accent trend={1} trendLabel="> 1.30 band" />
        <StatCard testId="stat-peak-acwr" label="Highest ACWR" value={byLoad[0]?.acwr.toFixed(2)} trend={1} trendLabel={byLoad[0]?.name} />
        <StatCard testId="stat-hrv" label="Arjun HRV (7d avg)" value={`${avgHrv} ms`} trend={-1} trendLabel="suppressed" />
        <StatCard testId="stat-monitored" label="Athletes monitored" value={athletes.length} trend={0} trendLabel="wearables live" />
      </div>

      <div className="mt-4">
        <AIInsight title="Anomaly detection · load + autonomic signals" confidence={78} testId="ai-scientist">
          <p>
            The model flagged <strong>Arjun Sharma</strong> 4 days pre-injury on a combined signal: ACWR spiking to <strong>1.52</strong>,
            HRV dropping <strong>{Math.max(...(arjun?.hrv || [0]))}→{Math.min(...(arjun?.hrv || [0]))} ms</strong>, and a soreness spike.
            Currently watching <strong>{elevated.length} athletes</strong> above the 1.30 band — Sandeep Yadav (1.41) is the next-highest mechanical risk.
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

        <Card className="col-span-5" data-testid="scientist-hrv-chart">
          <CardHeader title="Arjun · HRV trend" subtitle="Autonomic recovery — the pre-injury dip" />
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={hrvSeries} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="hrvFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#DC2626" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#DC2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} domain={[40, 70]} />
                <Tooltip contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="hrv" stroke="#DC2626" strokeWidth={2.5} fill="url(#hrvFill)" />
              </AreaChart>
            </ResponsiveContainer>
            <p className="mt-2 text-[11px] text-slate-500">HRV bottomed at the injury window, now recovering through rehab.</p>
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
