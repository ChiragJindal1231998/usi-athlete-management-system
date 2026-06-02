import { useState } from "react";
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

export default function Analytics() {
  const [drillIdx, setDrillIdx] = useState(0);
  const [exported, setExported] = useState(false);

  return (
    <div data-testid="analytics-page">
      <PageHeader
        title="Analytics & BI"
        subtitle="Federation-level reporting with drill-down to squad and athlete"
        action={
          <Button
            data-testid="export-report"
            className="bg-[#1E40AF] hover:bg-[#1E3A8A]"
            onClick={() => { setExported(true); toast.success("Report generated — Q1 federation overview.pdf"); }}
          >
            {exported ? <><Check className="mr-1.5 h-4 w-4" /> Report ready</> : <><Download className="mr-1.5 h-4 w-4" /> Export report</>}
          </Button>
        }
      />

      {/* Drill-down breadcrumb */}
      <div className="mb-4 flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs">
        {HIERARCHY.map((h, i) => (
          <button
            key={h}
            data-testid={`drill-${i}`}
            onClick={() => setDrillIdx(i)}
            className={`flex items-center gap-1 rounded-md px-2 py-1 transition-colors ${i === drillIdx ? "bg-[#EFF6FF] font-medium text-[#1E40AF]" : "text-slate-500 hover:bg-slate-50"}`}
          >
            {h}
            {i < HIERARCHY.length - 1 && <ChevronRight className="h-3 w-3 text-slate-300" />}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Active athletes" value="77" trend={6} trendLabel="QoQ" />
        <StatCard label="Avg readiness" value="76" trend={-2} suffix="/ 100" />
        <StatCard label="Injury rate · per 1k h" value="6.1" trend={5} trendLabel="rising" />
        <StatCard label="Programs covered" accent value="5" trend={0} />
      </div>

      <div className="mt-4">
        <AIInsight title="Predictive analytics · federation" confidence={71}>
          <p>
            Forecast over next 6 weeks: injury rate is on track to rise to <strong>6.8/1000 h</strong> driven primarily by the throws squad (volume spike) and sprints (early-season aggression).
            Reducing high-intensity blocks by 12% federation-wide could lower projected rate by 0.9.
          </p>
        </AIInsight>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <Card className="col-span-7">
          <CardHeader title={`Readiness trend · ${HIERARCHY[drillIdx]}`} subtitle="7-day rolling average" />
          <CardBody>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={READINESS_TREND} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} domain={[50, 100]} />
                <Tooltip contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="squad" stroke="#1E40AF" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card className="col-span-5">
          <CardHeader title="Injury rate · 6 months" subtitle="Per 1000 athlete-hours" />
          <CardBody>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={FED_ANALYTICS.injuryRate} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
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
          <CardHeader title="Participation by program" subtitle="Available vs total athletes" />
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
