import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Copy, Check, FileUp, ShieldCheck, UserPlus, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";

// Stage-aware onboarding flow. The same dialog drives every step of the
// lifecycle so the demo can walk an athlete end to end:
//   invited  → Ops shares the invite link; athlete self-registers (profile + consents)
//   pending  → athlete uploads the four required documents
//   review   → Ops verifies the documents and activates the account
//   active   → fully onboarded summary
const REQUIRED_DOCS = [
  "Federation registration form",
  "Medical clearance",
  "Anti-doping consent",
  "Photo ID",
];

const STAGE_VARIANT = { invited: "mild", pending: "moderate", review: "rehab", active: "cleared" };

export function OnboardingDialog({ athlete, open, onOpenChange }) {
  const { selfRegisterAthlete, submitOnboardingDocs, verifyOnboarding } = useApp();
  const [copied, setCopied] = useState(false);
  const [reg, setReg] = useState({ dob: "", phone: "", emergencyName: "", emergencyPhone: "" });
  const [consents, setConsents] = useState({ data: false, antiDoping: false, medical: false });
  const [uploaded, setUploaded] = useState([]);

  if (!athlete) return null;
  const stage = athlete.onboarding;

  const regValid = reg.dob && reg.phone && reg.emergencyName && reg.emergencyPhone && consents.data && consents.antiDoping && consents.medical;
  const allUploaded = REQUIRED_DOCS.every((d) => uploaded.includes(d));

  const copyLink = () => {
    const link = `https://usi.app/onboard/${athlete.inviteCode || athlete.id}`;
    try { navigator.clipboard?.writeText(link); } catch (_) { /* clipboard unavailable in sandbox */ }
    setCopied(true);
    toast.success("Invite link copied");
    setTimeout(() => setCopied(false), 1800);
  };

  const doRegister = () => {
    selfRegisterAthlete(athlete.id, reg);
    toast.success(`${athlete.name} self-registered · awaiting documents`);
    onOpenChange(false);
  };

  const doUpload = () => {
    submitOnboardingDocs(athlete.id);
    toast.success(`${athlete.name} submitted documents · ready for verification`);
    onOpenChange(false);
  };

  const doVerify = () => {
    verifyOnboarding(athlete.id);
    toast.success(`${athlete.name} verified & activated`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="onboarding-dialog" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {stage === "invited" && <UserPlus className="h-4 w-4 text-[#1E40AF]" />}
            {stage === "pending" && <FileUp className="h-4 w-4 text-[#1E40AF]" />}
            {stage === "review" && <ShieldCheck className="h-4 w-4 text-[#1E40AF]" />}
            {stage === "active" && <ClipboardCheck className="h-4 w-4 text-[#065F46]" />}
            {athlete.name}
            <StatusBadge variant={STAGE_VARIANT[stage] || "mild"}>{stage}</StatusBadge>
          </DialogTitle>
          <DialogDescription>
            {stage === "invited" && "Step 1 of 3 · Share the invite, then complete self-registration."}
            {stage === "pending" && "Step 2 of 3 · Upload the required onboarding documents."}
            {stage === "review" && "Step 3 of 3 · Verify documents to activate the account."}
            {stage === "active" && "Onboarding complete — account is active."}
          </DialogDescription>
        </DialogHeader>

        {/* Stage indicator */}
        <ol className="flex items-center gap-1 text-[10px] font-medium">
          {["invited", "pending", "review", "active"].map((s, i) => {
            const order = ["invited", "pending", "review", "active"];
            const done = order.indexOf(stage) > i;
            const current = stage === s;
            return (
              <li key={s} className="flex flex-1 items-center gap-1">
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] ${done ? "bg-[#059669] text-white" : current ? "bg-[#1E40AF] text-white" : "bg-slate-100 text-slate-500"}`}>
                  {done ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                {i < 3 && <span className={`h-0.5 flex-1 ${done ? "bg-[#059669]" : "bg-slate-200"}`} />}
              </li>
            );
          })}
        </ol>

        {/* INVITED → self-registration */}
        {stage === "invited" && (
          <div className="space-y-3">
            <div className="rounded-lg border border-[#1E40AF]/20 bg-[#EFF6FF] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#1E40AF]">Invite link</p>
              <div className="mt-1 flex items-center gap-2">
                <code data-testid="invite-code" className="flex-1 truncate rounded bg-white px-2 py-1 text-xs text-slate-700">
                  https://usi.app/onboard/{athlete.inviteCode || athlete.id}
                </code>
                <Button data-testid="copy-invite" size="sm" variant="outline" onClick={copyLink}>
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
            <p className="text-xs font-medium text-slate-700">Athlete self-registration</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Date of birth</Label>
                <Input data-testid="reg-dob" type="date" value={reg.dob} onChange={(e) => setReg({ ...reg, dob: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Phone</Label>
                <Input data-testid="reg-phone" value={reg.phone} onChange={(e) => setReg({ ...reg, phone: e.target.value })} placeholder="+91…" />
              </div>
              <div>
                <Label className="text-xs">Emergency contact</Label>
                <Input data-testid="reg-emergency-name" value={reg.emergencyName} onChange={(e) => setReg({ ...reg, emergencyName: e.target.value })} placeholder="Name" />
              </div>
              <div>
                <Label className="text-xs">Emergency phone</Label>
                <Input data-testid="reg-emergency-phone" value={reg.emergencyPhone} onChange={(e) => setReg({ ...reg, emergencyPhone: e.target.value })} placeholder="+91…" />
              </div>
            </div>
            <div className="space-y-1.5 rounded-lg border border-slate-200 p-3">
              {[
                { k: "data", label: "I consent to USI processing my performance & health data" },
                { k: "antiDoping", label: "I agree to the anti-doping policy" },
                { k: "medical", label: "I confirm my medical information is accurate" },
              ].map((c) => (
                <label key={c.k} className="flex cursor-pointer items-start gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    data-testid={`consent-${c.k}`}
                    checked={consents[c.k]}
                    onChange={(e) => setConsents((p) => ({ ...p, [c.k]: e.target.checked }))}
                    className="mt-0.5"
                  />
                  {c.label}
                </label>
              ))}
            </div>
            <DialogFooter>
              <Button data-testid="submit-registration" disabled={!regValid} onClick={doRegister} className="bg-[#1E40AF] hover:bg-[#1E3A8A]">
                Complete registration
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* PENDING → document upload */}
        {stage === "pending" && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">Upload each required document. Mock upload — no file leaves the browser.</p>
            <div className="space-y-2">
              {REQUIRED_DOCS.map((d) => {
                const done = uploaded.includes(d);
                return (
                  <button
                    key={d}
                    data-testid={`upload-${d.replace(/\s+/g, "-").toLowerCase()}`}
                    onClick={() => setUploaded((p) => (done ? p.filter((x) => x !== d) : [...p, d]))}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition-colors ${done ? "border-[#059669]/40 bg-[#D1FAE5]/40" : "border-slate-200 hover:bg-slate-50"}`}
                  >
                    <span className="font-medium text-slate-700">{d}</span>
                    {done ? (
                      <span className="flex items-center gap-1 text-[#065F46]"><Check className="h-3.5 w-3.5" /> Uploaded</span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-400"><FileUp className="h-3.5 w-3.5" /> Upload</span>
                    )}
                  </button>
                );
              })}
            </div>
            <DialogFooter>
              <Button data-testid="submit-documents" disabled={!allUploaded} onClick={doUpload} className="bg-[#1E40AF] hover:bg-[#1E3A8A]">
                Submit for verification
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* REVIEW → Ops verification */}
        {stage === "review" && (
          <div className="space-y-3">
            <div className="rounded-lg border border-slate-200 p-3 text-xs">
              <p className="font-medium text-slate-700">Submitted documents</p>
              <div className="mt-2 space-y-1.5">
                {(athlete.documents || []).map((d) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <span className="text-slate-600">{d.name}</span>
                    <span className="text-slate-400">{d.uploadedOn}</span>
                  </div>
                ))}
              </div>
            </div>
            {athlete.registration && (
              <div className="rounded-lg border border-slate-200 p-3 text-xs text-slate-600">
                <p className="font-medium text-slate-700">Registration</p>
                <p className="mt-1">DOB {athlete.registration.dob} · {athlete.registration.phone}</p>
                <p>Emergency: {athlete.registration.emergencyName} · {athlete.registration.emergencyPhone}</p>
              </div>
            )}
            <DialogFooter>
              <Button data-testid="verify-activate" onClick={doVerify} className="bg-[#1E40AF] hover:bg-[#1E3A8A]">
                <ShieldCheck className="mr-1.5 h-4 w-4" /> Verify & activate
              </Button>
            </DialogFooter>
          </div>
        )}

        {stage === "active" && (
          <div className="rounded-lg border border-[#059669]/30 bg-[#D1FAE5]/40 p-4 text-sm text-[#065F46]">
            <p className="flex items-center gap-2 font-medium"><Check className="h-4 w-4" /> Fully onboarded</p>
            <p className="mt-1 text-xs">All documents verified. The athlete now has full access to their self-view.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
