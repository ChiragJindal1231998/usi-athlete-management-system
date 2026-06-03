import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardHeader, CardBody } from "@/components/shared/Card";
import { AIInsight } from "@/components/shared/AIInsight";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Apple } from "lucide-react";

// Nutritionist — compliance across the squad, who's drifting, body-composition flags.
// No injury / rehab content — this persona only cares about fuelling adherence.
export default function NutritionistDashboard({ onOpenAthlete }) {
  const { athletes } = useApp();

  const adherence = (a) => a.nutritionAdherence ?? 80;
  // Lowest adherence first — surface the drifters who need a conversation.
  const ranked = [...athletes].sort((a, b) => adherence(a) - adherence(b));
  const drifting = ranked.filter((a) => adherence(a) < 80);
  const avgAdherence = Math.round(athletes.reduce((s, a) => s + adherence(a), 0) / athletes.length);
  const onTrack = athletes.filter((a) => adherence(a) >= 85).length;

  // Average adherence per squad — where to focus a group fuelling session.
  const bySquad = [...new Set(athletes.map((a) => a.squad))]
    .map((squad) => {
      const members = athletes.filter((a) => a.squad === squad);
      const avg = Math.round(members.reduce((s, a) => s + adherence(a), 0) / members.length);
      return { squad, adherence: avg };
    })
    .sort((a, b) => a.adherence - b.adherence);

  const lowestSquad = bySquad[0];

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
            <strong>{drifting.length} athletes</strong> are drifting below 80% plan adherence — <strong>{ranked[0]?.name}</strong> ({adherence(ranked[0])}%)
            is the priority for a fuelling check-in. At squad level, <strong>{lowestSquad?.squad}</strong> has the lowest average compliance
            ({lowestSquad?.adherence}%) and would benefit from a group education session on meal timing and protein targets.
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

        <Card className="col-span-5" data-testid="nutritionist-by-squad">
          <CardHeader title="Adherence by squad" subtitle="Average plan compliance per group · target ≥ 80%" />
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={bySquad} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="squad" width={84} stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
                <ReferenceLine x={80} stroke="#DC2626" strokeDasharray="4 4" />
                <Bar dataKey="adherence" radius={[0, 4, 4, 0]} fill="#1E40AF" />
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-2 text-[11px] text-slate-500">Squads left of the dashed line are under the 80% compliance target.</p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
