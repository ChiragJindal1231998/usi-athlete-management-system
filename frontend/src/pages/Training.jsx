import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/shared/Card";
import { AIInsight } from "@/components/shared/AIInsight";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PERIODISATION, EXERCISE_LIBRARY } from "@/data/seed";
import { Button } from "@/components/ui/button";
import { Plus, Check, Activity, GripVertical, CalendarDays } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from "recharts";
import { toast } from "sonner";

const SESSION_TYPE_STYLE = {
  Speed: "bg-[#DBEAFE] text-[#1D4ED8] border-[#60A5FA]/50",
  Strength: "bg-[#FED7AA] text-[#9A3412] border-[#FB923C]/50",
  Endurance: "bg-[#D1FAE5] text-[#065F46] border-[#34D399]/50",
  Power: "bg-[#FECACA] text-[#991B1B] border-[#F87171]/50",
  Recovery: "bg-slate-100 text-slate-600 border-slate-200",
  Mobility: "bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]/50",
};

const ATTENDANCE_OPTIONS = [
  { value: "present", label: "Present", style: "bg-[#D1FAE5] text-[#065F46] border-[#34D399]/50" },
  { value: "late", label: "Late", style: "bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]/50" },
  { value: "absent", label: "Absent", style: "bg-[#FECACA] text-[#991B1B] border-[#F87171]/50" },
  { value: "excused", label: "Excused", style: "bg-slate-100 text-slate-600 border-slate-200" },
];

export default function Training() {
  const { microPlan, aiLoadAccepted, acceptAILoadReduction, athletes, moveSession, attendance, setAttendanceStatus } = useApp();
  const arjun = athletes.find((a) => a.id === "SPR-014");
  const attCounts = attendance.roster.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {});
  const [selectedSession, setSelectedSession] = useState(null);
  const [builderItems, setBuilderItems] = useState([]);
  const [rpe, setRpe] = useState(7);
  const [dragFrom, setDragFrom] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const acwrData = arjun.weeklyLoad.map((w, idx) => ({
    week: `W${idx + 1}`,
    load: w,
    acwr: Number((w / 470).toFixed(2)),
  }));

  return (
    <div data-testid="training-page">
      <PageHeader
        title="Training & periodisation"
        subtitle="Macro → meso → micro planning, with workload monitoring"
      />

      <Card>
        <CardHeader title={PERIODISATION.macroLabel} subtitle="Mesocycle timeline" />
        <CardBody>
          <div className="flex h-24 w-full overflow-hidden rounded-lg border border-slate-200">
            {PERIODISATION.meso.map((m, idx) => {
              const totalWeeks = PERIODISATION.meso.reduce((s, x) => s + x.weeks, 0);
              const widthPct = (m.weeks / totalWeeks) * 100;
              return (
                <div
                  key={m.name}
                  className="relative flex flex-col justify-between border-r border-white/40 p-3 last:border-r-0"
                  style={{ width: `${widthPct}%`, background: m.color, color: "white" }}
                  data-testid={`meso-${idx}`}
                >
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider opacity-80">
                      Meso {idx + 1} · {m.weeks}w
                    </p>
                    <p className="mt-0.5 text-sm font-semibold">{m.name}</p>
                  </div>
                  <p className="text-[11px] opacity-90">{m.focus}</p>
                  {m.current && (
                    <span className="absolute right-2 top-2 rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-semibold uppercase backdrop-blur">
                      Current
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <Card className="col-span-12">
          <CardHeader
            title="Current microcycle · Sprint A"
            subtitle={
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <CalendarDays className="h-3 w-3" />
                Drag any session card across days to reorder · {aiLoadAccepted ? "AI-adjusted plan applied" : "Standard plan"}
              </span>
            }
          />
          <CardBody>
            <div className="grid grid-cols-7 gap-2" data-testid="microcycle-calendar">
              {microPlan.map((d, idx) => {
                const typeStyle = SESSION_TYPE_STYLE[d.type] || "bg-slate-50 text-slate-600 border-slate-200";
                const isDragOver = dragOver === idx;
                const isDragging = dragFrom === idx;
                return (
                  <div
                    key={d.day}
                    data-testid={`day-${d.day}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(idx); }}
                    onDragLeave={() => setDragOver((v) => (v === idx ? null : v))}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragFrom !== null && dragFrom !== idx) {
                        moveSession(dragFrom, idx);
                        toast.success(`Moved · ${microPlan[dragFrom].day} ↔ ${d.day}`);
                      }
                      setDragFrom(null);
                      setDragOver(null);
                    }}
                    className={`flex min-h-[170px] flex-col rounded-lg border-2 p-2 transition-colors ${isDragOver ? "border-[#1E40AF] bg-[#EFF6FF]" : "border-dashed border-slate-200 bg-slate-50/40"}`}
                  >
                    <div className="mb-2 flex items-center justify-between px-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{d.day}</span>
                      <span className="text-[10px] text-slate-400">{d.load}</span>
                    </div>
                    <div
                      draggable
                      onDragStart={() => setDragFrom(idx)}
                      onDragEnd={() => { setDragFrom(null); setDragOver(null); }}
                      onClick={() => setSelectedSession(d)}
                      data-testid={`session-card-${d.day}`}
                      className={`group flex-1 cursor-grab rounded-md border bg-white p-3 shadow-sm transition-all active:cursor-grabbing ${typeStyle} ${isDragging ? "opacity-50 ring-2 ring-[#1E40AF]" : "hover:shadow-md"}`}
                    >
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className={`rounded-full bg-white/70 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider`}>{d.type}</span>
                        <GripVertical className="h-3 w-3 opacity-30 group-hover:opacity-70" />
                      </div>
                      <p className="text-[11px] font-medium leading-snug">{d.session}</p>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/60">
                        <div className="h-full bg-current opacity-70" style={{ width: `${d.load}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4">
        <Card>
          <CardHeader
            title="Session attendance"
            subtitle={`${attendance.session} · ${attendance.date}`}
            action={
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1 text-[#065F46]"><span className="h-2 w-2 rounded-full bg-[#34D399]" /> {attCounts.present || 0} present</span>
                <span className="flex items-center gap-1 text-[#92400E]"><span className="h-2 w-2 rounded-full bg-[#FCD34D]" /> {attCounts.late || 0} late</span>
                <span className="flex items-center gap-1 text-[#991B1B]"><span className="h-2 w-2 rounded-full bg-[#F87171]" /> {attCounts.absent || 0} absent</span>
                <span className="flex items-center gap-1 text-slate-500"><span className="h-2 w-2 rounded-full bg-slate-300" /> {attCounts.excused || 0} excused</span>
              </div>
            }
          />
          <CardBody className="p-0">
            <div className="divide-y divide-slate-100" data-testid="attendance-roster">
              {attendance.roster.map((r) => {
                const ath = athletes.find((a) => a.id === r.athleteId);
                if (!ath) return null;
                return (
                  <div key={r.athleteId} data-testid={`attendance-row-${r.athleteId}`} className="flex items-center justify-between px-5 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-700">
                        {ath.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{ath.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {ath.id} · {ath.event}{r.note ? ` · ${r.note}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {ATTENDANCE_OPTIONS.map((opt) => {
                        const active = r.status === opt.value;
                        return (
                          <button
                            key={opt.value}
                            data-testid={`attendance-${r.athleteId}-${opt.value}`}
                            onClick={() => {
                              setAttendanceStatus(r.athleteId, opt.value);
                              toast.success(`${ath.name} marked ${opt.label.toLowerCase()}`);
                            }}
                            className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${active ? opt.style : "border-slate-200 bg-white text-slate-400 hover:bg-slate-50"}`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <AIInsight
            title="AI training recommendation · Arjun Sharma"
            confidence={78}
            testId="ai-load-reduce"
            action={
              aiLoadAccepted ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-[#D1FAE5] px-2.5 py-1.5 text-xs font-medium text-[#065F46]">
                  <Check className="h-3.5 w-3.5" /> Plan adjusted
                </span>
              ) : (
                <Button
                  data-testid="accept-ai-load"
                  size="sm"
                  className="bg-[#1E40AF] hover:bg-[#1E3A8A]"
                  onClick={() => { acceptAILoadReduction(); toast.success("Friday & Saturday switched to recovery"); }}
                >
                  Accept recommendation
                </Button>
              )
            }
          >
            <p>
              ACWR climbed to <strong>{arjun.acwr.toFixed(2)}</strong> (target band 0.8–1.3). Predicted hamstring-strain risk <strong>78%</strong> over next 4 days.
              Suggest swapping Friday max-velocity flys and Saturday hill sprints for low-intensity recovery work.
            </p>
          </AIInsight>
        </div>

        <Card className="col-span-5">
          <CardHeader title="Session detail" subtitle={selectedSession ? `${selectedSession.day} · ${selectedSession.type}` : "Pick a day to view"} />
          <CardBody>
            {selectedSession ? (
              <div className="space-y-3">
                <div className="rounded-lg bg-slate-50 p-3 text-sm">
                  <p className="font-medium text-slate-900">{selectedSession.session}</p>
                  <p className="mt-0.5 text-xs text-slate-500">Planned load · {selectedSession.load}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-700">Post-session RPE</p>
                  <div className="mt-1.5 flex items-center gap-1">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setRpe(i + 1)}
                        data-testid={`rpe-${i + 1}`}
                        className={`h-7 w-7 rounded text-xs font-medium transition-colors ${rpe === i + 1 ? "bg-[#1E40AF] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500">Collected from athletes immediately after each session.</p>
                </div>
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-slate-500">Click any session card from the calendar above.</p>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <Card className="col-span-7">
          <CardHeader title="Workload · Arjun Sharma" subtitle="Acute:chronic workload ratio (ACWR), 8 weeks" />
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={acwrData} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="week" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} domain={[0.4, 1.8]} />
                <Tooltip contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
                <ReferenceArea y1={0.8} y2={1.3} fill="#1E40AF" fillOpacity={0.06} />
                <Line type="monotone" dataKey="acwr" stroke="#1E40AF" strokeWidth={2.5} dot={{ r: 3, fill: "#1E40AF" }} />
              </LineChart>
            </ResponsiveContainer>
            <p className="mt-2 text-xs text-slate-500">Sweet-spot band 0.8–1.3 shaded blue. Arjun peaked at <strong>1.52</strong> in week 7 — AI flagged this 4 days before injury.</p>
          </CardBody>
        </Card>

        <Card className="col-span-5">
          <CardHeader
            title="Session builder"
            subtitle="Drag-style picker from exercise library"
            action={<span className="text-xs text-slate-500">{builderItems.length} added</span>}
          />
          <CardBody className="space-y-2">
            <div className="max-h-44 space-y-1 overflow-y-auto pr-1">
              {EXERCISE_LIBRARY.map((ex) => {
                const added = builderItems.includes(ex.id);
                return (
                  <button
                    key={ex.id}
                    onClick={() => setBuilderItems((p) => added ? p.filter((i) => i !== ex.id) : [...p, ex.id])}
                    data-testid={`ex-${ex.id}`}
                    className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-xs transition-colors ${added ? "border-[#1E40AF]/30 bg-[#EFF6FF]" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-3.5 w-3.5 text-slate-300" />
                      <span className="font-medium text-slate-800">{ex.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500">{ex.category}</span>
                      <StatusBadge variant={ex.intensity === "High" ? "severe" : ex.intensity === "Moderate" ? "moderate" : "healthy"}>{ex.intensity}</StatusBadge>
                    </div>
                  </button>
                );
              })}
            </div>
            <Button
              data-testid="assign-session"
              size="sm"
              className="w-full bg-[#1E40AF] hover:bg-[#1E3A8A]"
              disabled={builderItems.length === 0}
              onClick={() => { toast.success(`Session assigned · ${builderItems.length} exercises`); setBuilderItems([]); }}
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> Assign to Sprint A
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
