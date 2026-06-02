import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/shared/Card";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { FITNESS_TESTS, TALENT_PROGRESSION } from "@/data/seed";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Assessments() {
  return (
    <div data-testid="assessments-page">
      <PageHeader
        title="Assessments & TID"
        subtitle="Fitness testing, talent identification and progression analytics"
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
                { key: "benchmark", header: "Benchmark", render: (r) => <StatusBadge variant={r.benchmark === "Elite" ? "cleared" : "rehab"}>{r.benchmark}</StatusBadge> },
              ]}
              rows={FITNESS_TESTS}
            />
          </CardBody>
        </Card>

        <Card className="col-span-4">
          <CardHeader title="Talent score" subtitle="Composite of speed, power, anthropometry & coachability" />
          <CardBody className="space-y-2">
            {[
              { name: "Arjun Sharma", score: 92, tier: "Elite prospect" },
              { name: "Aditya Patel", score: 88, tier: "Elite prospect" },
              { name: "Devika Rao", score: 85, tier: "National" },
              { name: "Rohan Verma", score: 82, tier: "National" },
              { name: "Karan Singh", score: 78, tier: "National" },
              { name: "Anjali Mehta", score: 75, tier: "Developing" },
            ].map((t, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
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
              <BarChart data={FITNESS_TESTS} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="athleteName" stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} interval={0} angle={-25} textAnchor="end" height={60} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} domain={[3.5, 4]} />
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
