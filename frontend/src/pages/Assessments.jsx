import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/shared/Card";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TALENT_PROGRESSION } from "@/data/seed";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const EMPTY = { athleteId: "", sprint30: "", sprint60: "", cmj: "", broadJump: "", benchmark: "National" };

export default function Assessments() {
  const { athletes, fitnessTests, addFitnessTest } = useApp();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY);

  const set = (k) => (e) => setDraft((d) => ({ ...d, [k]: e?.target ? e.target.value : e }));
  const valid = draft.athleteId && draft.sprint30 && draft.sprint60 && draft.cmj && draft.broadJump;

  const submit = () => {
    if (!valid) return;
    const row = addFitnessTest(draft);
    toast.success(`Test result recorded for ${row.athleteName} · ${row.benchmark}`);
    setDraft(EMPTY);
    setOpen(false);
  };

  // Talent ranking derived from live athletes (not a hardcoded list).
  const talentRank = [...athletes]
    .filter((a) => a.talentScore)
    .sort((a, b) => b.talentScore - a.talentScore)
    .slice(0, 6)
    .map((a) => ({
      name: a.name,
      score: a.talentScore,
      tier: a.talentScore >= 86 ? "Elite prospect" : a.talentScore >= 78 ? "National" : "Developing",
    }));

  return (
    <div data-testid="assessments-page">
      <PageHeader
        title="Assessments & TID"
        subtitle="Fitness testing, talent identification and progression analytics"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="add-test-result" className="bg-[#1E40AF] hover:bg-[#1E3A8A]">
                <Plus className="mr-1.5 h-4 w-4" /> Record result
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="test-entry-dialog">
              <DialogHeader>
                <DialogTitle>Record fitness test result</DialogTitle>
                <DialogDescription>Enter a new combine result. Benchmark is auto-derived from the 30 m time unless overridden.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-1">
                <div>
                  <Label className="text-xs text-slate-500">Athlete</Label>
                  <Select value={draft.athleteId} onValueChange={set("athleteId")}>
                    <SelectTrigger data-testid="test-athlete-select" className="mt-1"><SelectValue placeholder="Select athlete" /></SelectTrigger>
                    <SelectContent>
                      {athletes.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.name} · {a.id}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-slate-500">30 m (s)</Label>
                    <Input data-testid="test-sprint30" className="mt-1" type="number" step="0.01" value={draft.sprint30} onChange={set("sprint30")} placeholder="3.78" />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">60 m (s)</Label>
                    <Input data-testid="test-sprint60" className="mt-1" type="number" step="0.01" value={draft.sprint60} onChange={set("sprint60")} placeholder="6.74" />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">CMJ (cm)</Label>
                    <Input data-testid="test-cmj" className="mt-1" type="number" step="0.1" value={draft.cmj} onChange={set("cmj")} placeholder="54.2" />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Broad jump (cm)</Label>
                    <Input data-testid="test-broad" className="mt-1" type="number" value={draft.broadJump} onChange={set("broadJump")} placeholder="295" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Benchmark</Label>
                  <Select value={draft.benchmark} onValueChange={set("benchmark")}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Elite">Elite</SelectItem>
                      <SelectItem value="National">National</SelectItem>
                      <SelectItem value="Developing">Developing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button data-testid="test-submit" disabled={!valid} onClick={submit} className="bg-[#1E40AF] hover:bg-[#1E3A8A]">Save result</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-8">
          <CardHeader title="Fitness test register · Feb 2025" subtitle="Sprint, jump and combine results vs national / elite benchmarks" />
          <CardBody className="p-0">
            <DataTable
              columns={[
                { key: "athleteName", header: "Athlete", render: (r) => <div><p className="text-sm font-medium text-slate-900">{r.athleteName}</p><p className="text-[11px] text-slate-500">{r.athleteId}</p></div> },
                { key: "sprint30", header: "30 m (s)", render: (r) => <span className="mono">{r.sprint30.toFixed(2)}</span> },
                { key: "sprint60", header: "60 m (s)", render: (r) => <span className="mono">{r.sprint60.toFixed(2)}</span> },
                { key: "cmj", header: "CMJ (cm)", render: (r) => <span className="mono">{r.cmj.toFixed(1)}</span> },
                { key: "broadJump", header: "Broad (cm)", render: (r) => <span className="mono">{r.broadJump}</span> },
                { key: "benchmark", header: "Benchmark", render: (r) => <StatusBadge variant={r.benchmark === "Elite" ? "cleared" : r.benchmark === "Developing" ? "mild" : "rehab"}>{r.benchmark}</StatusBadge> },
              ]}
              rows={fitnessTests}
            />
          </CardBody>
        </Card>

        <Card className="col-span-4">
          <CardHeader title="Talent score" subtitle="Composite of speed, power, anthropometry & coachability" />
          <CardBody className="space-y-2">
            {talentRank.map((t, i) => (
              <div key={t.name} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600">{i + 1}</span>
                  <div>
                    <p className="font-medium text-slate-900">{t.name}</p>
                    <p className="text-[10px] text-slate-500">{t.tier}</p>
                  </div>
                </div>
                <span className="text-lg font-semibold text-[#1E40AF]">{t.score}</span>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <Card className="col-span-7">
          <CardHeader title="Progression · Arjun vs squad" subtitle="Composite talent score by month" />
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={TALENT_PROGRESSION} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} domain={[60, 100]} />
                <Tooltip contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="arjun" stroke="#1E40AF" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="squad" stroke="#94A3B8" strokeWidth={2} dot={{ r: 2.5 }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="h-1 w-3 rounded bg-[#1E40AF]" /> Arjun</span>
              <span className="flex items-center gap-1.5"><span className="h-1 w-3 rounded bg-[#94A3B8]" /> Squad average</span>
            </div>
          </CardBody>
        </Card>

        <Card className="col-span-5">
          <CardHeader title="Comparative analytics" subtitle="30 m sprint times vs squad" />
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={fitnessTests} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="athleteName" stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} interval={0} angle={-25} textAnchor="end" height={60} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} domain={[3.5, 4.2]} />
                <Tooltip contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="sprint30" radius={[4, 4, 0, 0]} fill="#1E40AF" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
