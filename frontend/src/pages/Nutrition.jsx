import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/shared/Card";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Pill, UtensilsCrossed, Pencil } from "lucide-react";
import { toast } from "sonner";
import { ScopeNote } from "@/components/shared/ScopeNote";
import { nutritionPlan, bodyCompSeries } from "@/lib/nutrition";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Nutrition() {
  const { scopedAthletes: athletes, me, can, scopeLabel, nutritionPlans, saveNutritionPlan } = useApp();
  const canEdit = can("nutrition.edit");

  const defaultId = (me?.id && athletes.some((a) => a.id === me.id)) ? me.id
    : (athletes.find((a) => a.id === "SPR-014")?.id || athletes[0]?.id);
  const [selectedId, setSelectedId] = useState(defaultId);
  const athlete = athletes.find((a) => a.id === selectedId) || athletes[0];
  const firstName = athlete?.name?.split(" ")[0] || "athlete";

  // Derived plan, overridden by a nutritionist-assigned plan when one exists.
  const derivedPlan = nutritionPlan(athlete);
  const override = nutritionPlans?.[athlete?.id];
  const plan = override ? { ...derivedPlan, ...override } : derivedPlan;
  const assigned = Boolean(override);
  const bodyComp = bodyCompSeries(athlete);
  const adherenceData = plan.adherenceWeek.map((v, i) => ({ day: DAYS[i], adherence: v }));
  const hydration = plan.hydrationLitres.map((v, i) => ({ day: DAYS[i], litres: v }));
  const avgAdherence = Math.round(plan.adherenceWeek.reduce((s, x) => s + x, 0) / 7);
  const avgHydration = (plan.hydrationLitres.reduce((s, x) => s + x, 0) / 7).toFixed(1);
  const latestFat = bodyComp[bodyComp.length - 1]?.bodyfat;
  const firstFat = bodyComp[0]?.bodyfat;
  const fatTrend = latestFat != null && firstFat != null ? Math.round((latestFat - firstFat) * 10) / 10 : 0;

  const carbsKcal = plan.macros.carbs * 4;
  const proteinKcal = plan.macros.protein * 4;
  const fatKcal = plan.macros.fat * 9;
  const totalKcal = carbsKcal + proteinKcal + fatKcal;
  const pct = (k) => Math.round((k / totalKcal) * 100);

  return (
    <div data-testid="nutrition-page">
      <PageHeader
        title="Nutrition"
        subtitle={me ? "My fuelling plan, hydration and body composition" : "Fuelling plan, hydration and body composition"}
        action={
          <div className="flex items-center gap-2">
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="h-9 w-56" data-testid="nutrition-athlete-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {athletes.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name} — {a.id}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {canEdit && (
              <DietPlanDialog
                key={athlete?.id}
                athlete={athlete}
                plan={plan}
                assigned={assigned}
                onSave={(p) => { saveNutritionPlan(athlete.id, p); toast.success(`Diet plan assigned to ${firstName}`); }}
              />
            )}
          </div>
        }
      />

      <ScopeNote
        scopeLabel={me ? "My fuelling plan" : scopeLabel}
        readOnly={!canEdit}
        note={canEdit ? "you can adjust this plan" : me ? "log meals from your dashboard" : "plan edits are nutritionist-only"}
      />

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Daily kcal target" value={plan.kcalTarget.toLocaleString()} trend={0} trendLabel={assigned ? "nutritionist-assigned" : "auto-derived target"} />
        <StatCard label="Plan adherence" accent value={`${avgAdherence}%`} trend={avgAdherence >= 80 ? 3 : -7} trendLabel={avgAdherence >= 80 ? "on plan" : "below target"} />
        <StatCard label="Avg hydration" value={avgHydration} suffix="L / day" trend={Number(avgHydration) >= 3 ? 4 : -9} />
        <StatCard label="Body fat" value={`${latestFat}%`} trend={fatTrend} trendLabel="vs Wk 1" />
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
          <CardHeader title={`Daily plan · ${firstName}`} subtitle={assigned ? "Nutritionist-assigned · macro split by kcal" : "Auto-derived · macro split by kcal"} />
          <CardBody className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <Macro label="Carbs" value={`${plan.macros.carbs} g`} pct={pct(carbsKcal)} color="#1E40AF" />
              <Macro label="Protein" value={`${plan.macros.protein} g`} pct={pct(proteinKcal)} color="#059669" />
              <Macro label="Fat" value={`${plan.macros.fat} g`} pct={pct(fatKcal)} color="#EA580C" />
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
            {plan.supplements.map((s) => (
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
          <CardHeader title={`Body composition trend · ${firstName}`} subtitle="Weekly DEXA estimate" />
          <CardBody>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={bodyComp} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
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

function DietPlanDialog({ athlete, plan, assigned, onSave }) {
  const [open, setOpen] = useState(false);
  const [kcal, setKcal] = useState(String(plan.kcalTarget));
  const [carbs, setCarbs] = useState(String(plan.macros.carbs));
  const [protein, setProtein] = useState(String(plan.macros.protein));
  const [fat, setFat] = useState(String(plan.macros.fat));
  const [supps, setSupps] = useState(plan.supplements.map((s) => ({ ...s })));

  // Re-seed the form from the current plan whenever the dialog opens.
  const onOpenChange = (v) => {
    if (v) {
      setKcal(String(plan.kcalTarget));
      setCarbs(String(plan.macros.carbs));
      setProtein(String(plan.macros.protein));
      setFat(String(plan.macros.fat));
      setSupps(plan.supplements.map((s) => ({ ...s })));
    }
    setOpen(v);
  };

  const setSupp = (i, k) => (e) => {
    const val = e?.target ? e.target.value : e;
    setSupps((p) => p.map((s, idx) => (idx === i ? { ...s, [k]: val } : s)));
  };

  const submit = () => {
    onSave({
      kcalTarget: Number(kcal) || plan.kcalTarget,
      macros: { carbs: Number(carbs) || 0, protein: Number(protein) || 0, fat: Number(fat) || 0 },
      supplements: supps
        .filter((s) => s.name.trim())
        .map((s) => ({ name: s.name, dose: s.dose, compliance: Number(s.compliance) || 80 })),
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button data-testid="edit-diet-plan" className="bg-[#1E40AF] hover:bg-[#1E3A8A]">
          <Pencil className="mr-1.5 h-4 w-4" /> {assigned ? "Edit plan" : "Assign diet"}
        </Button>
      </DialogTrigger>
      <DialogContent data-testid="diet-plan-dialog">
        <DialogHeader>
          <DialogTitle>{assigned ? "Edit" : "Assign"} fuelling plan · {athlete?.name}</DialogTitle>
          <DialogDescription>Set the prescribed kcal target, macro split and supplement protocol. Observed adherence & hydration stay as logged.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div>
            <Label className="text-xs text-slate-500">Daily kcal target</Label>
            <Input data-testid="diet-kcal" className="mt-1" type="number" step="50" value={kcal} onChange={(e) => setKcal(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-slate-500">Carbs (g)</Label>
              <Input data-testid="diet-carbs" className="mt-1" type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-slate-500">Protein (g)</Label>
              <Input data-testid="diet-protein" className="mt-1" type="number" value={protein} onChange={(e) => setProtein(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-slate-500">Fat (g)</Label>
              <Input data-testid="diet-fat" className="mt-1" type="number" value={fat} onChange={(e) => setFat(e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="text-xs text-slate-500">Supplement protocol</Label>
            <div className="mt-1 space-y-1.5">
              {supps.map((s, i) => (
                <div key={i} className="grid grid-cols-2 gap-2">
                  <Input className="h-8 text-xs" value={s.name} onChange={setSupp(i, "name")} placeholder="Supplement" />
                  <Input className="h-8 text-xs" value={s.dose} onChange={setSupp(i, "dose")} placeholder="Dose" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button data-testid="diet-save" onClick={submit} className="bg-[#1E40AF] hover:bg-[#1E3A8A]">Save plan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
