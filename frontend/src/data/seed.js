// Seed mock data for the Athlete Management System (AMS) demo.
// Centred on Arjun Sharma (SPR-014) — the rehab scenario.

export const ROLES = [
  { id: "admin", label: "Federation admin" },
  { id: "director", label: "Performance director" },
  { id: "coach", label: "Coach" },
  { id: "physio", label: "Physiotherapist" },
];

export const STAFF = {
  coach: { name: "Meera Iyer", role: "Head sprint coach" },
  physio: { name: "Dr Rao", role: "Lead physiotherapist" },
  director: { name: "Vikram Desai", role: "Performance director" },
  scientist: { name: "Dr Anika Bose", role: "Sports scientist" },
  nutritionist: { name: "Priya Menon", role: "Sports nutritionist" },
};

// Athletes (12 total). Arjun is the protagonist.
export const ATHLETES_SEED = [
  {
    id: "SPR-014",
    name: "Arjun Sharma",
    age: 22,
    sport: "Athletics",
    event: "100m sprint",
    squad: "Sprint A",
    coach: "Meera Iyer",
    physio: "Dr Rao",
    status: "injured", // available | injured | rehab
    readiness: 58,
    acwr: 1.52,
    rpeTrend: [6, 7, 7, 8, 8, 9, 9, 8],
    weeklyLoad: [340, 410, 470, 520, 610, 690, 720, 540],
    docsVerified: true,
    onboarding: "active",
    height: 178,
    weight: 72,
    pb: { "100m": "10.31s", "200m": "20.94s" },
    bodyComp: [
      { date: "Wk 1", bodyfat: 9.8, lean: 64.0 },
      { date: "Wk 2", bodyfat: 9.6, lean: 64.2 },
      { date: "Wk 3", bodyfat: 9.7, lean: 64.1 },
      { date: "Wk 4", bodyfat: 9.5, lean: 64.4 },
    ],
    hrv: [62, 60, 58, 55, 51, 48, 46, 52, 56],
    sleep: [7.6, 7.4, 7.0, 6.8, 6.4, 6.2, 6.6, 7.2, 7.5],
  },
  { id: "SPR-002", name: "Rohan Verma", age: 24, sport: "Athletics", event: "200m sprint", squad: "Sprint A", coach: "Meera Iyer", physio: "Dr Rao", status: "available", readiness: 84, acwr: 1.08, docsVerified: true, onboarding: "active" },
  { id: "SPR-005", name: "Karan Singh", age: 21, sport: "Athletics", event: "400m", squad: "Sprint B", coach: "Meera Iyer", physio: "Dr Rao", status: "available", readiness: 79, acwr: 1.18, docsVerified: true, onboarding: "active" },
  { id: "JMP-009", name: "Aditya Patel", age: 23, sport: "Athletics", event: "Long jump", squad: "Jumps", coach: "Suresh Kumar", physio: "Dr Rao", status: "available", readiness: 72, acwr: 1.31, docsVerified: true, onboarding: "active" },
  { id: "ATH-021", name: "Vikas Nair", age: 25, sport: "Athletics", event: "Decathlon", squad: "Combined", coach: "Suresh Kumar", physio: "Dr Rao", status: "available", readiness: 81, acwr: 1.04, docsVerified: true, onboarding: "active" },
  { id: "SPR-018", name: "Manish Reddy", age: 20, sport: "Athletics", event: "100m sprint", squad: "Sprint A", coach: "Meera Iyer", physio: "Dr Rao", status: "rehab", readiness: 64, acwr: 0.91, docsVerified: true, onboarding: "active" },
  { id: "HUR-007", name: "Devika Rao", age: 23, sport: "Athletics", event: "100m hurdles", squad: "Sprint B", coach: "Meera Iyer", physio: "Dr Rao", status: "available", readiness: 88, acwr: 1.12, docsVerified: true, onboarding: "active" },
  { id: "SPR-022", name: "Neha Joshi", age: 22, sport: "Athletics", event: "200m sprint", squad: "Sprint A", coach: "Meera Iyer", physio: "Dr Rao", status: "available", readiness: 75, acwr: 1.22, docsVerified: true, onboarding: "active" },
  { id: "JMP-012", name: "Pooja Shah", age: 21, sport: "Athletics", event: "Triple jump", squad: "Jumps", coach: "Suresh Kumar", physio: "Dr Rao", status: "available", readiness: 77, acwr: 1.14, docsVerified: true, onboarding: "active" },
  { id: "THR-003", name: "Sandeep Yadav", age: 26, sport: "Athletics", event: "Shot put", squad: "Throws", coach: "Anil Khanna", physio: "Dr Rao", status: "injured", readiness: 52, acwr: 1.41, docsVerified: true, onboarding: "active" },
  { id: "SPR-031", name: "Anjali Mehta", age: 19, sport: "Athletics", event: "100m sprint", squad: "Sprint B", coach: "Meera Iyer", physio: "Dr Rao", status: "available", readiness: 82, acwr: 1.07, docsVerified: false, onboarding: "pending" },
  { id: "ATH-040", name: "Ritu Kapoor", age: 18, sport: "Athletics", event: "800m", squad: "Mid distance", coach: "Rajesh Bhat", physio: "Dr Rao", status: "available", readiness: 70, acwr: 1.19, docsVerified: false, onboarding: "invited" },
];

// Body regions mapped to current injuries. Keyed by athleteId + region.
// Seed: Arjun has a grade 2 hamstring strain (right thigh, posterior) in rehab.
export const INJURIES_SEED = [
  {
    id: "INJ-1001",
    athleteId: "SPR-014",
    region: "right-thigh",
    diagnosis: "Hamstring strain, grade 2",
    mechanism: "Acceleration phase, sprint training",
    severity: "rehab", // severity tier used for body-map colour: mild|moderate|severe|rehab|cleared
    grade: 2,
    reportedOn: "2025-02-02",
    daysOut: 14,
    stage: "Rehab", // Reported | Under treatment | Rehab | Return-to-play | Cleared
    notes: "AI flagged elevated risk 4 days before injury (ACWR 1.52, 78% confidence). Now on phase 3 rehab.",
    aiPredicted: true,
  },
  {
    id: "INJ-1002",
    athleteId: "SPR-018",
    region: "left-knee",
    diagnosis: "Patellar tendinopathy",
    mechanism: "Cumulative load",
    severity: "rehab",
    grade: 1,
    reportedOn: "2025-01-22",
    daysOut: 25,
    stage: "Return-to-play",
    notes: "Progressing to high-speed running this week.",
    aiPredicted: false,
  },
  {
    id: "INJ-1003",
    athleteId: "THR-003",
    region: "right-shoulder",
    diagnosis: "Rotator cuff strain",
    mechanism: "Throwing volume spike",
    severity: "moderate",
    grade: 2,
    reportedOn: "2025-02-05",
    daysOut: 11,
    stage: "Under treatment",
    notes: "Pain on resisted external rotation, mild swelling.",
    aiPredicted: true,
  },
];

export const REHAB_STAGES = [
  "Reported",
  "Under treatment",
  "Rehab",
  "Return-to-play",
  "Cleared",
];

// Periodisation: macro / meso / micro for sprint squad
export const PERIODISATION = {
  macroLabel: "2025 outdoor season",
  meso: [
    { name: "General prep", weeks: 4, focus: "Strength + aerobic base", color: "#94A3B8" },
    { name: "Specific prep", weeks: 4, focus: "Speed-endurance", color: "#64748B" },
    { name: "Pre-comp", weeks: 3, focus: "Max velocity", color: "#1E40AF", current: true },
    { name: "Competition", weeks: 5, focus: "Peaking + tapers", color: "#2563EB" },
    { name: "Transition", weeks: 2, focus: "Recovery", color: "#94A3B8" },
  ],
  micro: [
    { day: "Mon", session: "Acceleration 30m × 6", load: 70, type: "Speed" },
    { day: "Tue", session: "Strength — squat / RDL", load: 55, type: "Strength" },
    { day: "Wed", session: "Tempo 6 × 150m", load: 60, type: "Endurance" },
    { day: "Thu", session: "Recovery + mobility", load: 25, type: "Recovery" },
    { day: "Fri", session: "Max-velocity flys 4 × 30m", load: 75, type: "Speed" },
    { day: "Sat", session: "Hills 8 × 60m", load: 80, type: "Power" },
    { day: "Sun", session: "Rest", load: 0, type: "Recovery" },
  ],
};

export const EXERCISE_LIBRARY = [
  { id: "ex1", name: "Acceleration sled push", category: "Speed", duration: 30, intensity: "High" },
  { id: "ex2", name: "Flying 30m sprints", category: "Speed", duration: 25, intensity: "High" },
  { id: "ex3", name: "Back squat 5×5", category: "Strength", duration: 45, intensity: "High" },
  { id: "ex4", name: "Romanian deadlift", category: "Strength", duration: 30, intensity: "Moderate" },
  { id: "ex5", name: "Nordic curls", category: "Posterior chain", duration: 15, intensity: "Moderate" },
  { id: "ex6", name: "Tempo 150m × 6", category: "Endurance", duration: 35, intensity: "Moderate" },
  { id: "ex7", name: "Hurdle mobility", category: "Mobility", duration: 20, intensity: "Low" },
  { id: "ex8", name: "Plyometric bounds", category: "Power", duration: 20, intensity: "High" },
  { id: "ex9", name: "Foam rolling + stretch", category: "Recovery", duration: 25, intensity: "Low" },
  { id: "ex10", name: "Underwater treadmill jog", category: "Rehab", duration: 30, intensity: "Low" },
];

export const ALERTS_SEED = [
  { id: "AL-01", athleteId: "SPR-014", severity: "severe", title: "Elevated hamstring risk", detail: "ACWR 1.52 · 78% predicted risk · 4-day window", priority: 1, aiGenerated: true, status: "active" },
  { id: "AL-02", athleteId: "THR-003", severity: "moderate", title: "Shoulder load spike", detail: "Throwing volume +38% over baseline", priority: 2, aiGenerated: true, status: "active" },
  { id: "AL-03", athleteId: "JMP-009", severity: "mild", title: "Sleep deficit trend", detail: "3 nights below 6.5h — monitor", priority: 3, aiGenerated: true, status: "active" },
];

export const READINESS_TREND = [
  { day: "Mon", squad: 78, arjun: 72 },
  { day: "Tue", squad: 80, arjun: 70 },
  { day: "Wed", squad: 79, arjun: 66 },
  { day: "Thu", squad: 81, arjun: 62 },
  { day: "Fri", squad: 77, arjun: 58 },
  { day: "Sat", squad: 75, arjun: 56 },
  { day: "Sun", squad: 78, arjun: 60 },
];

export const WELLNESS_CHECKINS = [
  { date: "Mon", sleep: 7.6, soreness: 3, mood: 8, stress: 3 },
  { date: "Tue", sleep: 7.4, soreness: 4, mood: 7, stress: 4 },
  { date: "Wed", sleep: 7.0, soreness: 5, mood: 7, stress: 5 },
  { date: "Thu", sleep: 6.8, soreness: 6, mood: 6, stress: 6 },
  { date: "Fri", sleep: 6.4, soreness: 7, mood: 5, stress: 7 },
  { date: "Sat", sleep: 6.2, soreness: 7, mood: 5, stress: 7 },
  { date: "Sun", sleep: 6.6, soreness: 6, mood: 6, stress: 6 },
];

export const NUTRITION_PLAN = {
  athleteId: "SPR-014",
  kcalTarget: 3400,
  macros: { carbs: 480, protein: 165, fat: 95 },
  adherenceWeek: [88, 92, 85, 78, 70, 65, 72],
  hydrationLitres: [3.4, 3.2, 3.0, 2.8, 2.6, 2.5, 2.7],
  supplements: [
    { name: "Whey isolate", dose: "30 g post-training", compliance: 92 },
    { name: "Creatine monohydrate", dose: "5 g daily", compliance: 88 },
    { name: "Omega-3", dose: "2 g daily", compliance: 78 },
    { name: "Vitamin D3", dose: "2000 IU daily", compliance: 84 },
  ],
};

export const FITNESS_TESTS = [
  { athleteId: "SPR-014", athleteName: "Arjun Sharma", sprint30: 3.71, sprint60: 6.62, cmj: 58.4, broadJump: 305, benchmark: "Elite" },
  { athleteId: "SPR-002", athleteName: "Rohan Verma", sprint30: 3.78, sprint60: 6.74, cmj: 54.2, broadJump: 295, benchmark: "National" },
  { athleteId: "SPR-005", athleteName: "Karan Singh", sprint30: 3.84, sprint60: 6.81, cmj: 51.8, broadJump: 288, benchmark: "National" },
  { athleteId: "SPR-018", athleteName: "Manish Reddy", sprint30: 3.82, sprint60: 6.79, cmj: 56.1, broadJump: 298, benchmark: "National" },
  { athleteId: "HUR-007", athleteName: "Devika Rao", sprint30: 3.90, sprint60: 6.92, cmj: 50.4, broadJump: 270, benchmark: "National" },
  { athleteId: "JMP-009", athleteName: "Aditya Patel", sprint30: 3.86, sprint60: 6.85, cmj: 60.2, broadJump: 312, benchmark: "Elite" },
];

export const TALENT_PROGRESSION = [
  { month: "Sep", arjun: 78, squad: 70 },
  { month: "Oct", arjun: 82, squad: 71 },
  { month: "Nov", arjun: 85, squad: 73 },
  { month: "Dec", arjun: 87, squad: 75 },
  { month: "Jan", arjun: 89, squad: 76 },
  { month: "Feb", arjun: 86, squad: 77 },
];

export const FED_ANALYTICS = {
  injuryRate: [
    { month: "Sep", rate: 4.1 },
    { month: "Oct", rate: 4.6 },
    { month: "Nov", rate: 5.2 },
    { month: "Dec", rate: 4.9 },
    { month: "Jan", rate: 5.8 },
    { month: "Feb", rate: 6.1 },
  ],
  participation: [
    { program: "Sprints", athletes: 28, available: 24 },
    { program: "Jumps", athletes: 14, available: 13 },
    { program: "Throws", athletes: 11, available: 9 },
    { program: "Endurance", athletes: 18, available: 17 },
    { program: "Combined", athletes: 6, available: 6 },
  ],
};

// Copilot scripted answers — feel data-aware.
export const COPILOT_SUGGESTIONS = [
  "Which athletes are at injury risk this week?",
  "How is Arjun's rehab tracking?",
  "Summarise sprint squad readiness",
  "Who should reduce training load?",
  "Compare Arjun's 30m to squad average",
];

export const COPILOT_ANSWERS = {
  "which athletes are at injury risk this week?":
    "Three athletes flagged. **Arjun Sharma (SPR-014)** — already rehabbing a grade 2 hamstring, not retrievable until ~10 Mar. **Sandeep Yadav (THR-003)** — shoulder load +38% over baseline, predicted moderate risk (62%). **Aditya Patel (JMP-009)** — sleep deficit trend across 3 nights, watch for accumulating fatigue. Recommend reducing Aditya's Wednesday plyometric block by ~30%.",
  "how is arjun's rehab tracking?":
    "Arjun is on **day 14** of rehab for a right-hamstring grade 2 strain. Currently in the **Rehab** stage (3 of 5). Eccentric strength is at 78% of left-leg baseline (target: 90%). HRV recovered to 56 ms, sleep back to 7.5 h. Estimated return-to-play: **8–12 days**. Confidence: high.",
  "summarise sprint squad readiness":
    "Sprint A average readiness is **74** (down 6 pts week-over-week, driven mostly by Arjun). Sprint B is at **84**. Only Devika Rao (88) and Anjali Mehta (82) are above the elite threshold. Three athletes — Arjun, Manish, Sandeep — are non-competing.",
  "who should reduce training load?":
    "Two clear candidates. **Sandeep Yadav** (ACWR 1.41) — reduce throwing volume by 25–30% this week. **Aditya Patel** (ACWR 1.31, sleep deficit) — swap Saturday hills for tempo work. Arjun's plan is already adjusted to recovery only.",
  "compare arjun's 30m to squad average":
    "Arjun's last recorded 30m: **3.71s** (Elite benchmark). Sprint squad average: **3.82s**. He is 0.11s ahead of squad mean, ranked #1 on the testing register. Note: test was pre-injury (24 Jan).",
};

// Documents (for athlete drawer)
export const DOCUMENTS_SEED = {
  "SPR-014": [
    { id: "doc1", name: "Federation registration form", verified: true, uploadedOn: "12 Aug 2024" },
    { id: "doc2", name: "Medical clearance", verified: true, uploadedOn: "18 Aug 2024" },
    { id: "doc3", name: "Anti-doping consent", verified: true, uploadedOn: "20 Aug 2024" },
    { id: "doc4", name: "Photo ID", verified: true, uploadedOn: "12 Aug 2024" },
  ],
};
