import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/shared/Card";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge, statusVariant, readinessVariant } from "@/components/shared/StatusBadge";
import { AthleteDrawer } from "@/components/shared/AthleteDrawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Plus, Search, CheckCircle2, Tag } from "lucide-react";
import { toast } from "sonner";
import { ATHLETE_TAGS } from "@/data/seed";
import { ScopeNote } from "@/components/shared/ScopeNote";

export default function Athletes() {
  const { scopedAthletes: athletes, addAthlete, can, scopeLabel, federationScope } = useApp();
  const canAdd = can("athletes.add");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [openId, setOpenId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState({ name: "", age: "", event: "100m sprint", squad: "Sprint B", coach: "Meera Iyer", onboarding: "invited" });
  const [createdId, setCreatedId] = useState(null);

  const filtered = useMemo(() => {
    return athletes.filter((a) => {
      const matchQ = (a.name + a.id + a.event + (a.tags || []).join(" ")).toLowerCase().includes(query.toLowerCase());
      const matchF = filter === "all" || a.status === filter;
      const matchT = tagFilter === "all" || (a.tags || []).includes(tagFilter);
      return matchQ && matchF && matchT;
    });
  }, [athletes, query, filter, tagFilter]);

  const columns = [
    { key: "name", header: "Athlete", render: (r) => (
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-700">
          {r.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900">{r.name}</p>
          <p className="text-[11px] text-slate-500">{r.id}</p>
        </div>
      </div>
    ) },
    { key: "event", header: "Event", render: (r) => <span className="text-sm">{r.event}</span> },
    { key: "squad", header: "Squad" },
    { key: "coach", header: "Coach" },
    { key: "readiness", header: "Readiness", render: (r) => (
      <StatusBadge variant={readinessVariant(r.readiness)}>{r.readiness}</StatusBadge>
    ) },
    { key: "status", header: "Status", render: (r) => (
      <StatusBadge variant={statusVariant(r.status)}>{r.status}</StatusBadge>
    ) },
    { key: "onboarding", header: "Onboarding", render: (r) => (
      <span className="text-xs text-slate-600">{r.onboarding}</span>
    ) },
    { key: "tags", header: "Tags", render: (r) => (
      (r.tags || []).length === 0 ? (
        <span className="text-xs text-slate-300">—</span>
      ) : (
        <div className="flex flex-wrap gap-1">
          {(r.tags || []).slice(0, 2).map((t) => (
            <span key={t} className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-medium text-[#1E40AF]">{t}</span>
          ))}
          {(r.tags || []).length > 2 && (
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">+{r.tags.length - 2}</span>
          )}
        </div>
      )
    ) },
  ];

  const submit = () => {
    if (step === 1) {
      if (!draft.name) return toast.error("Name is required");
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else {
      // New athletes enter the pipeline at "invited" — they must self-register,
      // upload docs and be verified by Ops before reaching "active".
      const a = addAthlete({ ...draft, onboarding: "invited" });
      setCreatedId(a.id);
      toast.success(`${a.name} invited · onboarding started`);
      setShowAdd(false);
      setStep(1);
      setDraft({ name: "", age: "", event: "100m sprint", squad: "Sprint B", coach: "Meera Iyer", onboarding: "invited" });
    }
  };

  return (
    <div data-testid="athletes-page">
      <PageHeader
        title="Athlete registry"
        subtitle={federationScope ? "Full federation roster · click any row to open the athlete profile" : "Athletes within your scope · click any row to open the profile"}
        action={canAdd && (
          <Dialog open={showAdd} onOpenChange={(o) => { setShowAdd(o); if (!o) setStep(1); }}>
            <DialogTrigger asChild>
              <Button data-testid="add-athlete-btn" className="bg-[#1E40AF] hover:bg-[#1E3A8A]">
                <Plus className="mr-1.5 h-4 w-4" /> Add athlete
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Onboard new athlete · step {step} of 4</DialogTitle>
              </DialogHeader>
              <div className="mt-2 space-y-3">
                {step === 1 && (
                  <>
                    <div>
                      <Label className="text-xs">Full name</Label>
                      <Input data-testid="onb-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Priya Kumar" />
                    </div>
                    <div>
                      <Label className="text-xs">Age</Label>
                      <Input value={draft.age} onChange={(e) => setDraft({ ...draft, age: e.target.value })} placeholder="22" />
                    </div>
                    <div>
                      <Label className="text-xs">Event</Label>
                      <Input value={draft.event} onChange={(e) => setDraft({ ...draft, event: e.target.value })} />
                    </div>
                  </>
                )}
                {step === 2 && (
                  <div className="space-y-2 rounded-lg border border-slate-200 p-3 text-sm">
                    <p className="text-xs text-slate-500">Required documents</p>
                    <DocRow name="Federation registration form" />
                    <DocRow name="Medical clearance" />
                    <DocRow name="Anti-doping consent" />
                    <DocRow name="Photo ID" />
                  </div>
                )}
                {step === 3 && (
                  <>
                    <div>
                      <Label className="text-xs">Squad</Label>
                      <Select value={draft.squad} onValueChange={(v) => setDraft({ ...draft, squad: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sprint A">Sprint A</SelectItem>
                          <SelectItem value="Sprint B">Sprint B</SelectItem>
                          <SelectItem value="Jumps">Jumps</SelectItem>
                          <SelectItem value="Throws">Throws</SelectItem>
                          <SelectItem value="Mid distance">Mid distance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Coach</Label>
                      <Select value={draft.coach} onValueChange={(v) => setDraft({ ...draft, coach: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Meera Iyer">Meera Iyer</SelectItem>
                          <SelectItem value="Suresh Kumar">Suresh Kumar</SelectItem>
                          <SelectItem value="Anil Khanna">Anil Khanna</SelectItem>
                          <SelectItem value="Rajesh Bhat">Rajesh Bhat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                {step === 4 && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
                    <p className="font-medium text-slate-900">Send invite</p>
                    <ul className="mt-2 space-y-1 text-xs text-slate-600">
                      <li>· {draft.name || "Unnamed"} ({draft.event})</li>
                      <li>· Squad {draft.squad}</li>
                      <li>· Coach {draft.coach}</li>
                      <li>· Enters pipeline at <strong>invited</strong> → self-register → docs → Ops verify → active</li>
                    </ul>
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  {step > 1 && <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>Back</Button>}
                  <Button data-testid="onb-next" size="sm" className="bg-[#1E40AF] hover:bg-[#1E3A8A]" onClick={submit}>
                    {step === 4 ? "Send invite" : "Continue"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      />

      <ScopeNote scopeLabel={scopeLabel} readOnly={!canAdd} note={canAdd ? undefined : "registry is read-only for your role"} />

      <Card>
        <CardHeader
          title={`Roster · ${filtered.length} of ${athletes.length} athletes`}
          action={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  data-testid="athletes-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search…"
                  className="h-8 w-56 rounded-md border border-slate-200 bg-white pl-8 pr-3 text-xs focus:border-[#1E40AF] focus:outline-none"
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="injured">Injured</SelectItem>
                  <SelectItem value="rehab">In rehab</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger data-testid="athletes-tag-filter" className="h-8 w-36 text-xs">
                  <Tag className="mr-1 h-3 w-3 text-slate-400" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tags</SelectItem>
                  {ATHLETE_TAGS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
        />
        <CardBody className="p-0">
          <DataTable
            testId="athletes-table"
            columns={columns}
            rows={filtered.map((r) => ({ ...r, testId: `row-${r.id}` }))}
            onRowClick={(r) => setOpenId(r.id)}
          />
        </CardBody>
      </Card>

      <AthleteDrawer athleteId={openId} open={!!openId} onOpenChange={(o) => !o && setOpenId(null)} />
    </div>
  );
}

function DocRow({ name }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2">
      <span className="text-xs text-slate-700">{name}</span>
      <span className="flex items-center gap-1 text-[11px] text-emerald-600"><CheckCircle2 className="h-3 w-3" /> Received</span>
    </div>
  );
}
