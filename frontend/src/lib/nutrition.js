// Per-athlete nutrition model for the AMS demo.
//
// Only Arjun (SPR-014) carries a full hand-authored fuelling plan (NUTRITION_PLAN)
// and a real DEXA body-composition series in the seed. For every other athlete
// these helpers derive a coherent plan, hydration, supplement compliance and
// body-comp trend grounded in their `nutritionAdherence` scalar (and weight when
// present), deterministically (stable per-athlete hash, no render flicker) so the
// Nutrition module can tell any athlete's story rather than only Arjun's.

import { NUTRITION_PLAN } from "@/data/seed";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function hashId(id = "") {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return h;
}

const BASE_SUPPLEMENTS = [
  { name: "Whey isolate", dose: "30 g post-training" },
  { name: "Creatine monohydrate", dose: "5 g daily" },
  { name: "Omega-3", dose: "2 g daily" },
  { name: "Vitamin D3", dose: "2000 IU daily" },
];

export function nutritionAdherence(athlete) {
  return athlete?.nutritionAdherence ?? 80;
}

// A full fuelling plan for an athlete: the hand-authored seed plan for Arjun,
// otherwise derived from their adherence scalar and body weight.
export function nutritionPlan(athlete) {
  if (athlete?.id === NUTRITION_PLAN.athleteId) return NUTRITION_PLAN;

  const adh = nutritionAdherence(athlete);
  const weight = athlete?.weight ?? 70;
  const kcalTarget = Math.round((weight * 47) / 50) * 50; // ~47 kcal/kg, rounded to 50
  const macros = {
    carbs: Math.round((kcalTarget * 0.55) / 4),
    protein: Math.round((kcalTarget * 0.25) / 4),
    fat: Math.round((kcalTarget * 0.2) / 9),
  };

  const h = hashId(athlete?.id || "");
  const adherenceWeek = DAYS.map((_, i) => {
    const jitter = (((h >> (i * 2)) & 7) - 3.5) * 2.2;
    return Math.max(50, Math.min(100, Math.round(adh + jitter)));
  });

  const baseHydration = 2.4 + (weight - 60) * 0.02; // larger athletes drink more
  const adhFactor = (adh - 80) / 100; // better adherence → closer to target
  const hydrationLitres = DAYS.map((_, i) => {
    const jitter = (((h >> (i + 3)) & 3) - 1.5) * 0.18;
    return Math.round(Math.max(2, Math.min(4, baseHydration + adhFactor + jitter)) * 10) / 10;
  });

  const supplements = BASE_SUPPLEMENTS.map((s, i) => {
    const jitter = (((h >> (i + 5)) & 7) - 3.5) * 3;
    return { ...s, compliance: Math.max(55, Math.min(99, Math.round(adh + jitter))) };
  });

  return { athleteId: athlete?.id, kcalTarget, macros, adherenceWeek, hydrationLitres, supplements };
}

// 4-week body-composition trend (body fat % + lean mass kg). Real DEXA series
// when present (Arjun), else derived: higher adherence tracks lower body fat and
// a gentle improving trend across the observation window.
export function bodyCompSeries(athlete) {
  if (athlete?.bodyComp?.length) return athlete.bodyComp;

  const adh = nutritionAdherence(athlete);
  const weight = athlete?.weight ?? 70;
  const h = hashId(athlete?.id || "");
  const baseFat = Math.max(8.5, Math.min(15, 13 - (adh - 70) / 8));
  const baseLean = Math.round((weight * (1 - baseFat / 100) - 1) * 10) / 10;
  const improve = (adh - 75) / 100; // good adherence → measurable improvement

  return Array.from({ length: 4 }, (_, i) => {
    const t = i / 3;
    const jitter = (((h >> i) & 3) - 1.5) * 0.1;
    return {
      date: `Wk ${i + 1}`,
      bodyfat: Math.round((baseFat - improve * 0.8 * t + jitter) * 10) / 10,
      lean: Math.round((baseLean + improve * 1.6 * t + jitter) * 10) / 10,
    };
  });
}
