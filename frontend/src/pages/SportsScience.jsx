import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/shared/Card";
import { AIInsight } from "@/components/shared/AIInsight";
import { StatCard } from "@/components/shared/StatCard";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, ComposedChart, Legend, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea,
} from "recharts";

export default function SportsScience() {
  const { athletes } = useApp();
  const arjun = athletes.find((a) => a.id === "SPR-014");

  const loadData = arjun.weeklyLoad.map((w, idx) => ({ week: `W${idx + 1}`, load: w }));
  const hrvData = arjun.hrv.map((h, idx) => ({ day: `D${idx + 1}`, hrv: h }));
  const sleepData = arjun.sleep.map((s, idx) => ({ day: `D${idx + 1}`, sleep: s }));
  const gps = arjun.gps || [];
  const peakSpeed = gps.length ? Math.max(...gps.map((g) => g.maxSpeed)) : 0;
  const totalDistance = gps.reduce((s, g) => s + g.total, 0);
  const totalHsr = gps.reduce((s, g) => s + g.hsr, 0);

  return (
    <div data-testid="sports-science-page">
      <PageHeader
        title="Sports science"
        subtitle="Readiness, fatigue and recovery analytics — the data feed behind the injury predictions"
      />

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="HRV (ms)" value={arjun.hrv[arjun.hrv.length - 1]} trend={-12} trendLabel="vs baseline" />
        <StatCard label="Sleep (h)" value={arjun.sleep[arjun.sleep.length - 1]} trend={-4} suffix="hrs" />
        <StatCard label="Weekly load" value={arjun.weeklyLoad[arjun.weeklyLoad.length - 1]} trend={-25} suffix="AU" />
        <StatCard label="ACWR" accent value={arjun.acwr.toFixed(2)} trend={-22} trendLabel="post-adjustment" />
      </div>

      <div className="mt-4">
        <AIInsight title="Risk detection · how Arjun's injury was predicted" confidence={78} testId="ss-ai-explain">
          <p className="mb-2">
            The system fused three signals into a 78% hamstring-injury probability four days before the strain:
          </p>
          <ol className="ml-4 list-decimal space-y-1 text-sm">
            <li><strong>Workload</strong> — ACWR breached 1.5 (sweet spot 0.8–1.3) on week 7.</li>
            <li><strong>Recovery</strong> — HRV trend dropped 18% over 5 days; sleep below 7 h for 3 nights.</li>
            <li><strong>Wellness</strong> — Self-reported soreness rose from 4 to 7 between Wed–Sat.</li>
          </ol>
        </AIInsight>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <Card className="col-span-6">
          <CardHeader title="Training load · 8 weeks" subtitle="Daily-aggregated arbitrary units" />
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={loadData} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="load" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1E40AF" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#1E40AF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="week" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="load" stroke="#1E40AF" strokeWidth={2.5} fill="url(#load)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card className="col-span-6">
          <CardHeader title="Heart-rate variability · 9 days" subtitle="Vagal recovery indicator (lnRMSSD, ms)" />
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={hrvData} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} domain={[40, 70]} />
                <Tooltip contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
                <ReferenceArea y1={40} y2={50} fill="#DC2626" fillOpacity={0.06} />
                <Line type="monotone" dataKey="hrv" stroke="#1E40AF" strokeWidth={2.5} dot={{ r: 3, fill: "#1E40AF" }} />
              </LineChart>
            </ResponsiveContainer>
            <p className="mt-2 text-[11px] text-slate-500">Red band marks suppressed recovery. Arjun dipped on D6–D7.</p>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <Card className="col-span-6">
          <CardHeader title="Sleep duration · 9 days" subtitle="Aim ≥7.5 h for elite recovery" />
          <CardBody>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sleepData} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} domain={[5, 9]} />
                <Tooltip contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="sleep" radius={[4, 4, 0, 0]} fill="#1E40AF" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card className="col-span-6">
          <CardHeader title="Recovery actions taken" subtitle="Sports science team interventions" />
          <CardBody className="space-y-2">
            {[
              { name: "Cryotherapy session", date: "12 Feb", status: "Completed" },
              { name: "Soft-tissue release · hamstring", date: "14 Feb", status: "Completed" },
              { name: "Sleep extension protocol", date: "Ongoing", status: "Active" },
              { name: "Magnesium + omega-3 protocol", date: "Ongoing", status: "Active" },
              { name: "Pool recovery", date: "15 Feb", status: "Scheduled" },
            ].map((r) => (
              <div key={r.name} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 text-sm">
                <div>
                  <p className="font-medium text-slate-900">{r.name}</p>
                  <p className="text-xs text-slate-500">{r.date}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${r.status === "Completed" ? "bg-[#D1FAE5] text-[#065F46]" : r.status === "Active" ? "bg-[#DBEAFE] text-[#1D4ED8]" : "bg-slate-100 text-slate-600"}`}>{r.status}</span>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      {/* GPS / external load tracking */}
      <div className="mt-4 grid grid-cols-12 gap-4">
        <Card className="col-span-8" data-testid="gps-card">
          <CardHeader
            title="GPS · external load (last 7 sessions)"
            subtitle="Total distance, high-speed running (>19.8 km/h) and sprint distance (>25 km/h)"
          />
          <CardBody>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={gps} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis yAxisId="dist" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis yAxisId="speed" orientation="right" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} domain={[15, 38]} unit=" km/h" />
                <Tooltip contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="dist" dataKey="total" name="Total (m)" radius={[4, 4, 0, 0]} fill="#BFDBFE" />
                <Bar yAxisId="dist" dataKey="hsr" name="HSR (m)" radius={[4, 4, 0, 0]} fill="#1E40AF" />
                <Bar yAxisId="dist" dataKey="sprint" name="Sprint (m)" radius={[4, 4, 0, 0]} fill="#DC2626" />
                <Line yAxisId="speed" type="monotone" dataKey="maxSpeed" name="Max speed (km/h)" stroke="#059669" strokeWidth={2.5} dot={{ r: 3, fill: "#059669" }} />
              </ComposedChart>
            </ResponsiveContainer>
            <p className="mt-2 text-[11px] text-slate-500">
              Note the D4 &amp; D7 drops — recovery sessions during rehab. Sprint exposure deliberately suppressed while hamstring loads back up.
            </p>
          </CardBody>
        </Card>

        <Card className="col-span-4">
          <CardHeader title="GPS summary" subtitle="Rolling 7-session totals" />
          <CardBody className="space-y-3">
            <GpsStat label="Peak speed" value={`${peakSpeed.toFixed(1)} km/h`} sub="92% of pre-injury best (37.8)" />
            <GpsStat label="Total distance" value={`${(totalDistance / 1000).toFixed(1)} km`} sub="across 7 sessions" />
            <GpsStat label="High-speed running" value={`${(totalHsr / 1000).toFixed(2)} km`} sub="building toward 6 km/wk target" />
            <GpsStat label="Sprint distance" value={`${gps.reduce((s, g) => s + g.sprint, 0)} m`} sub="capped during rehab" />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function GpsStat({ label, value, sub }) {
  return (
    <div className="rounded-lg border border-slate-200 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-0.5 text-lg font-semibold text-slate-900">{value}</p>
      <p className="text-[11px] text-slate-500">{sub}</p>
    </div>
  );
}
