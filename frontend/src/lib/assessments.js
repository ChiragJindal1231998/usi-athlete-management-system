// Per-athlete talent-progression model for the Assessments & TID module.
//
// Only Arjun (SPR-014) carries a hand-authored 6-month composite-score series
// (TALENT_PROGRESSION). For every other athlete this derives a coherent
// trajectory that ramps to their current `talentScore`, deterministically (stable
// per-athlete hash, no render flicker), plotted against the same squad-average
// line — so the progression chart can follow any athlete rather than only Arjun.

import { TALENT_PROGRESSION } from "@/data/seed";

const MONTHS = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];

function hashId(id = "") {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return h;
}

export function talentProgression(athlete) {
  if (athlete?.id === "SPR-014") {
    return TALENT_PROGRESSION.map((p) => ({ month: p.month, athlete: p.arjun, squad: p.squad }));
  }
  const score = athlete?.talentScore ?? 75;
  const start = score - 9; // gentle improvement across the window
  const h = hashId(athlete?.id || "");
  return MONTHS.map((month, i) => {
    const t = i / (MONTHS.length - 1);
    const jitter = i === MONTHS.length - 1 ? 0 : (((h >> i) & 3) - 1.5) * 0.8;
    const value = i === MONTHS.length - 1 ? score : Math.round(start + (score - start) * t + jitter);
    return { month, athlete: value, squad: TALENT_PROGRESSION[i].squad };
  });
}
