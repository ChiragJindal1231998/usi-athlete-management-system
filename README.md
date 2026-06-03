# USI · Athlete Management System (AMS)

> **Repository:** [github.com/ChiragJindal1231998/usi-athlete-management-system](https://github.com/ChiragJindal1231998/usi-athlete-management-system)
>
> ```bash
> git clone https://github.com/ChiragJindal1231998/usi-athlete-management-system.git
> ```
>
> Found a bug or want to suggest a feature? [Open an issue](https://github.com/ChiragJindal1231998/usi-athlete-management-system/issues).

A high-fidelity, production-feel prototype of an enterprise SaaS used by sports
federations, Olympic programs, and high-performance centres to manage athletes
end to end — registration, training, injury & rehab, sports science, nutrition,
talent identification, analytics, and an AI assistant.

This repo is built as a **product demo**, so it prioritises realistic
operational depth and working interactions over decoration. It is not a generic
admin template.

---

## 1. The scenario that ties the demo together

All nine modules tell the story of one athlete:

> **Arjun Sharma — SPR-014, 22, 100m sprinter, Sprint A squad.**
> Coach Meera Iyer, physio Dr Rao, performance director Vikram Desai.
> Over two weeks his training load drifted upward. The AI predicted elevated
> hamstring-injury risk **four days early** (ACWR 1.52, 78% confidence). The
> coach didn't reduce the load in time. Arjun strained his right hamstring
> (grade 2). He is now on day 14 of rehab, currently in **stage 3 of 5** of
> the return-to-play progression.

When you switch roles, drag training sessions, advance rehab stages, or ask the
AI Copilot a question, you are interacting with that scenario.

---

## 2. The nine modules

Order matches the left-hand sidebar.

| # | Module | What it does |
|---|---|---|
| 1 | **Dashboard / Command Center** | Stat cards (total / available / injured / readiness), squad readiness chart, AI-prioritised injury alerts, ACWR bar chart, athletes quick view. Content shifts with the role switcher. |
| 2 | **Athletes** | Registry data table (12 seeded athletes), click-row drawer with Overview / Training / Medical / Documents tabs, multi-step onboarding flow (invited → pending → verified → active). |
| 3 | **Training & Periodisation** | Macro→Meso→Micro timeline, **drag-and-drop weekly calendar**, AI load-reduction Insight with a real **Accept** button that rewrites Friday/Saturday sessions, 8-week ACWR chart with sweet-spot band, exercise-library session builder, RPE collector. |
| 4 | **Medical & Injury** *(priority module)* | Interactive SVG **body map** (20 clickable regions), per-region detail panel with AI prediction record, **5-stage return-to-play tracker** that mutates real state, mild/moderate/severe injury reporting that immediately colours the region, squad injury log, daily wellness check-ins (sleep / soreness / mood). |
| 5 | **Sports Science** | HRV, sleep, weekly load, ACWR stats; an AI risk-detection callout that **explains** the prediction (workload + recovery + wellness fusion); load / HRV / sleep charts; recovery actions list. |
| 6 | **Nutrition** | Daily plan, macro split, adherence area chart, hydration line, supplements compliance, body-composition trend. |
| 7 | **Assessments & TID** | Fitness-test register (30m / 60m / CMJ / broad jump) vs benchmarks, talent score ranking, Arjun-vs-squad progression chart, comparative analytics. |
| 8 | **Analytics & BI** | Drill-down breadcrumb (Federation → Athletics → Sprints → Sprint A), AI predictive insight, injury-rate & participation charts, **Export report** stub. |
| 9 | **AI Copilot** | Real chat layer powered by **Claude Sonnet 4.5** via Emergent LLM key. Streams token by token. Every request includes a fresh snapshot of athletes, injuries, and alerts as grounding context. |

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  React 19 + react-router-dom 7                                  │
│  Tailwind + shadcn/ui · Recharts · Framer Motion · sonner       │
│  Font: DM Sans                                                  │
│                                                                 │
│  ┌── AppContext (React Context) ────────────────────────────┐   │
│  │  athletes · injuries · alerts · microPlan · aiLoadAccept │   │
│  │  + mutators (advanceInjuryStage, reportInjury, …)        │   │
│  │  ⇅ auto-persisted to localStorage ("ams-demo-state-v1") │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  9 pages · all interactions mutate real state                   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │  fetch (SSE) only for AI Copilot
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  FastAPI · Python 3                                             │
│                                                                 │
│  POST /api/copilot/chat                                         │
│    → emergentintegrations.LlmChat                               │
│    → Anthropic Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)   │
│    → streams TextDelta tokens as SSE                            │
│                                                                 │
│  System prompt is built per-request from the live state         │
│  snapshot sent by the frontend (stats / athletes / injuries /   │
│  alerts) so the model is grounded.                              │
└─────────────────────────────────────────────────────────────────┘
```

**No backend persistence** is used for athlete data — the prototype is
intentionally frontend-only for everything except the LLM call. There is no
auth, no database for domain data. The athlete/injury/training state lives in
React Context and is mirrored to localStorage so a presenter doesn't lose
demo progress on reload. A **Reset** button in the top bar restores the
seed.

---

## 4. Project structure

```
/app
├── README.md                      ← you are here
├── memory/
│   └── PRD.md                     ← product requirements (kept up to date)
├── backend/
│   ├── server.py                  ← FastAPI app + /api/copilot/chat (Claude SSE)
│   ├── requirements.txt
│   └── .env                       ← MONGO_URL, DB_NAME, EMERGENT_LLM_KEY
└── frontend/
    ├── package.json
    ├── tailwind.config.js
    ├── .env                       ← REACT_APP_BACKEND_URL
    └── src/
        ├── App.js                 ← router + AppProvider + Toaster
        ├── App.css                ← (minimal)
        ├── index.css              ← design tokens, fonts, body-map styles
        ├── data/
        │   └── seed.js            ← ALL mock data (athletes, injuries, plans, copilot fallbacks)
        ├── context/
        │   └── AppContext.jsx     ← state store + mutators + localStorage persistence
        ├── components/
        │   ├── shell/             ← Sidebar, TopBar (role switcher, reset), Shell (router outlet)
        │   ├── shared/            ← Card, StatCard, StatusBadge, PageHeader, DataTable, AIInsight, AthleteDrawer
        │   ├── medical/
        │   │   └── BodyMap.jsx    ← SVG body with 20 clickable regions
        │   └── ui/                ← shadcn primitives (do not edit)
        └── pages/
            ├── Dashboard.jsx
            ├── Athletes.jsx
            ├── Training.jsx       ← contains the drag-drop calendar
            ├── Medical.jsx        ← priority module
            ├── SportsScience.jsx
            ├── Nutrition.jsx
            ├── Assessments.jsx
            ├── Analytics.jsx
            └── AICopilot.jsx      ← SSE consumer of /api/copilot/chat
```

---

## 5. Design system

These are followed throughout the codebase; new code should match.

| Token | Value |
|---|---|
| Background | `#F8FAFC` |
| Card / surface | `#FFFFFF` |
| Primary text | `#0F172A` |
| Secondary text | `#64748B` |
| Border | `#E2E8F0` |
| Brand accent (primary, active nav, AI highlights) | `#1E40AF` |
| Font | **DM Sans** (deliberately chosen over Inter for distinctiveness) |
| Corners | `rounded-xl` on cards |
| Motion | Framer Motion · subtle, never bouncy |

**Severity / status colour scale — used consistently everywhere:**

| State | Text | Background |
|---|---|---|
| Healthy / available | `#475569` | `#F1F5F9` |
| Mild / low | `#92400E` | `#FEF3C7` |
| Moderate / medium | `#9A3412` | `#FED7AA` |
| Severe / high / danger | `#991B1B` | `#FECACA` |
| In rehab / in progress | `#1D4ED8` | `#DBEAFE` |
| Cleared / success | `#065F46` | `#D1FAE5` |

**The `AIInsight` component** is the single place AI-generated content lives.
Light-blue panel (`#EFF6FF`) with a 4px brand-blue left accent and a sparkles
glyph. If your code generates a recommendation, prediction, or AI summary, it
must use `<AIInsight>`.

---

## 6. Running it locally

The project is set up to run inside the standard Emergent container (supervisor
manages both services). If you're working on it elsewhere:

### Backend
```bash
cd backend
pip install -r requirements.txt
# /app/backend/.env must contain MONGO_URL, DB_NAME, EMERGENT_LLM_KEY
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend
```bash
cd frontend
yarn install
# /app/frontend/.env must contain REACT_APP_BACKEND_URL pointing at the backend
yarn start
```

The frontend runs on **3000**, the backend on **8001**. All backend routes are
prefixed with `/api`. Inside the platform, Kubernetes ingress routes
`/api/*` to port 8001 automatically; never hardcode `localhost:8001` in
frontend code — always use `process.env.REACT_APP_BACKEND_URL`.

---

## 7. Environment variables

### `backend/.env`
| Key | Purpose |
|---|---|
| `MONGO_URL` | MongoDB connection string. (Used only by the legacy `/api/status` endpoint; AMS domain data is not persisted to Mongo.) |
| `DB_NAME` | Mongo database name. |
| `CORS_ORIGINS` | Comma-separated allowed origins. Default `*`. |
| `EMERGENT_LLM_KEY` | Emergent's universal LLM key — gives access to Claude Sonnet 4.5 via `emergentintegrations`. **Required** for the AI Copilot to work. |

### `frontend/.env`
| Key | Purpose |
|---|---|
| `REACT_APP_BACKEND_URL` | Base URL of the backend (no trailing `/api`). Used by the AI Copilot only. |

---

## 8. The key interactions to demo

If you have 90 seconds to show this to someone, go in this order:

1. **Dashboard** — point at Arjun's injury alert (lead, severe, AI-flagged) and
   the AI recommendation block.
2. **Training** — show the drag-drop calendar (swap Mon ↔ Wed), then click
   **Accept recommendation** on the AI insight — Friday and Saturday rewrite
   to "Pool recovery" and "Recovery jog" in real time.
3. **Medical & Injury** — the priority module.
    - Body map: Arjun's right thigh is already coloured rehab-blue.
    - Click it → return-to-play tracker is at stage 3 of 5.
    - Click **Advance stage** twice → region turns green (cleared) and
      Arjun's status flips to *available* across the entire app.
    - Click a healthy region (e.g. left shoulder) → tap *Report severe* → it
      colours red immediately.
4. **AI Copilot** — ask anything off-script ("if Arjun's RTP slips a week, who
   replaces him in the 100m relay?"). Claude responds with names + actual
   readiness / ACWR numbers from the current state.
5. **TopBar Reset** — click *Reset* and everything snaps back to the seed
   scenario, ready for the next presenter.

---

## 9. Notes for AI coding agents working on this repo

If you're an agent picking up this project:

- **State store is `AppContext`.** Always add new mutators there, never write
  to localStorage directly — the existing `useEffect` already persists every
  state slice automatically.
- **No new backend domain endpoints** unless the user explicitly asks. The
  prototype is frontend-only by design except for the Copilot streaming
  endpoint.
- **Match the design system.** Do not introduce purple/violet gradients,
  generic Inter, dark-on-dark backgrounds, or shadcn defaults without
  restyling. Status colours come from the table in §5; deviating breaks
  the visual language across modules.
- **All AI-generated content uses `<AIInsight>`** — it's deliberately the only
  thing that looks like that.
- **Body map regions** are defined in `components/medical/BodyMap.jsx`. If you
  add a region, add a matching path entry and update the seed if needed.
- **`data-testid` attributes** are present throughout — keep them. The
  testing agent and downstream automation rely on them. Naming pattern is
  kebab-case describing function, not style (`role-physio`,
  `advance-stage`, `session-card-Mon`).
- **PRD lives at `/app/memory/PRD.md`.** Update it when adding or removing
  features.
- **Universal LLM key**: don't try to install raw Anthropic/OpenAI SDKs.
  `emergentintegrations` is the library, `EMERGENT_LLM_KEY` is the credential,
  and the model string for Claude Sonnet 4.5 is `claude-sonnet-4-5-20250929`.

---

## 10. What was deliberately left out

- Authentication and user accounts (spec excludes them; demo starts straight
  in-app).
- A database for athlete data (spec excludes a backend for domain data).
- Marketing / landing pages — this is a product surface, not a website.
- "Generative" features the user didn't ask for (image generation, video,
  voice notes, etc.).

---

## 11. Roadmap

P1 — directly extends the current demo:
- Persist Copilot chat history across reloads
- Drop-from-library onto a specific day in the training calendar
- "Demo mode" auto-play timer that walks through the Arjun storyline

P2 — production lifts:
- PDF briefing-pack generator (Claude composes a 1-page athlete report)
- Real wearable / GPS data integration (replace mock streams)
- Multi-sport seeding beyond athletics
- Authenticated, encrypted backend for actual athlete records
- Proper observability (Sentry, structured logs)

---

## 12. Tech credits

- **shadcn/ui** primitives for the UI library
- **Recharts** for all charts
- **Framer Motion** for route transitions and chat reveals
- **sonner** for toasts
- **lucide-react** for icons
- **emergentintegrations** for the Claude Sonnet 4.5 integration
- **DM Sans** by Colophon Foundry for the typeface
