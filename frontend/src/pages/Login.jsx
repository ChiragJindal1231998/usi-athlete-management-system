import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { ROLES, STAFF, ATHLETE_LOGINS, ATHLETES_SEED } from "@/data/seed";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User2, ShieldCheck, ArrowRight, KeyRound, Activity, Sparkles,
} from "lucide-react";
import { toast } from "sonner";

// Credential-free demo sign-in landing. Faithful to README §10 (the spec excludes
// real auth / accounts) — this is a *role chooser*, not a login form. There are no
// passwords; picking a profile simply switches the app's role/identity. The TopBar
// switcher remains the in-app way to change persona after entering.
export const ENTERED_KEY = "ams-entered";

export function markEntered() {
  try { window.sessionStorage.setItem(ENTERED_KEY, "1"); } catch (_) { /* private mode */ }
}

const SEED_ATHLETE_IDS = new Set(ATHLETES_SEED.map((a) => a.id));
const STAGE_LABEL = {
  invited: "invited — awaiting self-register",
  pending: "self-registered — docs pending",
  review: "docs in review",
  active: "active",
  verified: "verified",
};

// A short blurb per staff role so the chooser reads like a real onboarding screen.
const ROLE_BLURB = {
  admin: "Federation-wide roster, onboarding & exports",
  director: "Selection, risk & program-level analytics",
  coach: "My squads — load, attendance & class enrolment",
  physio: "Medical caseload, injuries & return-to-play",
  scientist: "Aggregate readiness & testing science",
  nutritionist: "Fuelling plans across all athletes",
  ops: "Athlete onboarding, verification & documents",
};

export default function Login() {
  const navigate = useNavigate();
  const { setRole, loginAsAthlete, athletes } = useApp();
  const [tab, setTab] = useState("athlete"); // "athlete" | "staff"
  const [code, setCode] = useState("");

  // Curated demo athletes + any registered at runtime, so a freshly-onboarded
  // athlete can sign in and walk their own journey.
  const registeredLogins = athletes
    .filter((a) => !SEED_ATHLETE_IDS.has(a.id))
    .map((a) => ({
      id: a.id,
      name: a.name,
      note: `${a.event || a.sport || "Athlete"} · ${STAGE_LABEL[a.onboarding] || a.onboarding || "active"}`,
    }));
  const athleteLogins = [...ATHLETE_LOGINS, ...registeredLogins];

  const enterAsAthlete = (id) => {
    loginAsAthlete(id);
    markEntered();
    navigate("/");
  };

  const enterAsStaff = (id) => {
    setRole(id);
    markEntered();
    navigate("/");
  };

  // Invite-code path: must match an athlete's `inviteCode` and follow the
  // USI-XXXX-XXXX format issued by Ops on invite. Raw athlete IDs are
  // intentionally NOT accepted — a real federation should never let someone
  // sign in by guessing a roster ID.
  const INVITE_PATTERN = /^USI-[A-Z0-9]{3,5}-[A-Z0-9]{3,5}$/;
  const redeemCode = (e) => {
    e.preventDefault();
    const q = code.trim().toUpperCase();
    if (!q) return;
    if (!INVITE_PATTERN.test(q)) {
      toast.error("Invite codes look like USI-XXXX-XXXX — check the code from your onboarding email");
      return;
    }
    const match = athletes.find((a) => a.inviteCode && a.inviteCode.toUpperCase() === q);
    if (!match) {
      toast.error("No matching invite — check the code from your onboarding email");
      return;
    }
    toast.success(`Welcome, ${match.name.trim()}`);
    enterAsAthlete(match.id);
  };

  const skipIntoDemo = () => {
    setRole("director");
    markEntered();
    navigate("/");
  };

  const staffRoles = ROLES.filter((r) => r.id !== "athlete");

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Brand bar */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
          <p className="text-sm font-semibold tracking-tight text-slate-900">
            USI <span className="text-slate-300">·</span>{" "}
            <span className="font-medium text-slate-600">Athlete management</span>
          </p>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
            Demo
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10 md:py-14">
        {/* Hero */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1E40AF]/10 px-3 py-1 text-[11px] font-medium text-[#1E40AF]">
            <Sparkles className="h-3.5 w-3.5" /> Sports federation performance platform
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Sign in to your USI workspace
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            This is an interactive product demo — pick the role you want to explore.
            No password required; every persona sees a tailored, access-scoped view.
          </p>
        </div>

        {/* Tab switch */}
        <div className="mx-auto mt-8 flex max-w-xs rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            data-testid="login-tab-athlete"
            onClick={() => setTab("athlete")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${tab === "athlete" ? "bg-[#1E40AF] text-white" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <Activity className="h-4 w-4" /> I&rsquo;m an athlete
          </button>
          <button
            data-testid="login-tab-staff"
            onClick={() => setTab("staff")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${tab === "staff" ? "bg-[#1E40AF] text-white" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <ShieldCheck className="h-4 w-4" /> I&rsquo;m staff
          </button>
        </div>

        {/* ATHLETE */}
        {tab === "athlete" && (
          <div data-testid="login-athlete-panel" className="mt-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {athleteLogins.map((a) => (
                <button
                  key={a.id}
                  data-testid={`login-as-athlete-${a.id}`}
                  onClick={() => enterAsAthlete(a.id)}
                  className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-[#1E40AF]/40 hover:shadow-md"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1E40AF] text-xs font-semibold text-white">
                    {a.name.trim().split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-900">{a.name.trim()}</span>
                    <span className="block truncate text-xs text-slate-500">{a.note}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-[#1E40AF]" />
                </button>
              ))}
            </div>

            {/* Invite-code redemption */}
            <form
              onSubmit={redeemCode}
              data-testid="login-invite-form"
              className="mx-auto mt-6 max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-[#1E40AF]" />
                <p className="text-sm font-semibold text-slate-900">Have an invite code?</p>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                New athletes: enter the code from your onboarding email to sign in and finish registering.
              </p>
              <div className="mt-3 flex items-end gap-2">
                <div className="flex-1">
                  <Label className="text-xs">Invite code</Label>
                  <Input
                    data-testid="login-invite-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="USI-XXXX-XXXX"
                    className="font-mono"
                  />
                </div>
                <Button type="submit" data-testid="login-invite-submit" className="bg-[#1E40AF] hover:bg-[#1E3A8A]">
                  Continue
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* STAFF */}
        {tab === "staff" && (
          <div data-testid="login-staff-panel" className="mt-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {staffRoles.map((r) => (
                <button
                  key={r.id}
                  data-testid={`login-as-${r.id}`}
                  onClick={() => enterAsStaff(r.id)}
                  className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-[#1E40AF]/40 hover:shadow-md"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1E40AF]/10 text-[#1E40AF]">
                    <User2 className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-900">{r.label}</span>
                    <span className="block text-xs text-slate-500">{STAFF[r.id]?.name}</span>
                    <span className="mt-1 block text-[11px] leading-snug text-slate-400">{ROLE_BLURB[r.id]}</span>
                  </span>
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-[#1E40AF]" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Skip */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <button
            data-testid="login-skip"
            onClick={skipIntoDemo}
            className="text-sm font-medium text-[#1E40AF] hover:underline"
          >
            Skip — explore as Performance Director
          </button>
          <p className="text-[11px] text-slate-400">You can switch persona anytime from the top-bar account menu.</p>
        </div>
      </div>
    </div>
  );
}
