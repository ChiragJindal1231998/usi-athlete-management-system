import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardHeader, CardBody } from "@/components/shared/Card";
import { AIInsight } from "@/components/shared/AIInsight";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { REHAB_STAGES } from "@/data/seed";
import { HeartPulse, ArrowRight } from "lucide-react";

// Physiotherapist — medical-first: RTP queue, wellness flags. Arjun front and centre.
export default function PhysioDashboard({ onOpenAthlete }) {
  const { athletes, injuries } = useApp();

  const queue = injuries
    .map((i) => ({ ...i, athlete: athletes.find((a) => a.id === i.athleteId) }))
    .filter((i) => i.stage !== "Cleared")
    // Arjun leads, then by how far along RTP (earlier stage = more attention).
    .sort((a, b) => {
      if (a.athleteId === "SPR-014") return -1;
      if (b.athleteId === "SPR-014") return 1;
      return REHAB_STAGES.indexOf(a.stage) - REHAB_STAGES.indexOf(b.stage);
    });

  const wellnessFlags = athletes.filter((a) => a.readiness < 65);
  const rtpThisWeek = injuries.filter((i) => i.stage === "Return-to-play").length;

  return (
    <div data-testid="dashboard-physio-view">
      <div className="grid grid-cols-4 gap-4">
        <StatCard testId="stat-injured" label="Active cases" value={queue.length} accent trend={0} trendLabel="open injuries" />
        <StatCard testId="stat-rehab" label="In rehab" value={athletes.filter((a) => a.status === "rehab").length} trend={0} />
        <StatCard testId="stat-rtp" label="Return-to-play" value={rtpThisWeek} trend={1} trendLabel="clearing soon" />
        <StatCard testId="stat-wellness" label="Wellness flags" value={wellnessFlags.length} trend={1} trendLabel="readiness < 65" />
      </div>

      <div className="mt-4">
        <AIInsight title="Prediction record · Arjun Sharma" confidence={78} testId="ai-physio">
          <p>
            Risk was flagged <strong>4 days before</strong> Arjun&rsquo;s grade-2 hamstring strain (ACWR 1.52 + HRV drop + soreness spike).
            He is now on <strong>rehab day 14, stage 3 of 5</strong>. Eccentric strength is 78% of the uninjured side — target 90% before
            progressing to return-to-play. Estimated clearance: 8–12 days.
          </p>
        </AIInsight>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <Card className="col-span-7" data-testid="physio-rtp-queue">
          <CardHeader
            title="Return-to-play queue"
            subtitle="Open cases, ordered by attention needed"
            action={
              <Link to="/medical" data-testid="physio-open-medical" className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-[#1E40AF] hover:bg-slate-50">
                <HeartPulse className="h-3.5 w-3.5" /> Body map
              </Link>
            }
          />
          <CardBody className="p-0">
            <div className="divide-y divide-slate-100">
              {queue.map((i) => {
                const idx = REHAB_STAGES.indexOf(i.stage);
                return (
                  <div key={i.id} data-testid={`physio-case-${i.id}`} onClick={() => onOpenAthlete?.(i.athleteId)} className="cursor-pointer px-5 py-3 transition-colors hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{i.athlete?.name || i.athleteId}</p>
                        <p className="text-xs text-slate-500">{i.diagnosis} · day {i.daysOut}</p>
                      </div>
                      <StatusBadge variant={i.severity}>{i.stage}</StatusBadge>
                    </div>
                    <div className="mt-2 flex gap-1">
                      {REHAB_STAGES.map((s, si) => (
                        <div key={s} className={`h-1 flex-1 rounded-full ${si <= idx ? "bg-[#1E40AF]" : "bg-slate-200"}`} />
                      ))}
                    </div>
                  </div>
                );
              })}
              {queue.length === 0 && <p className="px-5 py-6 text-center text-sm text-slate-500">No open cases.</p>}
            </div>
          </CardBody>
        </Card>

        <Card className="col-span-5" data-testid="physio-wellness-flags">
          <CardHeader title="Wellness flags" subtitle="Low readiness — check before clearing to train" />
          <CardBody className="p-0">
            <div className="divide-y divide-slate-100">
              {wellnessFlags.map((a) => (
                <button key={a.id} onClick={() => onOpenAthlete?.(a.id)} className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-slate-50">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{a.name}</p>
                    <p className="text-xs text-slate-500">{a.event} · {a.squad}</p>
                  </div>
                  <span className="flex items-center gap-1 text-sm font-semibold text-[#991B1B]">{a.readiness} <ArrowRight className="h-3 w-3 rotate-90" /></span>
                </button>
              ))}
              {wellnessFlags.length === 0 && <p className="px-5 py-6 text-center text-sm text-slate-500">No wellness flags.</p>}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
