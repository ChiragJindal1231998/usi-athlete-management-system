import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { AIInsight } from "@/components/shared/AIInsight";
import { StatusBadge, statusVariant } from "@/components/shared/StatusBadge";
import { REHAB_STAGES, WELLNESS_CHECKINS, TRAINING_CLASSES, ONBOARDING_STAGES } from "@/data/seed";
import { nutritionPlan } from "@/lib/nutrition";
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";
import {
  Activity, HeartPulse, Apple, CheckCircle2, Circle, Dumbbell, Moon,
  GraduationCap, Bell, AlertTriangle, ClipboardCheck, Check,
} from "lucide-react";

// Athlete self-view — ONE responsive layout: cards stack on small screens and
// flow into a two-column grid from the `md` breakpoint up. Driven entirely by the
// athlete the user is signed in as (`me`); content adapts to rehab vs available.
const cardCls = "rounded-xl border border-slate-200 bg-white p-4 shadow-sm";

// Colour per class type — mirrors the Training module's session palette.
const CLASS_TYPE_STYLE = {
  Speed: "bg-[#1E40AF]/10 text-[#1E40AF]",
  Strength: "bg-[#7C2D12]/10 text-[#7C2D12]",
  Endurance: "bg-[#065F46]/10 text-[#065F46]",
  Recovery: "bg-[#0E7490]/10 text-[#0E7490]",
  Power: "bg-[#9A3412]/10 text-[#9A3412]",
};

// Onboarding stepper labels (matches the Ops lifecycle: invited → pending → review → active).
const ONBOARDING_STEP = {
  invited: { label: "Invited", hint: "You've been invited — complete self-registration to continue." },
  pending: { label: "Registered", hint: "Registration received. Upload your onboarding documents next." },
  review: { label: "Docs review", hint: "Your documents are with Operations for verification." },
  active: { label: "Active", hint: "Fully onboarded — you have complete access to your workspace." },
};

const FEED_TONE = {
  severe: "border-[#DC2626]/30 bg-[#FEF2F2] text-[#991B1B]",
  moderate: "border-[#D97706]/30 bg-[#FFFBEB] text-[#92400E]",
  mild: "border-[#D97706]/30 bg-[#FFFBEB] text-[#92400E]",
  info: "border-[#1E40AF]/20 bg-[#EFF6FF] text-[#1E3A8A]",
  success: "border-[#059669]/30 bg-[#ECFDF5] text-[#065F46]",
};

export default function AthleteSelfView() {
  const { me, athletes, injuries, microPlan, alerts, nutritionPlans } = useApp();
  const athlete = me || athletes.find((a) => a.id === "SPR-014") || athletes[0];
  const injury = injuries.find((i) => i.athleteId === athlete.id && i.stage !== "Cleared");
  const stageIdx = injury ? REHAB_STAGES.indexOf(injury.stage) : -1;
  const milestones = injury?.history || [];

  // ── My weekly classes — coach-assigned enrolment (athlete.classes → catalogue).
  const myClasses = (athlete.classes || [])
    .map((id) => TRAINING_CLASSES.find((c) => c.id === id))
    .filter(Boolean);

  // ── My diet plan — nutritionist override (if assigned) over the derived plan.
  const derivedPlan = nutritionPlan(athlete);
  const dietOverride = nutritionPlans?.[athlete.id];
  const plan = dietOverride ? { ...derivedPlan, ...dietOverride } : derivedPlan;
  const dietAssigned = Boolean(dietOverride);

  // ── Onboarding tracker — where the athlete sits in the lifecycle.
  const stage = athlete.onboarding || "active";
  const stageIndex = Math.max(0, ONBOARDING_STAGES.indexOf(stage));

  // ── Notifications — staff/AI actions that touched this athlete's record.
  const notifications = [];
  alerts
    .filter((a) => a.athleteId === athlete.id && a.status === "active")
    .forEach((a) =>
      notifications.push({ icon: AlertTriangle, tone: a.severity, who: "AI risk engine", text: `${a.title} — ${a.detail}` })
    );
  if (injury) {
    [...(injury.history || [])].reverse().slice(0, 3).forEach((h) =>
      notifications.push({ icon: HeartPulse, tone: "info", who: h.author, text: h.note, when: h.date })
    );
  }
  if (dietAssigned) {
    notifications.push({ icon: Apple, tone: "info", who: "Priya Menon · Nutritionist", text: `Assigned your fuelling plan — ${plan.kcalTarget} kcal target` });
  }
  if (myClasses.length) {
    notifications.push({ icon: Dumbbell, tone: "info", who: `${athlete.coach} · Coach`, text: `Enrolled you in ${myClasses.length} weekly ${myClasses.length === 1 ? "class" : "classes"}` });
  }
  if (stage === "active") {
    notifications.push({ icon: ClipboardCheck, tone: "success", who: "Operations", text: "Onboarding verified — your account is active" });
  } else {
    notifications.push({ icon: ClipboardCheck, tone: "moderate", who: "Operations", text: ONBOARDING_STEP[stage]?.hint || "Onboarding in progress" });
  }

  // Rehabbing athletes get a recovery day surfaced; everyone else gets training.
  const today = injury
    ? microPlan.find((d) => d.type === "Recovery") || microPlan[0]
    : microPlan.find((d) => d.type !== "Recovery") || microPlan[0];
  const checkin = WELLNESS_CHECKINS[WELLNESS_CHECKINS.length - 1];
  const readinessData = [{ name: "readiness", value: athlete.readiness, fill: athlete.readiness >= 70 ? "#1E40AF" : athlete.readiness >= 55 ? "#D97706" : "#DC2626" }];

  // Status-aware headline for the readiness card.
  const readinessHead = injury
    ? { title: "Recovery focus", copy: "Readiness is below your baseline. Follow the rehab plan — no max-velocity work today." }
    : athlete.readiness >= 75
      ? { title: "Good to train", copy: "You're in a strong window. Attack today's session with full intent." }
      : { title: "Monitor your load", copy: "Readiness is a touch low — prioritise recovery quality between efforts today." };

  // Local UI state only — tapping a task toggles it (no domain persistence needed for the self-view).
  const initialTasks = injury
    ? [
        { label: "Morning wellness check-in", done: true },
        { label: "Prescribed rehab strength set (×3)", done: true },
        { label: "Pool recovery session · 4pm", done: false },
        { label: "Log dinner — hit protein target", done: false },
      ]
    : [
        { label: "Morning wellness check-in", done: true },
        { label: today?.session || "Today's training session", done: false },
        { label: "Mobility & prehab routine", done: false },
        { label: "Log dinner — hit protein target", done: false },
      ];
  const [tasks, setTasks] = useState(initialTasks);
  const toggleTask = (i) => setTasks((prev) => prev.map((t, idx) => (idx === i ? { ...t, done: !t.done } : t)));
  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <div data-testid="dashboard-athlete-view" className="space-y-4">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Good morning</p>
          <p className="text-xl font-semibold text-slate-900">{athlete.name}</p>
          <p className="text-xs text-slate-500">{athlete.event} · {athlete.squad} · {athlete.id}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1E40AF] text-sm font-semibold text-white">
          {athlete.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
        </div>
      </div>

      {/* Stacks by default, two-column grid from md up */}
      <div className="space-y-4 md:grid md:grid-cols-12 md:gap-4 md:space-y-0">
        {/* Left column — status & rehab */}
        <div className="space-y-4 md:col-span-7">
          {/* Readiness ring */}
          <div data-testid="athlete-readiness" className={cardCls}>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="relative h-28 w-28 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart innerRadius="72%" outerRadius="100%" data={readinessData} startAngle={90} endAngle={-270}>
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar background dataKey="value" cornerRadius={20} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900">{athlete.readiness}</span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">readiness</span>
                </div>
              </div>
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p className="text-sm font-medium text-slate-900">{readinessHead.title}</p>
                <p className="mt-1 text-xs text-slate-500">{readinessHead.copy}</p>
                <div className="mt-2 flex justify-center gap-2 sm:justify-start">
                  <StatusBadge variant={statusVariant(athlete.status)}>{athlete.status}</StatusBadge>
                  <StatusBadge variant={athlete.acwr > 1.3 ? "severe" : "mild"}>ACWR {athlete.acwr.toFixed(2)}</StatusBadge>
                </div>
              </div>
            </div>
          </div>

          {/* AI insight — rehab guidance when injured, performance guidance when available */}
          <AIInsight title={injury ? "Your rehab · today" : "Your training · today"} confidence={78} testId="ai-athlete">
            {injury ? (
              <p className="text-sm">
                You&rsquo;re on <strong>day {injury.daysOut}</strong>, <strong>{injury.stage}</strong> stage ({stageIdx + 1} of 5)
                for your {injury.diagnosis.toLowerCase()}. Stick to the prescribed plan and hit your strength benchmarks before
                progressing — your physio reviews you again this week.
              </p>
            ) : (
              <p className="text-sm">
                You&rsquo;re fully available with a readiness of <strong>{athlete.readiness}</strong> and an ACWR of <strong>{athlete.acwr.toFixed(2)}</strong>
                {athlete.acwr > 1.3 ? " — slightly above the optimal band, so manage volume carefully today." : " — right in the optimal load band, good to push."}{" "}
                Keep your wellness check-ins and fuelling consistent.
              </p>
            )}
          </AIInsight>

          {/* Rehab progress */}
          {injury && (
            <div data-testid="athlete-rehab" className={cardCls}>
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

              {/* Milestone timeline */}
              {milestones.length > 0 && (
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Milestones</p>
                  <ol className="space-y-3">
                    {[...milestones].reverse().map((m, i) => (
                      <li key={`${m.date}-${i}`} className="flex gap-2.5">
                        <div className="flex flex-col items-center">
                          <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${i === 0 ? "bg-[#1E40AF]" : "bg-slate-300"}`} />
                          {i < milestones.length - 1 && <span className="mt-0.5 w-px flex-1 bg-slate-200" />}
                        </div>
                        <div className="min-w-0 pb-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-800">{m.stage}</span>
                            <span className="text-[10px] text-slate-400">{m.date}</span>
                          </div>
                          <p className="mt-0.5 text-xs leading-snug text-slate-500">{m.note}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* My weekly classes — coach-assigned enrolment */}
          <div data-testid="athlete-classes" className={cardCls}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-[#1E40AF]" />
                <p className="text-sm font-semibold text-slate-900">My weekly classes</p>
              </div>
              <span className="text-xs font-medium text-slate-400">{myClasses.length} of {TRAINING_CLASSES.length}</span>
            </div>
            {myClasses.length === 0 ? (
              <p className="mt-3 rounded-lg border border-dashed border-slate-200 px-3 py-3 text-xs text-slate-400">
                No classes assigned yet — your coach will enrol you into the weekly block.
              </p>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {myClasses.map((c) => (
                  <div key={c.id} className="rounded-lg border border-slate-200 p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">{c.day}</span>
                      <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${CLASS_TYPE_STYLE[c.type] || "bg-slate-100 text-slate-600"}`}>{c.type}</span>
                    </div>
                    <p className="mt-1.5 text-xs font-medium text-slate-800">{c.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Onboarding status tracker */}
          <div data-testid="athlete-onboarding" className={cardCls}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-[#1E40AF]" />
                <p className="text-sm font-semibold text-slate-900">Onboarding status</p>
              </div>
              <StatusBadge variant={stage === "active" ? "cleared" : "moderate"}>{ONBOARDING_STEP[stage]?.label || stage}</StatusBadge>
            </div>
            <ol className="mt-3 flex items-center gap-1">
              {ONBOARDING_STAGES.map((s, i) => {
                const done = i < stageIndex;
                const current = i === stageIndex;
                return (
                  <li key={s} className="flex flex-1 items-center gap-1">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold ${done ? "bg-[#059669] text-white" : current ? "bg-[#1E40AF] text-white" : "bg-slate-100 text-slate-400"}`}>
                      {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                    </span>
                    {i < ONBOARDING_STAGES.length - 1 && (
                      <span className={`h-0.5 flex-1 rounded-full ${i < stageIndex ? "bg-[#059669]" : "bg-slate-200"}`} />
                    )}
                  </li>
                );
              })}
            </ol>
            <div className="mt-2 flex justify-between text-[10px] text-slate-400">
              {ONBOARDING_STAGES.map((s) => (
                <span key={s} className={s === stage ? "font-semibold text-[#1E40AF]" : ""}>{ONBOARDING_STEP[s]?.label || s}</span>
              ))}
            </div>
            <p className="mt-2.5 text-xs text-slate-500">{ONBOARDING_STEP[stage]?.hint}</p>
          </div>
        </div>

        {/* Right column — today's plan, wellness, fuelling, tasks */}
        <div className="space-y-4 md:col-span-5">
          {/* Today's plan */}
          <div data-testid="athlete-plan" className={cardCls}>
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
          <div data-testid="athlete-wellness" className={cardCls}>
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

          {/* My assigned diet plan */}
          <div data-testid="athlete-nutrition" className={cardCls}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Apple className="h-4 w-4 text-[#1E40AF]" />
                <p className="text-sm font-semibold text-slate-900">My diet plan</p>
              </div>
              <StatusBadge variant={dietAssigned ? "cleared" : "mild"}>
                {dietAssigned ? "nutritionist-assigned" : "auto-derived"}
              </StatusBadge>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
              <div className="rounded-lg border border-slate-200 py-2">
                <p className="text-sm font-semibold text-slate-900">{plan.kcalTarget}</p>
                <p className="text-slate-500">kcal</p>
              </div>
              <div className="rounded-lg border border-slate-200 py-2">
                <p className="text-sm font-semibold text-slate-900">{plan.macros.carbs}g</p>
                <p className="text-slate-500">carbs</p>
              </div>
              <div className="rounded-lg border border-slate-200 py-2">
                <p className="text-sm font-semibold text-slate-900">{plan.macros.protein}g</p>
                <p className="text-slate-500">protein</p>
              </div>
              <div className="rounded-lg border border-slate-200 py-2">
                <p className="text-sm font-semibold text-slate-900">{plan.macros.fat}g</p>
                <p className="text-slate-500">fat</p>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              {dietAssigned
                ? "Prescribed by your nutritionist · adherence tracked below"
                : "Baseline target · your nutritionist can tailor this"}
              {" · "}
              {athlete.nutritionAdherence ?? 78}% adherence this week
            </p>
          </div>

          {/* Notifications feed */}
          <div data-testid="athlete-notifications" className={cardCls}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-[#1E40AF]" />
                <p className="text-sm font-semibold text-slate-900">Notifications</p>
              </div>
              <span className="text-xs font-medium text-slate-400">{notifications.length}</span>
            </div>
            <div className="mt-3 space-y-2">
              {notifications.length === 0 ? (
                <p className="rounded-lg border border-slate-200 px-3 py-3 text-xs text-slate-400">
                  You&rsquo;re all caught up — no new updates from your support team.
                </p>
              ) : (
                notifications.map((n, i) => {
                  const Icon = n.icon;
                  return (
                    <div
                      key={`${n.who}-${i}`}
                      data-testid={`athlete-notification-${i}`}
                      className={`flex gap-2.5 rounded-lg border px-3 py-2 ${FEED_TONE[n.tone] || FEED_TONE.info}`}
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold">{n.who}</span>
                          {n.when && <span className="text-[10px] opacity-70">{n.when}</span>}
                        </div>
                        <p className="mt-0.5 text-xs leading-snug">{n.text}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Tasks */}
          <div data-testid="athlete-tasks" className={cardCls}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#1E40AF]" />
                <p className="text-sm font-semibold text-slate-900">Today&rsquo;s tasks</p>
              </div>
              <span className="text-xs font-medium text-slate-400">{doneCount}/{tasks.length}</span>
            </div>
            <div className="mt-3 space-y-1">
              {tasks.map((t, i) => (
                <button
                  key={t.label}
                  data-testid={`athlete-task-${i}`}
                  onClick={() => toggleTask(i)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-1 py-2 text-left hover:bg-slate-50"
                >
                  {t.done ? <CheckCircle2 className="h-5 w-5 shrink-0 text-[#065F46]" /> : <Circle className="h-5 w-5 shrink-0 text-slate-300" />}
                  <span className={`text-sm ${t.done ? "text-slate-400 line-through" : "text-slate-700"}`}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
