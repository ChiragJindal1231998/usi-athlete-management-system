import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StatusBadge, statusVariant, readinessVariant } from "@/components/shared/StatusBadge";
import { useApp } from "@/context/AppContext";
import { DOCUMENTS_SEED } from "@/data/seed";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle2, FileText, AlertTriangle } from "lucide-react";

export function AthleteDrawer({ athleteId, open, onOpenChange }) {
  const { getAthlete, getInjuriesForAthlete } = useApp();
  const athlete = athleteId ? getAthlete(athleteId) : null;
  if (!athlete) return null;

  const injuries = getInjuriesForAthlete(athlete.id);
  const docs = DOCUMENTS_SEED[athlete.id] || [
    { id: "d1", name: "Federation registration form", verified: athlete.docsVerified, uploadedOn: "—" },
    { id: "d2", name: "Medical clearance", verified: athlete.docsVerified, uploadedOn: "—" },
  ];

  const initials = athlete.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        data-testid="athlete-drawer"
        className="w-full overflow-y-auto border-l border-slate-200 bg-white p-0 sm:max-w-xl"
      >
        <SheetHeader className="border-b border-slate-100 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1E40AF]/10 text-lg font-semibold text-[#1E40AF]">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-left text-lg">{athlete.name}</SheetTitle>
              <p className="mt-0.5 text-xs text-slate-500">
                {athlete.id} · {athlete.event} · {athlete.squad}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <StatusBadge variant={statusVariant(athlete.status)}>
                  {athlete.status}
                </StatusBadge>
                <StatusBadge variant={readinessVariant(athlete.readiness)}>
                  Readiness {athlete.readiness}
                </StatusBadge>
                {athlete.onboarding && athlete.onboarding !== "active" && (
                  <StatusBadge variant="rehab">{athlete.onboarding}</StatusBadge>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="p-6">
          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="training" data-testid="tab-training">Training</TabsTrigger>
              <TabsTrigger value="medical" data-testid="tab-medical">Medical</TabsTrigger>
              <TabsTrigger value="docs" data-testid="tab-docs">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info label="Age" value={`${athlete.age} yrs`} />
                <Info label="Sport" value={athlete.sport} />
                <Info label="Event" value={athlete.event} />
                <Info label="Squad" value={athlete.squad} />
                <Info label="Coach" value={athlete.coach} />
                <Info label="Physio" value={athlete.physio} />
                <Info label="ACWR" value={athlete.acwr?.toFixed(2)} />
                <Info label="Readiness" value={athlete.readiness} />
                {athlete.pb && <Info label="PB 100m" value={athlete.pb["100m"]} />}
                {athlete.pb && <Info label="PB 200m" value={athlete.pb["200m"]} />}
              </div>
            </TabsContent>

            <TabsContent value="training">
              <div className="rounded-lg border border-slate-200 p-4 text-sm">
                <p className="text-slate-500">Current micro cycle</p>
                <p className="mt-1 font-medium text-slate-900">Pre-comp · week 2 of 3</p>
                <p className="mt-3 text-slate-600">
                  ACWR {athlete.acwr?.toFixed(2)} ·{" "}
                  {athlete.acwr > 1.3 ? "Above target band" : "Within target band"}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="medical">
              {injuries.length === 0 ? (
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  No active injuries.
                </div>
              ) : (
                <div className="space-y-2">
                  {injuries.map((i) => (
                    <div key={i.id} className="rounded-lg border border-slate-200 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{i.diagnosis}</p>
                          <p className="mt-0.5 text-xs text-slate-500">Stage: {i.stage} · {i.daysOut} days out</p>
                        </div>
                        <StatusBadge variant={i.severity}>{i.severity}</StatusBadge>
                      </div>
                      {i.aiPredicted && (
                        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#1E40AF]">
                          <AlertTriangle className="h-3 w-3" /> AI flagged elevated risk 4 days prior
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="docs">
              <div className="space-y-2">
                {docs.map((d) => (
                  <div key={d.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-900">{d.name}</p>
                        <p className="text-xs text-slate-500">Uploaded {d.uploadedOn}</p>
                      </div>
                    </div>
                    <StatusBadge variant={d.verified ? "cleared" : "mild"}>
                      {d.verified ? "verified" : "pending"}
                    </StatusBadge>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
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
