// Readiness scoring model for the AMS demo.
//
// Readiness is a 0–100 composite of five daily wellness signals, each scored
// 0–100 (higher = better) and weighted, then docked a load penalty when the
// athlete's ACWR sits outside the 0.8–1.3 "sweet spot". Every athlete carries a
// `wellness` block in the seed; `computeReadiness` turns it into the single
// readiness number the rest of the app reads, and `readinessBreakdown` exposes
// the per-factor contributions for the athlete detail panel.

export const READINESS_FACTORS = [
  { key: "sleep", label: "Sleep quality", weight: 0.25 },
  { key: "soreness", label: "Muscle freshness", weight: 0.2 },
  { key: "hrv", label: "HRV / autonomic", weight: 0.25 },
  { key: "energy", label: "Energy / fatigue", weight: 0.15 },
  { key: "mood", label: "Mood / stress", weight: 0.15 },
];

// Load penalty: ACWR above 1.3 (spiking) or below 0.8 (detraining) erodes
// readiness. Capped so a single signal can't dominate the composite.
export function acwrPenalty(acwr) {
  if (acwr == null) return 0;
  if (acwr > 1.3) return Math.round(Math.min(15, (acwr - 1.3) * 50));
  if (acwr < 0.8) return Math.round(Math.min(8, (0.8 - acwr) * 30));
  return 0;
}

export function computeReadiness(wellness, acwr) {
  if (!wellness) return null;
  const base = READINESS_FACTORS.reduce((sum, f) => sum + (wellness[f.key] ?? 0) * f.weight, 0);
  return Math.max(0, Math.min(100, Math.round(base - acwrPenalty(acwr))));
}

// Per-factor breakdown for the detail panel: each factor's raw 0–100 value,
// its weight, and the points it contributes toward the composite.
export function readinessBreakdown(athlete) {
  const w = athlete?.wellness;
  if (!w) return null;
  const factors = READINESS_FACTORS.map((f) => ({
    ...f,
    value: w[f.key] ?? 0,
    points: Math.round((w[f.key] ?? 0) * f.weight),
  }));
  return {
    factors,
    penalty: acwrPenalty(athlete.acwr),
    acwr: athlete.acwr,
    score: computeReadiness(w, athlete.acwr),
  };
}

// A sensible default wellness profile for a freshly-onboarded athlete, anchored
// to a target readiness so new athletes start with a coherent breakdown.
export function defaultWellness(target = 75) {
  return { sleep: target + 2, soreness: target, hrv: target, energy: target - 1, mood: target - 1 };
}

const TREND_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Stable per-athlete hash so the derived trend is deterministic (no flicker
// between renders) yet differs from athlete to athlete.
function hashId(id = "") {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return h;
}

// Derive a 7-day self-reported wellness trend from an athlete's wellness
// snapshot, in the units the check-in chart plots: sleep in hours, soreness and
// mood on a 1–10 scale (soreness higher = worse). Athletes carrying load
// (low readiness / active injury) drift worse across the week; fresh athletes
// stay flat. Grounded in each athlete's real wellness data and scope-safe.
export function wellnessTrend(athlete) {
  const w = athlete?.wellness;
  if (!w) return [];
  const baseSleep = 5 + (w.sleep / 100) * 3.5; // ~5.0–8.5 h
  const baseSore = 10 - (w.soreness / 100) * 8; // freshness → soreness (1–10)
  const baseMood = 1 + (w.mood / 100) * 9; // 1–10
  const stress = loadStress(athlete);
  const h = hashId(athlete.id);
  return TREND_DAYS.map((date, i) => {
    const drift = i / 6; // 0 → 1 across the week
    const jitter = (((h >> (i * 2)) & 3) - 1.5) * 0.12;
    const sleep = baseSleep - stress * 1.6 * drift + jitter;
    const soreness = baseSore + stress * 3 * drift - jitter * 1.5;
    const mood = baseMood - stress * 2.5 * drift + jitter;
    return {
      date,
      sleep: Math.round(Math.max(4, Math.min(9, sleep)) * 10) / 10,
      soreness: Math.round(Math.max(1, Math.min(10, soreness))),
      mood: Math.round(Math.max(1, Math.min(10, mood))),
    };
  });
}

// How hard an athlete is carrying load right now (0 → ~0.4), used to shape how
// their derived signals drift over the observation window. Below-target
// readiness ramps the drift; fully-fresh athletes stay flat.
function loadStress(athlete) {
  return athlete?.readiness != null ? Math.max(0, (75 - athlete.readiness)) / 100 : 0;
}

// 9-day HRV series (lnRMSSD, ms). Uses the athlete's real array when present
// (Arjun), otherwise derives from their HRV/autonomic wellness sub-score.
export function hrvSeries(athlete) {
  if (athlete?.hrv?.length) return athlete.hrv.map((hrv, i) => ({ day: `D${i + 1}`, hrv }));
  const w = athlete?.wellness;
  if (!w) return [];
  const base = 35 + (w.hrv / 100) * 35; // ~40–70 ms
  const stress = loadStress(athlete);
  const h = hashId(athlete.id);
  return Array.from({ length: 9 }, (_, i) => {
    const drift = i / 8;
    const jitter = (((h >> i) & 3) - 1.5) * 1.2;
    return { day: `D${i + 1}`, hrv: Math.round(Math.max(38, Math.min(72, base - stress * 12 * drift + jitter))) };
  });
}

// 9-day sleep-duration series (hours). Real array when present, else derived
// from the sleep-quality wellness sub-score.
export function sleepSeries(athlete) {
  if (athlete?.sleep?.length) return athlete.sleep.map((sleep, i) => ({ day: `D${i + 1}`, sleep }));
  const w = athlete?.wellness;
  if (!w) return [];
  const base = 5 + (w.sleep / 100) * 3.5;
  const stress = loadStress(athlete);
  const h = hashId(athlete.id);
  return Array.from({ length: 9 }, (_, i) => {
    const drift = i / 8;
    const jitter = (((h >> (i + 1)) & 3) - 1.5) * 0.15;
    return { day: `D${i + 1}`, sleep: Math.round(Math.max(5, Math.min(9, base - stress * 1.4 * drift + jitter)) * 10) / 10 };
  });
}

// 8-week training-load series (arbitrary units). Real array when present, else
// reconstructed from ACWR: chronic baseline ramps to an acute load consistent
// with the athlete's current acute:chronic ratio.
export function loadSeries(athlete) {
  if (athlete?.weeklyLoad?.length) return athlete.weeklyLoad.map((load, i) => ({ week: `W${i + 1}`, load }));
  const chronic = 440;
  const acute = (athlete?.acwr ?? 1) * chronic;
  const start = chronic * 0.7;
  const h = hashId(athlete?.id || "");
  return Array.from({ length: 8 }, (_, i) => {
    const t = i / 7;
    const jitter = (((h >> i) & 3) - 1.5) * 18;
    return { week: `W${i + 1}`, load: Math.round(start + (acute - start) * t + jitter) };
  });
}
