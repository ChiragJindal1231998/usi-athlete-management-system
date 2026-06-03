import { useApp } from "@/context/AppContext";
import { AIInsight } from "@/components/shared/AIInsight";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { REHAB_STAGES, WELLNESS_CHECKINS, NUTRITION_PLAN } from "@/data/seed";
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";
import { Activity, HeartPulse, Apple, CheckCircle2, Circle, Dumbbell, Moon } from "lucide-react";

// Athlete self-view (Arjun) — mobile-first, phone-shaped column inside the web app.
export default function AthleteSelfView() {
  const { athletes, injuries, microPlan } = useApp();
  const me = athletes.find((a) => a.id === "SPR-014") || athletes[0];
  const injury = injuries.find((i) => i.athleteId === me.id && i.stage !== "Cleared");
  const stageIdx = injury ? REHAB_STAGES.indexOf(injury.stage) : -1;

  const today = microPlan.find((d) => d.type === "Recovery") || microPlan[0];
  const checkin = WELLNESS_CHECKINS[WELLNESS_CHECKINS.length - 1];
  const readinessData = [{ name: "readiness", value: me.readiness, fill: me.readiness >= 70 ? "#1E40AF" : me.readiness >= 55 ? "#D97706" : "#DC2626" }];

  const tasks = [
    { label: "Morning wellness check-in", done: true },
    { label: "Eccentric hamstring set (Nordics ×3)", done: true },
    { label: "Pool recovery session · 4pm", done: false },
    { label: "Log dinner — hit protein target", done: false },
  ];

  return (
    <div data-testid="dashboard-athlete-view" className="flex justify-center">
      {/* Phone frame */}
      <div className="w-full max-w-[420px]">
        <div className="overflow-hidden rounded-[2rem] border-8 border-slate-900 bg-[#F8FAFC] shadow-2xl">
          {/* Status bar / notch */}
          <div className="relative bg-slate-900 py-2">
            <div className="mx-auto h-1.5 w-24 rounded-full bg-slate-700" />
          </div>

          <div className="max-h-[760px] overflow-y-auto px-4 py-5">
            {/* Greeting */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Good morning</p>
                <p className="text-lg font-semibold text-slate-900">{me.name.split(" ")[0]}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E40AF] text-sm font-semibold text-white">
                {me.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
            </div>

            {/* Readiness ring */}
            <div data-testid="athlete-readiness" className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="relative h-28 w-28 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart innerRadius="72%" outerRadius="100%" data={readinessData} startAngle={90} endAngle={-270}>
                      <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                      <RadialBar background dataKey="value" cornerRadius={20} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-slate-900">{me.readiness}</span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400">readiness</span>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">Recovery day</p>
                  <p className="mt-1 text-xs text-slate-500">Readiness is below your baseline. Stick to the rehab plan — no max-velocity work today.</p>
                  <div className="mt-2 flex gap-2">
                    <StatusBadge variant="rehab">{me.status}</StatusBadge>
                    <StatusBadge variant="mild">ACWR {me.acwr.toFixed(2)}</StatusBadge>
                  </div>
                </div>
              </div>
            </div>

            {/* AI insight */}
            <div className="mt-4">
              <AIInsight title="Your rehab · today" confidence={78} testId="ai-athlete">
                <p className="text-sm">
                  You&rsquo;re on <strong>day 14</strong>, stage 3 of 5. Eccentric strength is <strong>78%</strong> of your healthy side —
                  target 90% before return-to-play. Estimated clearance: <strong>8–12 days</strong>. Keep nailing the Nordics.
                </p>
              </AIInsight>
            </div>

            {/* Rehab progress */}
            {injury && (
              <div data-testid="athlete-rehab" className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <HeartPulse className="h-4 w-4 text-[#1E40AF]" />
                  <p className="text-sm font-semibold text-slate-900">Rehab progress</p>
                </div>
                <p className="mt-1 text-xs text-slate-500">{injury.diagnosis} · day {injury.daysOut}</p>
                <div className="mt-3 flex gap-1">
                  {REHAB_STAGES.map((s, si) => (
                    <div key={s} className={`h-1.5 flex-1 rounded-full ${si <= stageIdx ? "bg-[#1E40AF]" : "bg-slate-200"}`} />
                  ))}
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                  <span>Reported</span>
                  <span className="font-semibold text-[#1E40AF]">{injury.stage}</span>
                  <span>Cleared</span>
                </div>
              </div>
            )}

            {/* Today's plan */}
            <div data-testid="athlete-plan" className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-[#1E40AF]" />
                <p className="text-sm font-semibold text-slate-900">Today&rsquo;s plan</p>
              </div>
              <div className="mt-3 rounded-xl bg-slate-50 p-3">
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">{today?.type}</span>
                <p className="mt-1.5 text-sm font-medium text-slate-900">{today?.session}</p>
                <p className="mt-0.5 text-xs text-slate-500">Planned load · {today?.load}</p>
              </div>
            </div>

            {/* Wellness check-in */}
            <div data-testid="athlete-wellness" className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-[#1E40AF]" />
                <p className="text-sm font-semibold text-slate-900">This morning&rsquo;s check-in</p>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                {[
                  { k: "Sleep", v: `${checkin.sleep}h` },
                  { k: "Soreness", v: `${checkin.soreness}/10` },
                  { k: "Mood", v: `${checkin.mood}/10` },
                  { k: "Stress", v: `${checkin.stress}/10` },
                ].map((m) => (
                  <div key={m.k} className="rounded-lg border border-slate-200 py-2">
                    <p className="text-sm font-semibold text-slate-900">{m.v}</p>
                    <p className="text-[10px] text-slate-500">{m.k}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Nutrition */}
            <div data-testid="athlete-nutrition" className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Apple className="h-4 w-4 text-[#1E40AF]" />
                <p className="text-sm font-semibold text-slate-900">Fuelling today</p>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg border border-slate-200 py-2">
                  <p className="text-sm font-semibold text-slate-900">{NUTRITION_PLAN.kcalTarget}</p>
                  <p className="text-slate-500">kcal</p>
                </div>
                <div className="rounded-lg border border-slate-200 py-2">
                  <p className="text-sm font-semibold text-slate-900">{NUTRITION_PLAN.macros.protein}g</p>
                  <p className="text-slate-500">protein</p>
                </div>
                <div className="rounded-lg border border-slate-200 py-2">
                  <p className="text-sm font-semibold text-slate-900">{me.nutritionAdherence ?? 78}%</p>
                  <p className="text-slate-500">adherence</p>
                </div>
              </div>
            </div>

            {/* Tasks */}
            <div data-testid="athlete-tasks" className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#1E40AF]" />
                <p className="text-sm font-semibold text-slate-900">Today&rsquo;s tasks</p>
              </div>
              <div className="mt-3 space-y-2">
                {tasks.map((t) => (
                  <div key={t.label} className="flex items-center gap-2.5">
                    {t.done ? <CheckCircle2 className="h-4 w-4 shrink-0 text-[#065F46]" /> : <Circle className="h-4 w-4 shrink-0 text-slate-300" />}
                    <span className={`text-sm ${t.done ? "text-slate-400 line-through" : "text-slate-700"}`}>{t.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-2" />
          </div>
        </div>
      </div>
    </div>
  );
}
