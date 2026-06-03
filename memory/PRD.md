# Athlete Management System (AMS) — PRD

## Original problem statement
High-fidelity, production-feel prototype of an enterprise SaaS — the Athlete Management System (AMS) inside the Unified Sports Interface (USI). React + Tailwind, in-memory mock data only (no backend, no DB, no auth). Nine modules. Centered around the seeded scenario of **Arjun Sharma (SPR-014)**, 22, 100m sprinter, who is rehabbing a grade 2 right-hamstring strain that the AI predicted 4 days early.

## Architecture
- React 19 + react-router-dom 7 + Tailwind + shadcn/ui
- State: React Context (`AppContext`) with seed data (`/data/seed.js`)
- Charts: Recharts · Animations: Framer Motion (subtle) · Toasts: sonner · Icons: lucide-react
- Font: **DM Sans** (more distinctive than Inter while still enterprise-clean)
- No backend, no database, no env keys required.

## User personas (8, role switcher in TopBar)
- Federation admin · Performance director · Coach · Physiotherapist · Sports scientist · Nutritionist · Operations team · Athlete (self-view). The role switcher drives a **fully role-differentiated Dashboard** (each persona lands on a distinct, job-specific view — see below) plus a role-aware header chip and the signed-in profile in the account menu (`STAFF[role]`).

## Access control & data scoping (RBAC)
All nine nav tabs stay **visible to every role** ("show all tabs, scope data only" — no route guards, no hidden modules). Differentiation happens *inside* each module along two orthogonal dimensions, both centralised in `frontend/src/lib/access.js` and consumed via `AppContext`:

- **Data scope** — `scopeAthletes(role, athletes)`: an athlete sees only their own record (`ROLE_IDENTITY.athlete → SPR-014`, Arjun); a coach sees only athletes they coach (`ROLE_IDENTITY.coach → Meera Iyer`, i.e. Sprint A/B); all other staff are federation-wide. Modules read `scopedAthletes` / `me` (the self athlete, or null for staff) rather than the raw `athletes` list, and surface a `<ScopeNote>` banner stating what's in view.
- **Capabilities** — `can(role, capability)`: write affordances are gated by an owning-role map (e.g. `injury.report`/`injury.advance` → physio, `training.acceptAI`/`training.moveSession` → coach, `nutrition.edit` → nutritionist, `assessment.record` → scientist/director, `athletes.add`/`athletes.verify` → ops/admin, `analytics.export` → ops/director/admin, `self.*` → athlete). Non-owning roles see the same data **read-only** (buttons hidden or replaced with status badges).
- **Athlete exception (explicit):** the athlete persona never sees the "add athlete" affordance and the Copilot snapshot is scoped to their own record only (`me` → stats/athletes/injuries filtered to self, alerts emptied), so the LLM can never answer about other athletes.

## Core requirements implemented
1. **Dashboard / Command center (role-differentiated)** — `Dashboard.jsx` is a thin router that dispatches by `role` to one of eight purpose-built views under `components/dashboard/` (each takes `onOpenAthlete` and reuses StatCard / Card / AIInsight / StatusBadge / shared widgets), with a role-aware `PageHeader` surfacing the persona's scope and a `role-context-chip`:
   - **Admin** — org-wide: squad breakdown (computed headcount/availability/avg readiness), active alerts, participation-by-program chart. AI insight is org-level (names the squads carrying injury load, computed — no single-athlete callout).
   - **Director** — selection pool (top talent scores), trending up/down, readiness trend (squad vs Arjun).
   - **Coach** — Sprint A squad: today's session + live attendance counts, squad ACWR bars (1.3 reference line), attention-first roster.
   - **Physio** — return-to-play queue (Arjun first, ordered by attention) with per-case stage progress, wellness flags.
   - **Scientist** — squad-framed: per-athlete ACWR band chart, squad load-vs-readiness scatter (danger quadrant), squad anomaly-detection insight (highest-ACWR cases, not Arjun-centric), highest-mechanical-risk ranking.
   - **Nutritionist** — squad fuelling compliance only (no injury/rehab content): adherence-by-athlete (lowest first, drift detection) + adherence-by-squad chart vs the 80% target.
   - **Ops** — onboarding pipeline (funnel + per-athlete advance), document-verification queue, week's schedule.
   - **Athlete** — single responsive self-view (Arjun, no phone frame): stacks on mobile, flows into a two-column `md:` grid from 768px. Readiness ring, rehab progress + milestone timeline, today's plan, wellness check-in, fuelling, tappable task list. Uses the standard dashboard PageHeader.

   **Per-persona tailoring rule:** Arjun's injury story appears only where it is genuinely relevant to that role — Physio (front and centre), Coach (one alert item) and Director (one of several flagged). Admin, Scientist, Nutritionist and Ops views are framed squad-wide / org-wide and do not centre Arjun.
2. **Athletes** — registry DataTable (scoped: an athlete sees only their own row), search + status filter + **tag filter**, **tags column**. "Add athlete" is gated to `athletes.add` (ops/admin) and enrols at the **invited** stage with a generated `inviteCode`. Click-row drawer with Overview / Training / Medical / Documents tabs; Overview tab manages **athlete tags** (add/remove gated to `athletes.tag`) and shows an **onboarding advance** button gated to `athletes.verify`. Documents tab prefers the live-captured `athlete.documents` over seed.

   **Onboarding lifecycle (invite → self-register → verify → active):** a single stage-aware `OnboardingDialog` (launched from the Ops dashboard pipeline + verification queue) walks an athlete end to end, backed by three real `AppContext` mutators:
   - `addAthlete` (Ops/Admin) — creates the row at **invited** with an `inviteCode` and a copyable invite link.
   - `selfRegisterAthlete` (Athlete) — captures profile (DOB/phone/emergency contact) + three consents → **pending**.
   - `submitOnboardingDocs` (Athlete) — uploads the four `REQUIRED_DOCS` (federation form, medical clearance, anti-doping consent, photo ID) → **review**.
   - `verifyOnboarding` (Ops/Admin) — signs off the documents → **active**, sets `docsVerified` and marks every document verified.
3. **Training & periodisation** — macro→meso→micro timeline, current microcycle with load bars, AI load-reduction Insight with **Accept** button that swaps Friday/Saturday to recovery (real state change). ACWR 8-week chart with sweet-spot band. Exercise-library session builder. **Session attendance roster** — per-athlete present/late/absent/excused toggles with live count summary (real state via `setAttendanceStatus`).
4. **Medical & injury (priority)** — fully interactive SVG body map (20 regions), Arjun's right thigh pre-coloured rehab-blue. Detail panel with AI prediction record, **5-stage RTP tracker** (Reported → Under treatment → Rehab → Return-to-play → Cleared) advanced via real state mutation; reaching Cleared turns region green and sets athlete to available. Healthy regions show mild/moderate/severe Report buttons that immediately colour the region. **Clinical timeline** per injury (history entries) with an **add-note** input that appends real entries; stage advances and new reports also append to the timeline. Squad injury log table + wellness check-ins chart.
5. **Sports science** — HRV/sleep/load/ACWR stats + AI risk-detection explainer + charts + recovery actions list + **GPS external-load card** (ComposedChart: total/HSR/sprint distance bars + max-speed line over last 7 sessions) with a rolling-totals summary panel + **wearable-integration stub** (connect/disconnect toggles for Catapult/WHOOP/Polar/Oura, local UI only).
6. **Nutrition** — 4 stat cards, adherence area chart, macro split, hydration chart, supplements compliance, body-composition trend.
7. **Assessments & TID** — fitness test register (live `fitnessTests` state), **Record result** dialog that appends a real test row via `addFitnessTest` (benchmark auto-derived from 30 m time), talent ranking computed from live `talentScore`, progression chart, 30 m comparative chart.
8. **Analytics & BI** — drill-down breadcrumb that **re-scopes the actual cohort** (Federation→Athletics→Sprints→Sprint A), recomputing every stat card, the readiness trend, injury-rate scaling, participation and the AI insight; **Export report** downloads a real CSV of the scoped roster.
9. **AI Copilot** — live streaming chat backed by Claude Sonnet 4.5 (`POST /api/copilot/chat`, SSE token frames via emergentintegrations). The system prompt is rebuilt per request from a **live state snapshot the frontend sends**, so answers are grounded on current data. The snapshot is **role-scoped**: staff get their full scope; an athlete (`me`) gets stats/athletes/injuries filtered to their own record with alerts emptied, plus a self-focused suggestion set and welcome/footer copy — the model can never see other athletes.

## Seed data depth (narrative spine: Arjun Sharma, SPR-014)
- **12 athletes** with varied readiness (52–88), ACWR (0.91–1.52), talent score (68–92), nutrition adherence (64–93), onboarding states (invited/pending/review/active) and doc-verification flags.
- **5 injuries across the full RTP arc**: Arjun (Rehab, AI-predicted), Manish/SPR-018 (Return-to-play), Sandeep/THR-003 (Under treatment, AI-flagged load spike), Rohan/SPR-002 (**Cleared** — full recovered arc), Neha/SPR-022 (**Reported** — new precautionary hamstring flag off a 3-week ACWR drift). Each carries a clinical history timeline.
- **Named story hooks** the Copilot & Director reference resolve to real athletes: the "3 at-risk" = Arjun, Sandeep, Aditya; Neha Joshi is the new AI-flagged drift case. Copilot scripted answers, alerts (AL-01…AL-04), attendance and fitness register kept numerically coherent across modules.

## Status
- 1st-pass MVP complete and verified visually + via partial subagent run + manual screenshots.
- All 9 modules navigable, key interactions functional with real state changes.
- No console errors.

## Backlog / next phases
- P2: Multi-sport seeding beyond athletics
- P2: PDF export option for Analytics report (CSV export shipped)
- P2: Calendar view for training periodisation (drag/drop sessions)
- P2: Real wearable-device API integration (currently a UI stub)

Last updated: 2026-06 (RBAC scope + capability model, full onboarding lifecycle, scoped Copilot)
