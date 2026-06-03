import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/shared/Card";
import { AIInsight } from "@/components/shared/AIInsight";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { FED_ANALYTICS, READINESS_TREND } from "@/data/seed";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Download, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";

const HIERARCHY = ["Federation", "Athletics", "Sprints", "Sprint A"];

// How each drill level scopes the roster + scales federation-wide series.
const LEVEL = {
  Federation: { filter: () => true, fedActive: 77, rateFactor: 1.0, programs: null },
  Athletics: { filter: () => true, fedActive: null, rateFactor: 1.05, programs: null },
  Sprints: { filter: (a) => a.squad?.startsWith("Sprint"), fedActive: null, rateFactor: 1.2, programs: ["Sprints"] },
  "Sprint A": { filter: (a) => a.squad === "Sprint A", fedActive: null, rateFactor: 1.45, programs: ["Sprint A"] },
};

function csvEscape(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function Analytics() {
  const { athletes, can } = useApp();
  const canExport = can("analytics.export");
  const [drillIdx, setDrillIdx] = useState(0);
  const [exported, setExported] = useState(false);

  const level = HIERARCHY[drillIdx];
  const cfg = LEVEL[level];

  // The drill level changes the actual cohort the whole page reports on.
  const cohort = useMemo(() => athletes.filter(cfg.filter), [athletes, cfg]);

  const metrics = useMemo(() => {
    const active = cfg.fedActive ?? cohort.length;
    const avgReadiness = cohort.length
      ? Math.round(cohort.reduce((s, a) => s + a.readiness, 0) / cohort.length)
      : 0;
    const injured = cohort.filter((a) => a.status !== "available").length;
    const programs = cfg.programs ? cfg.programs.length : FED_ANALYTICS.participation.length;

    // Shift the federation readiness curve so its mean matches the cohort average.
    const base = READINESS_TREND.reduce((s, d) => s + d.squad, 0) / READINESS_TREND.length;
    const delta = avgReadiness - base;
    const readinessTrend = READINESS_TREND.map((d) => ({ day: d.day, value: Math.round(d.squad + delta) }));

    // Scale the injury-rate history by the level's relative load.
    const injuryRate = FED_ANALYTICS.injuryRate.map((m) => ({ month: m.month, rate: Number((m.rate * cfg.rateFactor).toFixed(1)) }));

    // Participation: federation/athletics show every program; deeper levels show
    // a single bar computed from the real roster cohort.
    const participation = cfg.programs
      ? [{ program: level, athletes: cohort.length, available: cohort.filter((a) => a.status === "available").length }]
      : FED_ANALYTICS.participation;

    return { active, avgReadiness, injured, programs, readinessTrend, injuryRate, participation };
  }, [cohort, cfg, level]);

  const handleExport = () => {
    const header = ["Athlete ID", "Name", "Squad", "Status", "Readiness", "ACWR", "Talent score", "Nutrition adherence %"];
    const lines = cohort.map((a) =>
      [a.id, a.name, a.squad, a.status, a.readiness, a.acwr, a.talentScore ?? "", a.nutritionAdherence ?? ""].map(csvEscape).join(",")
    );
    const summary = [
      `# USI federation report — ${level}`,
      `# Generated ${new Date().toISOString().slice(0, 10)}`,
      `# Cohort size: ${cohort.length} · Avg readiness: ${metrics.avgReadiness} · Unavailable: ${metrics.injured}`,
      "",
    ];
    const csv = [...summary, header.map(csvEscape).join(","), ...lines].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `usi-report-${level.toLowerCase().replace(/\s+/g, "-")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExported(true);
    toast.success(`Report downloaded — ${a.download} (${cohort.length} athletes)`);
  };

  return (
    <div data-testid="analytics-page">
      <PageHeader
        title="Analytics & BI"
        subtitle="Federation-level reporting with drill-down to squad and athlete"
        action={canExport && (
          <Button
            data-testid="export-report"
            className="bg-[#1E40AF] hover:bg-[#1E3A8A]"
            onClick={handleExport}
          >
            {exported ? <><Check className="mr-1.5 h-4 w-4" /> Report ready</> : <><Download className="mr-1.5 h-4 w-4" /> Export report</>}
          </Button>
        )}
      />

      {/* Drill-down breadcrumb — changes the cohort the whole page reports on */}
      <div className="mb-4 flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs">
        {HIERARCHY.map((h, i) => (
          <button
            key={h}
            data-testid={`drill-${i}`}
            onClick={() => { setDrillIdx(i); setExported(false); }}
            className={`flex items-center gap-1 rounded-md px-2 py-1 transition-colors ${i === drillIdx ? "bg-[#EFF6FF] font-medium text-[#1E40AF]" : "text-slate-500 hover:bg-slate-50"}`}
          >
            {h}
            {i < HIERARCHY.length - 1 && <ChevronRight className="h-3 w-3 text-slate-300" />}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard testId="an-active" label="Active athletes" value={metrics.active} trend={6} trendLabel={level} />
        <StatCard testId="an-readiness" label="Avg readiness" value={metrics.avgReadiness} trend={-2} suffix="/ 100" />
        <StatCard testId="an-injrate" label="Injury rate · per 1k h" value={metrics.injuryRate[metrics.injuryRate.length - 1].rate} trend={5} trendLabel="rising" />
        <StatCard testId="an-programs" label={cfg.programs ? "Unavailable" : "Programs covered"} accent value={cfg.programs ? metrics.injured : metrics.programs} trend={0} />
      </div>

      <div className="mt-4">
        <AIInsight title={`Predictive analytics · ${level}`} confidence={71}>
          <p>
            Reporting on <strong>{cohort.length} athletes</strong> at the <strong>{level}</strong> level — average readiness <strong>{metrics.avgReadiness}</strong>,
            {" "}{metrics.injured} currently unavailable. Forecast injury rate is trending to <strong>{(metrics.injuryRate[metrics.injuryRate.length - 1].rate * 1.1).toFixed(1)}/1000 h</strong>;
            {level === "Sprint A"
              ? " Sprint A carries the heaviest load — Arjun, Manish and Neha are all non-competing."
              : " reducing high-intensity blocks by 12% could lower the projected rate by ~0.9."}
          </p>
        </AIInsight>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <Card className="col-span-7">
          <CardHeader title={`Readiness trend · ${level}`} subtitle="7-day rolling average" />
          <CardBody>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={metrics.readinessTrend} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} domain={[40, 100]} />
                <Tooltip contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="value" stroke="#1E40AF" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card className="col-span-5">
          <CardHeader title={`Injury rate · ${level}`} subtitle="Per 1000 athlete-hours · 6 months" />
          <CardBody>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={metrics.injuryRate} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="rate" radius={[4, 4, 0, 0]} fill="#DC2626" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4">
        <Card>
          <CardHeader title="Participation by program" subtitle={cfg.programs ? `Scoped to ${level}` : "Available vs total athletes"} />
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={metrics.participation} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
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
