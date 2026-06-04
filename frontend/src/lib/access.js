// Centralised role-based access control for the AMS demo.
//
// Two orthogonal dimensions drive every module:
//   1. DATA SCOPE  — which athletes a role is allowed to see.
//   2. CAPABILITIES — which write/action affordances a role is allowed to use.
//
// Per the product decision, ALL nav tabs stay visible to every role — the
// differentiation happens here: pages scope their data and gate their action
// buttons through `scopeAthletes()` and `can()`. Nothing is hidden at the
// router level; an athlete simply sees a read-only, self-scoped view.

// The demo signs each non-athlete role in as a specific staff member, and the
// athlete role in as Arjun (SPR-014). Coaches are scoped to athletes they coach.
export const ROLE_IDENTITY = {
  athlete: { athleteId: "SPR-014" }, // Arjun Sharma — the protagonist
  coach: { staffName: "Meera Iyer" }, // scoped to her squads (Sprint A / Sprint B)
  // admin / director / physio / scientist / nutritionist / ops = federation-wide
};

// Human-readable description of each role's data reach (used in scope banners).
export const SCOPE_LABEL = {
  admin: "All squads · federation-wide",
  director: "All programs · selection & risk",
  coach: "My squads only",
  physio: "Full medical caseload",
  scientist: "All squads · aggregate",
  nutritionist: "All athletes · fuelling",
  ops: "All athletes · onboarding & docs",
  athlete: "My own record only",
};

// Capability keys, grouped by module. A role "can" do an action only if the
// key is present in its capability set below.
//   athletes.add        — open the onboarding/add-athlete flow
//   athletes.verify     — advance onboarding / verify documents
//   athletes.tag        — add or remove athlete tags
//   athletes.assignCoach— (re)assign an athlete's coach
//   injury.report       — report an injury via the body map
//   injury.advance      — advance the return-to-play stage
//   injury.note         — append a clinical note
//   training.acceptAI   — accept the AI load-reduction swap
//   training.attendance — set session attendance
//   training.moveSession— reorder periodisation sessions
//   training.assign     — enrol an athlete in weekly classes/sessions
//   nutrition.edit      — edit a fuelling plan
//   assessment.record   — record a fitness-test result
//   alert.dismiss       — dismiss an active alert
//   analytics.export    — export the BI report
//   self.checkin        — submit a wellness check-in (athlete)
//   self.tasks          — tick personal tasks (athlete)
//   self.register       — complete self-registration (athlete)
//   self.uploadDocs     — upload onboarding documents (athlete)
const CAPABILITIES = {
  admin: [
    "athletes.add", "athletes.verify", "athletes.tag", "athletes.assignCoach",
    "alert.dismiss", "analytics.export", "training.assign",
  ],
  director: [
    "alert.dismiss", "analytics.export", "assessment.record", "athletes.assignCoach",
    "training.assign",
  ],
  coach: [
    "training.acceptAI", "training.attendance", "training.moveSession",
    "training.assign", "athletes.tag",
  ],
  physio: [
    "injury.report", "injury.advance", "injury.note",
  ],
  scientist: [
    "assessment.record",
  ],
  nutritionist: [
    "nutrition.edit",
  ],
  ops: [
    "athletes.add", "athletes.verify", "athletes.tag", "analytics.export",
  ],
  athlete: [
    "self.checkin", "self.tasks", "self.register", "self.uploadDocs",
  ],
};

// Does `role` hold `capability`?
export function can(role, capability) {
  return (CAPABILITIES[role] || []).includes(capability);
}

// The athlete id a role is "signed in as" (only the athlete role has one).
// The athlete role can be signed in as any athlete via `athleteId`; it falls
// back to the protagonist (Arjun) when none is supplied.
export function selfAthleteId(role, athleteId) {
  if (role === "athlete") return athleteId || ROLE_IDENTITY.athlete.athleteId;
  return ROLE_IDENTITY[role]?.athleteId || null;
}

// Scope a full athlete list down to what `role` may see.
//   athlete → just their own record (the one they're signed in as)
//   coach   → only athletes they coach
//   everyone else → the full roster
export function scopeAthletes(role, athletes, athleteId) {
  const id = selfAthleteId(role, athleteId);
  if (id) return athletes.filter((a) => a.id === id);
  const staffName = ROLE_IDENTITY[role]?.staffName;
  if (staffName) return athletes.filter((a) => a.coach === staffName);
  return athletes;
}

// True when the role sees the whole federation (no narrowing applied).
export function isFederationScope(role) {
  return !ROLE_IDENTITY[role]?.athleteId && !ROLE_IDENTITY[role]?.staffName;
}
