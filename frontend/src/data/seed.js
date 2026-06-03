// Seed mock data for the Athlete Management System (AMS) demo.
// Centred on Arjun Sharma (SPR-014) — the rehab scenario.

export const ROLES = [
  { id: "admin", label: "Federation admin" },
  { id: "director", label: "Performance director" },
  { id: "coach", label: "Coach" },
  { id: "physio", label: "Physiotherapist" },
  { id: "scientist", label: "Sports scientist" },
  { id: "nutritionist", label: "Nutritionist" },
  { id: "ops", label: "Operations team" },
  { id: "athlete", label: "Athlete" },
];

// Signed-in staff/profile per role (used in the TopBar account menu).
export const STAFF = {
  admin: { name: "Kavya Nair", role: "Federation admin" },
  director: { name: "Vikram Desai", role: "Performance director" },
  coach: { name: "Meera Iyer", role: "Head sprint coach" },
  physio: { name: "Dr Rao", role: "Lead physiotherapist" },
  scientist: { name: "Dr Anika Bose", role: "Sports scientist" },
  nutritionist: { name: "Priya Menon", role: "Sports nutritionist" },
  ops: { name: "Sunil Pillai", role: "Operations lead" },
  athlete: { name: "Arjun Sharma", role: "100m sprinter · SPR-014" },
};

// Coaching staff an athlete can be assigned to (used by the enrolment dialog
// and the coach-assignment control in the athlete detail panel).
export const COACHES = ["Meera Iyer", "Suresh Kumar", "Anil Khanna", "Rajesh Bhat"];

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
    wellness: { sleep: 72, soreness: 60, hrv: 64, energy: 70, mood: 80 },
    acwr: 1.52,
    rpeTrend: [6, 7, 7, 8, 8, 9, 9, 8],
    weeklyLoad: [340, 410, 470, 520, 610, 690, 720, 540],
    docsVerified: true,
    onboarding: "active",
    tags: ["Elite prospect", "National camp", "Injury watch"],
    talentScore: 92,
    nutritionAdherence: 78,
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
    // GPS (per training session, last 7) — distance in m, speeds in km/h
    gps: [
      { day: "D1", total: 4200, hsr: 720, sprint: 240, maxSpeed: 33.1, accel: 18 },
      { day: "D2", total: 3900, hsr: 640, sprint: 210, maxSpeed: 32.6, accel: 16 },
      { day: "D3", total: 4600, hsr: 880, sprint: 320, maxSpeed: 34.0, accel: 22 },
      { day: "D4", total: 2100, hsr: 180, sprint: 40, maxSpeed: 27.4, accel: 6 },
      { day: "D5", total: 4800, hsr: 940, sprint: 360, maxSpeed: 34.4, accel: 25 },
      { day: "D6", total: 5100, hsr: 1080, sprint: 420, maxSpeed: 34.8, accel: 28 },
      { day: "D7", total: 1600, hsr: 90, sprint: 0, maxSpeed: 21.0, accel: 3 },
    ],
  },
  { id: "SPR-002", name: "Rohan Verma", age: 24, sport: "Athletics", event: "200m sprint", squad: "Sprint A", coach: "Meera Iyer", physio: "Dr Rao", status: "available", readiness: 84, wellness: { sleep: 86, soreness: 84, hrv: 84, energy: 82, mood: 82 }, acwr: 1.08, docsVerified: true, onboarding: "active", tags: ["National camp"], talentScore: 82, nutritionAdherence: 90 },
  { id: "SPR-005", name: "Karan Singh", age: 21, sport: "Athletics", event: "400m", squad: "Sprint B", coach: "Meera Iyer", physio: "Dr Rao", status: "available", readiness: 79, wellness: { sleep: 80, soreness: 78, hrv: 80, energy: 78, mood: 78 }, acwr: 1.18, docsVerified: true, onboarding: "active", tags: [], talentScore: 78, nutritionAdherence: 84 },
  { id: "JMP-009", name: "Aditya Patel", age: 23, sport: "Athletics", event: "Long jump", squad: "Jumps", coach: "Suresh Kumar", physio: "Dr Rao", status: "available", readiness: 72, wellness: { sleep: 74, soreness: 72, hrv: 74, energy: 72, mood: 72 }, acwr: 1.31, docsVerified: true, onboarding: "active", tags: ["Elite prospect", "Load watch"], talentScore: 88, nutritionAdherence: 72 },
  { id: "ATH-021", name: "Vikas Nair", age: 25, sport: "Athletics", event: "Decathlon", squad: "Combined", coach: "Suresh Kumar", physio: "Dr Rao", status: "available", readiness: 81, wellness: { sleep: 82, soreness: 80, hrv: 82, energy: 80, mood: 80 }, acwr: 1.04, docsVerified: true, onboarding: "active", tags: [], talentScore: 74, nutritionAdherence: 88 },
  { id: "SPR-018", name: "Manish Reddy", age: 20, sport: "Athletics", event: "100m sprint", squad: "Sprint A", coach: "Meera Iyer", physio: "Dr Rao", status: "rehab", readiness: 64, wellness: { sleep: 66, soreness: 62, hrv: 64, energy: 64, mood: 64 }, acwr: 0.91, docsVerified: true, onboarding: "active", tags: ["Injury watch"], talentScore: 80, nutritionAdherence: 80 },
  { id: "HUR-007", name: "Devika Rao", age: 23, sport: "Athletics", event: "100m hurdles", squad: "Sprint B", coach: "Meera Iyer", physio: "Dr Rao", status: "available", readiness: 88, wellness: { sleep: 90, soreness: 88, hrv: 88, energy: 86, mood: 86 }, acwr: 1.12, docsVerified: true, onboarding: "active", tags: ["Elite prospect"], talentScore: 85, nutritionAdherence: 93 },
  { id: "SPR-022", name: "Neha Joshi", age: 22, sport: "Athletics", event: "200m sprint", squad: "Sprint A", coach: "Meera Iyer", physio: "Dr Rao", status: "injured", readiness: 61, wellness: { sleep: 63, soreness: 58, hrv: 62, energy: 60, mood: 62 }, acwr: 1.22, docsVerified: true, onboarding: "active", tags: ["Injury watch"], talentScore: 76, nutritionAdherence: 86 },
  { id: "JMP-012", name: "Pooja Shah", age: 21, sport: "Athletics", event: "Triple jump", squad: "Jumps", coach: "Suresh Kumar", physio: "Dr Rao", status: "available", readiness: 77, wellness: { sleep: 78, soreness: 76, hrv: 78, energy: 76, mood: 76 }, acwr: 1.14, docsVerified: true, onboarding: "active", tags: [], talentScore: 73, nutritionAdherence: 82 },
  { id: "THR-003", name: "Sandeep Yadav", age: 26, sport: "Athletics", event: "Shot put", squad: "Throws", coach: "Anil Khanna", physio: "Dr Rao", status: "injured", readiness: 52, wellness: { sleep: 60, soreness: 50, hrv: 58, energy: 58, mood: 60 }, acwr: 1.41, docsVerified: true, onboarding: "active", tags: ["Injury watch", "Load watch"], talentScore: 70, nutritionAdherence: 64 },
  { id: "SPR-031", name: "Anjali Mehta", age: 19, sport: "Athletics", event: "100m sprint", squad: "Sprint B", coach: "Meera Iyer", physio: "Dr Rao", status: "available", readiness: 82, wellness: { sleep: 84, soreness: 82, hrv: 82, energy: 80, mood: 80 }, acwr: 1.07, docsVerified: false, onboarding: "pending", tags: ["Development squad"], talentScore: 75, nutritionAdherence: 79 },
  { id: "ATH-040", name: "Ritu Kapoor", age: 18, sport: "Athletics", event: "800m", squad: "Mid distance", coach: "Rajesh Bhat", physio: "Dr Rao", status: "available", readiness: 70, wellness: { sleep: 72, soreness: 68, hrv: 70, energy: 70, mood: 70 }, acwr: 1.19, docsVerified: false, onboarding: "invited", tags: ["Development squad"], talentScore: 68, nutritionAdherence: 75 },
];

// Athletes selectable from the "Login as athlete" picker. Each maps the athlete
// role onto a different self-view so the demo can show contrasting journeys:
// a deep rehab (Arjun), a return-to-play case (Manish) and a fully fit athlete (Rohan).
export const ATHLETE_LOGINS = [
  { id: "SPR-014", name: "Arjun Sharma", note: "100m · rehab day 14" },
  { id: "SPR-018", name: "Manish Reddy", note: "100m · return-to-play" },
  { id: "SPR-002", name: "Rohan Verma", note: "200m · fully available" },
];

// Org hierarchy for dashboard drill-down: program → its squads. Used by the
// Federation→Program→Squad filter on the Admin / Director dashboards.
export const PROGRAM_SQUADS = {
  Sprints: ["Sprint A", "Sprint B"],
  Jumps: ["Jumps"],
  Throws: ["Throws"],
  Endurance: ["Mid distance"],
  Combined: ["Combined"],
};

// Reverse lookup: squad → program.
export const SQUAD_PROGRAM = Object.entries(PROGRAM_SQUADS).reduce((map, [program, squads]) => {
  squads.forEach((s) => { map[s] = program; });
  return map;
}, {});

// Catalogue of tags that can be applied to athletes (athlete registry tagging).
export const ATHLETE_TAGS = [
  "Elite prospect",
  "National camp",
  "Development squad",
  "Injury watch",
  "Load watch",
  "Scholarship",
  "Overseas exposure",
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
    history: [
      { date: "2025-02-02", stage: "Reported", author: "Dr Rao", note: "Acute onset during 6th acceleration rep. Felt posterior thigh grab. Sat MRI confirms grade 2 strain at proximal myotendinous junction." },
      { date: "2025-02-04", stage: "Under treatment", author: "Dr Rao", note: "Started PEACE & LOVE protocol. Pain 6/10, restricted ROM. Isometric loading introduced day 2." },
      { date: "2025-02-09", stage: "Rehab", author: "Dr Rao", note: "Progressed to phase 3 — eccentric Nordics + underwater treadmill. Eccentric strength 78% of left-leg baseline." },
    ],
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
    history: [
      { date: "2025-01-22", stage: "Reported", author: "Dr Rao", note: "Reported anterior knee pain after cumulative jump volume. Tender at inferior patellar pole." },
      { date: "2025-01-28", stage: "Under treatment", author: "Dr Rao", note: "Load management + isometric holds. Pain settling, 3/10 on decline squat." },
      { date: "2025-02-06", stage: "Rehab", author: "Dr Rao", note: "Heavy slow resistance protocol started. Tolerating well." },
      { date: "2025-02-13", stage: "Return-to-play", author: "Dr Rao", note: "Cleared for high-speed running progression this week." },
    ],
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
    history: [
      { date: "2025-02-05", stage: "Reported", author: "Dr Rao", note: "Reported posterior shoulder pain after a 38% spike in throwing volume. AI load monitor had flagged the spike 2 days prior." },
      { date: "2025-02-08", stage: "Under treatment", author: "Dr Rao", note: "Pain on resisted external rotation, mild swelling. Scapular control work + manual therapy. Throwing paused." },
    ],
  },
  {
    id: "INJ-1004",
    athleteId: "SPR-002",
    region: "left-shin",
    diagnosis: "Calf strain, grade 1",
    mechanism: "Tempo session, cumulative fatigue",
    severity: "cleared",
    grade: 1,
    reportedOn: "2025-01-08",
    daysOut: 0,
    stage: "Cleared",
    notes: "Fully recovered. Discharged after symptom-free RTP block.",
    aiPredicted: false,
    history: [
      { date: "2025-01-08", stage: "Reported", author: "Dr Rao", note: "Mild left calf tightness reported after Wednesday tempo. No structural damage on ultrasound." },
      { date: "2025-01-12", stage: "Under treatment", author: "Dr Rao", note: "Soft-tissue work + calf loading. Pain 2/10, resolving fast." },
      { date: "2025-01-18", stage: "Rehab", author: "Dr Rao", note: "Calf raise progression to 90% baseline. Reintroduced strides." },
      { date: "2025-01-24", stage: "Return-to-play", author: "Dr Rao", note: "Full-speed running tolerated, symptom-free." },
      { date: "2025-01-28", stage: "Cleared", author: "Dr Rao", note: "Discharged — back to full sprint training with no restrictions." },
    ],
  },
  {
    id: "INJ-1005",
    athleteId: "SPR-022",
    region: "left-thigh",
    diagnosis: "Hamstring tightness (low-grade)",
    mechanism: "ACWR drift, accumulating fatigue",
    severity: "mild",
    grade: 1,
    reportedOn: "2025-02-15",
    daysOut: 2,
    stage: "Reported",
    notes: "Precautionary flag — AI had been tracking a steady ACWR drift.",
    aiPredicted: true,
    history: [
      { date: "2025-02-15", stage: "Reported", author: "Dr Rao", note: "Neha reported left hamstring tightness after Friday flys. AI had flagged a 3-week ACWR drift (1.05 → 1.22). Holding her out of max-velocity work as a precaution; MRI not indicated." },
    ],
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
  { id: "AL-04", athleteId: "SPR-022", severity: "mild", title: "ACWR drift flagged", detail: "Steady climb 1.05 → 1.22 over 3 weeks", priority: 4, aiGenerated: true, status: "active" },
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
  { athleteId: "SPR-022", athleteName: "Neha Joshi", sprint30: 3.88, sprint60: 6.88, cmj: 49.6, broadJump: 268, benchmark: "National" },
  { athleteId: "ATH-021", athleteName: "Vikas Nair", sprint30: 4.02, sprint60: 7.18, cmj: 47.1, broadJump: 255, benchmark: "Developing" },
  { athleteId: "ATH-040", athleteName: "Ritu Kapoor", sprint30: 4.11, sprint60: 7.34, cmj: 44.8, broadJump: 242, benchmark: "Developing" },
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
    "Three athletes flagged, plus one new precautionary watch. **Arjun Sharma (SPR-014)** — already rehabbing a grade 2 hamstring, not retrievable until ~10 Mar. **Sandeep Yadav (THR-003)** — shoulder load +38% over baseline, predicted moderate risk (62%). **Aditya Patel (JMP-009)** — sleep deficit trend across 3 nights, watch for accumulating fatigue. New: **Neha Joshi (SPR-022)** reported low-grade hamstring tightness after a 3-week ACWR drift (1.05 → 1.22) — held out of max-velocity work. Recommend reducing Aditya's Wednesday plyometric block by ~30%.",
  "how is arjun's rehab tracking?":
    "Arjun is on **day 14** of rehab for a right-hamstring grade 2 strain. Currently in the **Rehab** stage (3 of 5). Eccentric strength is at 78% of left-leg baseline (target: 90%). HRV recovered to 56 ms, sleep back to 7.5 h. Estimated return-to-play: **8–12 days**. Confidence: high.",
  "summarise sprint squad readiness":
    "Sprint A average readiness is **67** (down sharply week-over-week — Arjun, Manish and now Neha are all carrying load). Sprint B is at **83**. Only Devika Rao (88) and Anjali Mehta (82) are above the elite threshold. Three Sprint A athletes — Arjun, Manish and Neha — are non-competing this week.",
  "who should reduce training load?":
    "Two clear candidates. **Sandeep Yadav** (ACWR 1.41) — reduce throwing volume by 25–30% this week. **Aditya Patel** (ACWR 1.31, sleep deficit) — swap Saturday hills for tempo work. Arjun's plan is already adjusted to recovery only.",
  "compare arjun's 30m to squad average":
    "Arjun's last recorded 30m: **3.71s** (Elite benchmark). Sprint squad average: **3.82s**. He is 0.11s ahead of squad mean, ranked #1 on the testing register. Note: test was pre-injury (24 Jan).",
};

// Training attendance — today's session roster for the sprint squad.
// status: present | late | absent | excused (rehab/medical)
export const ATTENDANCE_SEED = {
  session: "Acceleration 30m × 6 · Sprint A",
  date: "2025-02-16",
  roster: [
    { athleteId: "SPR-014", status: "excused", note: "Rehab — recovery only" },
    { athleteId: "SPR-002", status: "present" },
    { athleteId: "SPR-005", status: "present" },
    { athleteId: "SPR-018", status: "excused", note: "RTP progression" },
    { athleteId: "HUR-007", status: "present" },
    { athleteId: "SPR-022", status: "excused", note: "Held out — hamstring precaution" },
    { athleteId: "SPR-031", status: "present" },
    { athleteId: "ATH-040", status: "absent", note: "Unexcused" },
  ],
};

// Onboarding pipeline stages (athlete registration lifecycle).
export const ONBOARDING_STAGES = ["invited", "pending", "review", "active"];

// Documents (for athlete drawer)
export const DOCUMENTS_SEED = {
  "SPR-014": [
    { id: "doc1", name: "Federation registration form", verified: true, uploadedOn: "12 Aug 2024" },
    { id: "doc2", name: "Medical clearance", verified: true, uploadedOn: "18 Aug 2024" },
    { id: "doc3", name: "Anti-doping consent", verified: true, uploadedOn: "20 Aug 2024" },
    { id: "doc4", name: "Photo ID", verified: true, uploadedOn: "12 Aug 2024" },
  ],
};
