import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardHeader, CardBody } from "@/components/shared/Card";
import { AIInsight } from "@/components/shared/AIInsight";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { NUTRITION_PLAN } from "@/data/seed";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Apple, ArrowRight } from "lucide-react";

// Nutritionist — compliance across athletes, who's drifting, body-composition flags.
export default function NutritionistDashboard({ onOpenAthlete }) {
  const { athletes } = useApp();

  const adherence = (a) => a.nutritionAdherence ?? 80;
  // Lowest adherence first — surface the drifters who need a conversation.
  const ranked = [...athletes].sort((a, b) => adherence(a) - adherence(b));
  const drifting = ranked.filter((a) => adherence(a) < 80);
  const avgAdherence = Math.round(athletes.reduce((s, a) => s + adherence(a), 0) / athletes.length);
  const onTrack = athletes.filter((a) => adherence(a) >= 85).length;

  const adherenceTrend = NUTRITION_PLAN.adherenceWeek.map((v, i) => ({ day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i], adherence: v }));

  return (
    <div data-testid="dashboard-nutritionist-view">
      <div className="grid grid-cols-4 gap-4">
        <StatCard testId="stat-avg-adherence" label="Avg adherence" value={avgAdherence} accent suffix="%" trend={-1} trendLabel="plan compliance" />
        <StatCard testId="stat-drifting" label="Drifting" value={drifting.length} trend={1} trendLabel="< 80% adherence" />
        <StatCard testId="stat-ontrack" label="On track" value={onTrack} trend={0} trendLabel="≥ 85%" />
        <StatCard testId="stat-lowest" label="Lowest adherence" value={`${adherence(ranked[0])}%`} trend={-1} trendLabel={ranked[0]?.name} />
      </div>

      <div className="mt-4">
        <AIInsight title="Fuelling compliance · this week" confidence={76} testId="ai-nutritionist">
          <p>
            <strong>{drifting.length} athletes</strong> are drifting below 80% plan adherence. <strong>{ranked[0]?.name}</strong> ({adherence(ranked[0])}%)
            is the priority — adherence dipped alongside his shoulder load spike. Arjun Sharma is holding at <strong>{adherence(athletes.find((a) => a.id === "SPR-014"))}%</strong>;
            his rehab block needs the protein target held to protect lean mass during reduced training.
          </p>
        </AIInsight>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <Card className="col-span-7" data-testid="nutritionist-compliance">
          <CardHeader
            title="Adherence by athlete"
            subtitle="Lowest first — these need a fuelling check-in"
            action={
              <Link to="/nutrition" data-testid="nutritionist-open-nutrition" className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-[#1E40AF] hover:bg-slate-50">
                <Apple className="h-3.5 w-3.5" /> Nutrition plans
              </Link>
            }
          />
          <CardBody className="p-0">
            <div className="divide-y divide-slate-100">
              {ranked.slice(0, 7).map((a) => {
                const v = adherence(a);
                const variant = v < 75 ? "severe" : v < 85 ? "mild" : "cleared";
                const barColor = v < 75 ? "bg-[#DC2626]" : v < 85 ? "bg-[#D97706]" : "bg-[#1E40AF]";
                return (
                  <button key={a.id} data-testid={`nutritionist-row-${a.id}`} onClick={() => onOpenAthlete?.(a.id)} className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-slate-50">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">{a.name}</p>
                      <p className="text-xs text-slate-500">{a.event} · {a.squad}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full ${barColor}`} style={{ width: `${v}%` }} />
                      </div>
                      <StatusBadge variant={variant}>{v}%</StatusBadge>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardBody>
        </Card>

        <Card className="col-span-5" data-testid="nutritionist-trend">
          <CardHeader title="Arjun · weekly adherence" subtitle="Plan compliance dipped over the rehab week" />
          <CardBody>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={adherenceTrend} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="adhFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1E40AF" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#1E40AF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} domain={[50, 100]} />
                <Tooltip contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
                <ReferenceLine y={80} stroke="#DC2626" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="adherence" stroke="#1E40AF" strokeWidth={2.5} fill="url(#adhFill)" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg border border-slate-200 py-2">
                <p className="text-base font-semibold text-slate-900">{NUTRITION_PLAN.kcalTarget}</p>
                <p className="text-slate-500">kcal target</p>
              </div>
              <div className="rounded-lg border border-slate-200 py-2">
                <p className="text-base font-semibold text-slate-900">{NUTRITION_PLAN.macros.protein}g</p>
                <p className="text-slate-500">protein</p>
              </div>
              <div className="rounded-lg border border-slate-200 py-2">
                <p className="text-base font-semibold text-slate-900">{NUTRITION_PLAN.macros.carbs}g</p>
                <p className="text-slate-500">carbs</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
