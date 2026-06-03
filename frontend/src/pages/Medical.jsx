import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/shared/Card";
import { AIInsight } from "@/components/shared/AIInsight";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable } from "@/components/shared/DataTable";
import { BodyMap, regionLabel } from "@/components/medical/BodyMap";
import { REHAB_STAGES, WELLNESS_CHECKINS } from "@/data/seed";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Check, ArrowRight, Activity, Calendar, Plus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { ScopeNote } from "@/components/shared/ScopeNote";

export default function Medical() {
  const { scopedAthletes: athletes, injuries: allInjuries, getInjuryByRegion, advanceInjuryStage, reportInjury, addInjuryNote, can, scopeLabel } = useApp();
  const canReport = can("injury.report");
  const canAdvance = can("injury.advance");
  const canNote = can("injury.note");
  const clinicalWrite = canReport || canAdvance || canNote;
  // Scope the injury list to athletes the role may see.
  const scopedIds = new Set(athletes.map((a) => a.id));
  const injuries = allInjuries.filter((i) => scopedIds.has(i.athleteId));
  const [selectedAthleteId, setSelectedAthleteId] = useState(athletes[0]?.id || "SPR-014");
  const [selectedRegion, setSelectedRegion] = useState("right-thigh");
  const [noteText, setNoteText] = useState("");

  // getInjuryByRegion is a useCallback keyed on `injuries`, so depending on it
  // re-derives whenever the injury list changes — no need to also list `injuries`.
  const injury = useMemo(
    () => getInjuryByRegion(selectedAthleteId, selectedRegion),
    [selectedAthleteId, selectedRegion, getInjuryByRegion]
  );
  const athlete = athletes.find((a) => a.id === selectedAthleteId);

  const stageIdx = injury ? REHAB_STAGES.indexOf(injury.stage) : -1;

  const handleReport = (severity) => {
    reportInjury(selectedAthleteId, selectedRegion, severity);
    toast.success(`${severity[0].toUpperCase() + severity.slice(1)} injury reported on ${regionLabel(selectedRegion)}`);
  };

  const injuryRows = injuries.map((i) => {
    const a = athletes.find((x) => x.id === i.athleteId);
    return {
      ...i,
      testId: `inj-row-${i.id}`,
      athleteName: a?.name || i.athleteId,
    };
  });

  return (
    <div data-testid="medical-page">
      <PageHeader
        title="Medical & injury"
        subtitle="Interactive body map, rehab tracking, wellness monitoring"
        action={
          <Select value={selectedAthleteId} onValueChange={(v) => { setSelectedAthleteId(v); setSelectedRegion(null); }}>
            <SelectTrigger className="h-9 w-56" data-testid="medical-athlete-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {athletes.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name} — {a.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <ScopeNote scopeLabel={scopeLabel} readOnly={!clinicalWrite} note={clinicalWrite ? undefined : "clinical actions are physio-only"} />

      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-5">
          <CardHeader
            title={`${athlete?.name || "Athlete"} · body map`}
            subtitle="Click a region to view detail · injured regions coloured by severity"
          />
          <CardBody>
            <BodyMap
              athleteId={selectedAthleteId}
              selectedRegion={selectedRegion}
              onSelectRegion={(r) => setSelectedRegion(r)}
            />
          </CardBody>
        </Card>

        <Card className="col-span-7">
          <CardHeader
            title={selectedRegion ? regionLabel(selectedRegion) : "Region detail"}
            subtitle={injury ? `${injury.diagnosis} · day ${injury.daysOut}` : "Select a region on the body map"}
            action={
              injury && <StatusBadge variant={injury.severity}>{injury.severity}</StatusBadge>
            }
          />
          <CardBody>
            {!selectedRegion && (
              <div className="flex h-72 items-center justify-center text-sm text-slate-500">
                Click any body region to start.
              </div>
            )}

            {selectedRegion && !injury && (
              <div className="space-y-4">
                <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="font-medium text-slate-900">No active injury on this region</p>
                  <p className="mt-1 text-xs">
                    {canReport
                      ? "Report an injury below — body region will update immediately."
                      : "Only the medical team can report injuries from this view."}
                  </p>
                </div>
                {canReport && (
                  <div className="grid grid-cols-3 gap-2">
                    <Button data-testid="report-mild" variant="outline" className="border-[#D97706]/40 text-[#92400E] hover:bg-[#FEF3C7]" onClick={() => handleReport("mild")}>Report mild</Button>
                    <Button data-testid="report-moderate" variant="outline" className="border-[#EA580C]/40 text-[#9A3412] hover:bg-[#FED7AA]" onClick={() => handleReport("moderate")}>Report moderate</Button>
                    <Button data-testid="report-severe" variant="outline" className="border-[#DC2626]/40 text-[#991B1B] hover:bg-[#FECACA]" onClick={() => handleReport("severe")}>Report severe</Button>
                  </div>
                )}
              </div>
            )}

            {injury && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <Info label="Mechanism" value={injury.mechanism} />
                  <Info label="Grade" value={injury.grade ? `Grade ${injury.grade}` : "—"} />
                  <Info label="Reported on" value={injury.reportedOn} />
                </div>

                {injury.aiPredicted && (
                  <AIInsight title="AI prediction record" confidence={78} testId="ai-prediction">
                    <p>
                      Risk for this injury was flagged <strong>4 days before</strong> it occurred. ACWR 1.52, sleep deficit, and HRV trend together produced a 78% probability score.
                      Coaching team was notified — the modified plan was not adopted in time.
                    </p>
                  </AIInsight>
                )}

                <div data-testid="rtp-tracker">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">Return-to-play progression</p>
                    <span className="text-xs text-slate-500">Stage {stageIdx + 1} of {REHAB_STAGES.length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {REHAB_STAGES.map((s, i) => {
                      const done = i < stageIdx;
                      const active = i === stageIdx;
                      const cleared = injury.stage === "Cleared";
                      return (
                        <div key={s} className="flex flex-1 items-center">
                          <div className="flex flex-1 flex-col items-center">
                            <div
                              className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold transition-colors ${
                                done || (cleared && i === REHAB_STAGES.length - 1)
                                  ? "bg-[#059669] text-white"
                                  : active
                                    ? "bg-[#1E40AF] text-white"
                                    : "bg-slate-100 text-slate-500"
                              }`}
                              data-testid={`stage-${i}`}
                            >
                              {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                            </div>
                            <span className={`mt-1 text-[10px] font-medium ${active ? "text-slate-900" : "text-slate-500"}`}>{s}</span>
                          </div>
                          {i < REHAB_STAGES.length - 1 && (
                            <div className={`mx-1 h-0.5 w-full ${done ? "bg-[#059669]" : "bg-slate-200"}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                    <span>{injury.notes}</span>
                    {canAdvance && (
                      <Button
                        data-testid="advance-stage"
                        size="sm"
                        className="bg-[#1E40AF] hover:bg-[#1E3A8A]"
                        disabled={injury.stage === "Cleared"}
                        onClick={() => {
                          advanceInjuryStage(injury.id);
                          const nextIdx = Math.min(stageIdx + 1, REHAB_STAGES.length - 1);
                          toast.success(`Advanced to · ${REHAB_STAGES[nextIdx]}`);
                        }}
                      >
                        {injury.stage === "Cleared" ? "Cleared" : "Advance stage"}
                        {injury.stage !== "Cleared" && <ArrowRight className="ml-1 h-3.5 w-3.5" />}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Clinical timeline */}
                <div data-testid="injury-timeline">
                  <p className="mb-2 text-sm font-semibold text-slate-900">Clinical timeline</p>
                  <div className="space-y-0">
                    {(injury.history || []).length === 0 && (
                      <p className="text-xs text-slate-500">No timeline entries yet.</p>
                    )}
                    {(injury.history || []).map((h, idx, arr) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${idx === arr.length - 1 ? "bg-[#1E40AF]" : "bg-slate-300"}`} />
                          {idx < arr.length - 1 && <div className="my-0.5 w-0.5 flex-1 bg-slate-200" />}
                        </div>
                        <div className="pb-3">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">{h.stage}</span>
                            <span className="text-[11px] text-slate-400">{h.date} · {h.author}</span>
                          </div>
                          <p className="mt-1 text-xs text-slate-700">{h.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {canNote && (
                    <div className="mt-2 flex items-center gap-2">
                      <Input
                        data-testid="injury-note-input"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && noteText.trim()) {
                            addInjuryNote(injury.id, noteText);
                            setNoteText("");
                            toast.success("Clinical note added");
                          }
                        }}
                        placeholder="Add a clinical note…"
                        className="h-9 text-sm"
                      />
                      <Button
                        data-testid="add-injury-note"
                        size="sm"
                        className="bg-[#1E40AF] hover:bg-[#1E3A8A]"
                        disabled={!noteText.trim()}
                        onClick={() => {
                          addInjuryNote(injury.id, noteText);
                          setNoteText("");
                          toast.success("Clinical note added");
                        }}
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" /> Add note
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <Card className="col-span-7">
          <CardHeader title="Injury log · squad" subtitle="All active and recent injuries across the federation" />
          <CardBody className="p-0">
            <DataTable
              testId="injury-log"
              columns={[
                { key: "athleteName", header: "Athlete", render: (r) => <span className="font-medium text-slate-900">{r.athleteName}</span> },
                { key: "diagnosis", header: "Diagnosis" },
                { key: "stage", header: "Stage", render: (r) => <StatusBadge variant={r.severity}>{r.stage}</StatusBadge> },
                { key: "daysOut", header: "Days", render: (r) => `${r.daysOut}d` },
                { key: "ai", header: "Detection", render: (r) => r.aiPredicted ? (
                  <span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-medium text-[#1E40AF]">AI predicted</span>
                ) : <span className="text-xs text-slate-500">Reported</span> },
              ]}
              rows={injuryRows}
              onRowClick={(r) => { setSelectedAthleteId(r.athleteId); setSelectedRegion(r.region); }}
            />
          </CardBody>
        </Card>

        <Card className="col-span-5">
          <CardHeader title="Wellness check-ins · Arjun" subtitle="Daily self-reported sleep, soreness, mood" />
          <CardBody>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={WELLNESS_CHECKINS} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="sleep" stroke="#1E40AF" strokeWidth={2} dot={{ r: 2.5 }} />
                <Line type="monotone" dataKey="soreness" stroke="#DC2626" strokeWidth={2} dot={{ r: 2.5 }} />
                <Line type="monotone" dataKey="mood" stroke="#059669" strokeWidth={2} dot={{ r: 2.5 }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="h-1 w-3 rounded bg-[#1E40AF]" /> Sleep (h)</span>
              <span className="flex items-center gap-1.5"><span className="h-1 w-3 rounded bg-[#DC2626]" /> Soreness (1–10)</span>
              <span className="flex items-center gap-1.5"><span className="h-1 w-3 rounded bg-[#059669]" /> Mood (1–10)</span>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-900">{value || "—"}</p>
    </div>
  );
}
