import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/shared/Card";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { NUTRITION_PLAN } from "@/data/seed";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Droplet, Pill, UtensilsCrossed } from "lucide-react";

export default function Nutrition() {
  const { athletes } = useApp();
  const arjun = athletes.find((a) => a.id === "SPR-014");

  const adherenceData = NUTRITION_PLAN.adherenceWeek.map((v, i) => ({ day: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i], adherence: v }));
  const hydration = NUTRITION_PLAN.hydrationLitres.map((v, i) => ({ day: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i], litres: v }));
  const avgAdherence = Math.round(NUTRITION_PLAN.adherenceWeek.reduce((s, x) => s + x, 0) / 7);

  return (
    <div data-testid="nutrition-page">
      <PageHeader
        title="Nutrition"
        subtitle="Diet plans, hydration, supplements and body composition trends"
      />

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Daily kcal target" value={NUTRITION_PLAN.kcalTarget.toLocaleString()} trend={0} trendLabel="recovery phase" />
        <StatCard label="Plan adherence" value={`${avgAdherence}%`} trend={-7} trendLabel="rehab dip" />
        <StatCard label="Avg hydration" value="2.9" suffix="L / day" trend={-9} />
        <StatCard label="Body fat" value="9.5%" trend={-1} trendLabel="vs Wk 1" />
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <Card className="col-span-7">
          <CardHeader title="Plan adherence · this week" subtitle="Percent of prescribed meals logged & compliant" />
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={adherenceData} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="adh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} domain={[50, 100]} />
                <Tooltip contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="adherence" stroke="#059669" strokeWidth={2.5} fill="url(#adh)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card className="col-span-5">
          <CardHeader title="Daily plan · Arjun" subtitle="Macro split for recovery phase" />
          <CardBody className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <Macro label="Carbs" value={`${NUTRITION_PLAN.macros.carbs} g`} pct={56} color="#1E40AF" />
              <Macro label="Protein" value={`${NUTRITION_PLAN.macros.protein} g`} pct={22} color="#059669" />
              <Macro label="Fat" value={`${NUTRITION_PLAN.macros.fat} g`} pct={22} color="#EA580C" />
            </div>
            <div className="space-y-1 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
              <p className="font-medium text-slate-900"><UtensilsCrossed className="mr-1 inline h-3.5 w-3.5" /> Meal schedule</p>
              <p>· Breakfast 07:00 — oats + eggs + berries</p>
              <p>· Mid-AM 10:30 — Greek yoghurt + banana</p>
              <p>· Lunch 13:00 — grilled chicken, brown rice, veg</p>
              <p>· Pre-train 16:00 — fruit + whey</p>
              <p>· Dinner 19:30 — salmon, sweet potato, salad</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <Card className="col-span-5">
          <CardHeader title="Hydration · 7 days" subtitle="Daily litres logged" />
          <CardBody>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={hydration} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} domain={[2, 4]} />
                <Tooltip contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="litres" stroke="#1E40AF" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card className="col-span-7">
          <CardHeader title="Supplements" subtitle="Compliance over the past 14 days" />
          <CardBody className="space-y-2">
            {NUTRITION_PLAN.supplements.map((s) => (
              <div key={s.name} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 text-sm">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#1E40AF]"><Pill className="h-3.5 w-3.5" /></div>
                  <div>
                    <p className="font-medium text-slate-900">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.dose}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full" style={{ width: `${s.compliance}%`, background: s.compliance > 85 ? "#059669" : s.compliance > 75 ? "#EA580C" : "#DC2626" }} />
                  </div>
                  <StatusBadge variant={s.compliance > 85 ? "cleared" : s.compliance > 75 ? "moderate" : "severe"}>{s.compliance}%</StatusBadge>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="mt-4">
        <Card>
          <CardHeader title="Body composition trend · Arjun" subtitle="Weekly DEXA estimate" />
          <CardBody>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={arjun.bodyComp} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="bodyfat" stroke="#EA580C" strokeWidth={2.5} dot={{ r: 3 }} name="Body fat %" />
                <Line type="monotone" dataKey="lean" stroke="#1E40AF" strokeWidth={2.5} dot={{ r: 3 }} name="Lean mass (kg)" />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="h-1 w-3 rounded bg-[#EA580C]" /> Body fat %</span>
              <span className="flex items-center gap-1.5"><span className="h-1 w-3 rounded bg-[#1E40AF]" /> Lean mass (kg)</span>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Macro({ label, value, pct, color }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-900">{value}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <p className="mt-1 text-[10px] text-slate-500">{pct}% of kcal</p>
    </div>
  );
}
