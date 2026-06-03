import { useApp } from "@/context/AppContext";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardHeader, CardBody } from "@/components/shared/Card";
import { AIInsight } from "@/components/shared/AIInsight";
import { StatusBadge, statusVariant } from "@/components/shared/StatusBadge";
import { AthleteList } from "@/components/dashboard/widgets";
import { READINESS_TREND } from "@/data/seed";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

// Performance Director — outcomes & selection across programs.
export default function DirectorDashboard({ onOpenAthlete }) {
  const { athletes, stats } = useApp();

  const atRisk = athletes.filter((a) => a.acwr > 1.3 || a.status !== "available");
  const eliteProspects = athletes.filter((a) => (a.tags || []).includes("Elite prospect"));
  const selection = [...athletes].sort((a, b) => (b.talentScore || 0) - (a.talentScore || 0)).slice(0, 6);

  // Trending: high talent + available = trending up; injured/high ACWR = down.
  const trendingUp = [...athletes]
    .filter((a) => a.status === "available" && a.acwr <= 1.3)
    .sort((a, b) => (b.talentScore || 0) - (a.talentScore || 0))
    .slice(0, 3);
  const trendingDown = [...athletes]
    .filter((a) => a.status !== "available" || a.acwr > 1.3)
    .sort((a, b) => b.acwr - a.acwr)
    .slice(0, 3);

  return (
    <div data-testid="dashboard-director-view">
      <div className="grid grid-cols-4 gap-4">
        <StatCard testId="stat-readiness" label="Avg readiness" value={stats.avgReadiness} accent suffix="/ 100" trend={-2} />
        <StatCard testId="stat-at-risk" label="Athletes at risk" value={atRisk.length} trend={2} trendLabel="load + injury" />
        <StatCard testId="stat-elite" label="Elite prospects" value={eliteProspects.length} trend={0} trendLabel="selection pool" />
        <StatCard testId="stat-injured" label="Unavailable" value={stats.injured} trend={2} trendLabel="this week" />
      </div>

      <div className="mt-4">
        <AIInsight title="Predictive outlook · selection & risk" confidence={74} testId="ai-director">
          <p>
            <strong>{trendingUp[0]?.name || "—"}</strong> and <strong>{trendingUp[1]?.name || "—"}</strong> are trending
            up on the composite talent score and remain in the optimal load band — strong selection candidates this cycle.
            Conversely <strong>{trendingDown[0]?.name || "—"}</strong> and <strong>{trendingDown[1]?.name || "—"}</strong> are
            trending down on availability/load. Arjun Sharma&rsquo;s return-to-play (day 14) is the single biggest swing factor for the 100m relay.
          </p>
        </AIInsight>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <Card className="col-span-7">
          <CardHeader title="Readiness trend · past 7 days" subtitle="Squad aggregate vs Arjun Sharma (rehab)" />
          <CardBody>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={READINESS_TREND} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} domain={[40, 100]} />
                <Tooltip contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="squad" stroke="#1E40AF" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="arjun" stroke="#DC2626" strokeWidth={2.5} strokeDasharray="5 4" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="h-1 w-3 rounded bg-[#1E40AF]" /> Squad avg</span>
              <span className="flex items-center gap-1.5"><span className="h-1 w-3 rounded bg-[#DC2626]" /> Arjun (rehab)</span>
            </div>
          </CardBody>
        </Card>

        <Card className="col-span-5" data-testid="director-trending">
          <CardHeader title="Trending" subtitle="Movement in selection signal" />
          <CardBody className="space-y-3">
            <div>
              <p className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-700"><TrendingUp className="h-3.5 w-3.5" /> Trending up</p>
              {trendingUp.map((a) => (
                <button key={a.id} onClick={() => onOpenAthlete?.(a.id)} className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm hover:bg-slate-50">
                  <span className="font-medium text-slate-800">{a.name}</span>
                  <span className="text-xs text-slate-500">talent {a.talentScore} · ACWR {a.acwr.toFixed(2)}</span>
                </button>
              ))}
            </div>
            <div>
              <p className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-red-700"><TrendingDown className="h-3.5 w-3.5" /> Trending down</p>
              {trendingDown.map((a) => (
                <button key={a.id} onClick={() => onOpenAthlete?.(a.id)} className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm hover:bg-slate-50">
                  <span className="font-medium text-slate-800">{a.name}</span>
                  <StatusBadge variant={statusVariant(a.status)}>{a.status}</StatusBadge>
                </button>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4">
        <Card>
          <CardHeader title="Selection pool" subtitle="Top composite talent scores — click to open profile" />
          <CardBody className="p-0">
            <AthleteList
              rows={selection}
              onOpen={onOpenAthlete}
              testIdPrefix="selection"
              meta={(a) => (
                <>
                  <span className="text-sm font-semibold text-[#1E40AF]">{a.talentScore}</span>
                  <StatusBadge variant={statusVariant(a.status)}>{a.status}</StatusBadge>
                </>
              )}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
