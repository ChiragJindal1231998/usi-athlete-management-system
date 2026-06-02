# Athlete Management System (AMS) — PRD

## Original problem statement
High-fidelity, production-feel prototype of an enterprise SaaS — the Athlete Management System (AMS) inside the Unified Sports Interface (USI). React + Tailwind, in-memory mock data only (no backend, no DB, no auth). Nine modules. Centered around the seeded scenario of **Arjun Sharma (SPR-014)**, 22, 100m sprinter, who is rehabbing a grade 2 right-hamstring strain that the AI predicted 4 days early.

## Architecture
- React 19 + react-router-dom 7 + Tailwind + shadcn/ui
- State: React Context (`AppContext`) with seed data (`/data/seed.js`)
- Charts: Recharts · Animations: Framer Motion (subtle) · Toasts: sonner · Icons: lucide-react
- Font: **DM Sans** (more distinctive than Inter while still enterprise-clean)
- No backend, no database, no env keys required.

## User personas
- Federation admin · Performance director · Coach · Physiotherapist (role switcher in TopBar)

## Core requirements implemented
1. **Dashboard / Command center** — 4 stat cards, readiness trend chart (squad vs Arjun), AI-prioritised injury alerts, AI recommendations block, ACWR bar chart, athletes quick view. Role switcher changes subtitle and filtered roster.
2. **Athletes** — registry DataTable for 12 athletes, search + status filter, click-row drawer with Overview / Training / Medical / Documents tabs, 4-step onboarding dialog (details → docs → coach → approve) that adds a real new athlete row.
3. **Training & periodisation** — macro→meso→micro timeline, current microcycle with load bars, AI load-reduction Insight with **Accept** button that swaps Friday/Saturday to recovery (real state change). ACWR 8-week chart with sweet-spot band. Exercise-library session builder.
4. **Medical & injury (priority)** — fully interactive SVG body map (20 regions), Arjun's right thigh pre-coloured rehab-blue. Detail panel with AI prediction record, **5-stage RTP tracker** (Reported → Under treatment → Rehab → Return-to-play → Cleared) advanced via real state mutation; reaching Cleared turns region green and sets athlete to available. Healthy regions show mild/moderate/severe Report buttons that immediately colour the region. Squad injury log table + wellness check-ins chart.
5. **Sports science** — HRV/sleep/load/ACWR stats + AI risk-detection explainer + 4 charts + recovery actions list.
6. **Nutrition** — 4 stat cards, adherence area chart, macro split, hydration chart, supplements compliance, body-composition trend.
7. **Assessments & TID** — fitness test register, talent score ranking, progression chart, 30m comparative chart.
8. **Analytics & BI** — drill-down breadcrumb, AI predictive insight, readiness & injury-rate charts, participation by program, **Export report** button with toast.
9. **AI Copilot** — chat interface with typing indicator, 5 suggested questions, pre-scripted data-aware answers referencing seeded data (e.g., "Arjun is on day 14 of rehab…").

## Status
- 1st-pass MVP complete and verified visually + via partial subagent run + manual screenshots.
- All 9 modules navigable, key interactions functional with real state changes.
- No console errors.

## Backlog / next phases
- P1: Persist demo state across reload (localStorage)
- P1: Add a second seeded scenario (e.g., a throws athlete progression)
- P2: Real LLM-backed AI Copilot (Claude Sonnet 4.5 via Emergent LLM key)
- P2: Multi-sport seeding beyond athletics
- P2: PDF export for Analytics report (currently stub)
- P2: Calendar view for training periodisation (drag/drop sessions)

Last updated: 2026-02
