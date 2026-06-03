import { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";
import {
  ATHLETES_SEED,
  INJURIES_SEED,
  ALERTS_SEED,
  REHAB_STAGES,
  PERIODISATION,
  ATTENDANCE_SEED,
  ONBOARDING_STAGES,
  FITNESS_TESTS,
} from "@/data/seed";

const AppContext = createContext(null);

const STORAGE_KEY = "ams-demo-state-v1";
// NOTE: This stores SEEDED MOCK DATA for the demo prototype only — never real
// athlete medical records or PHI. A production AMS would persist to an
// authenticated, encrypted backend (the spec already excludes that scope).

function loadPersisted() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn("[AMS] Failed to load persisted state:", err);
    return null;
  }
}

function savePersisted(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    // quota exceeded / private mode — non-fatal
    console.warn("[AMS] Failed to persist state:", err);
  }
}

export function AppProvider({ children }) {
  const persisted = loadPersisted();

  const [role, setRole] = useState(persisted?.role ?? "director");
  const [athletes, setAthletes] = useState(persisted?.athletes ?? ATHLETES_SEED);
  const [injuries, setInjuries] = useState(persisted?.injuries ?? INJURIES_SEED);
  const [alerts, setAlerts] = useState(persisted?.alerts ?? ALERTS_SEED);
  const [microPlan, setMicroPlan] = useState(persisted?.microPlan ?? PERIODISATION.micro);
  const [aiLoadAccepted, setAiLoadAccepted] = useState(persisted?.aiLoadAccepted ?? false);
  const [attendance, setAttendance] = useState(persisted?.attendance ?? ATTENDANCE_SEED);
  const [fitnessTests, setFitnessTests] = useState(persisted?.fitnessTests ?? FITNESS_TESTS);

  // persist on any state change (debounced via microtask)
  useEffect(() => {
    savePersisted({ role, athletes, injuries, alerts, microPlan, aiLoadAccepted, attendance, fitnessTests });
  }, [role, athletes, injuries, alerts, microPlan, aiLoadAccepted, attendance, fitnessTests]);

  const resetDemo = useCallback(() => {
    setAthletes(ATHLETES_SEED);
    setInjuries(INJURIES_SEED);
    setAlerts(ALERTS_SEED);
    setMicroPlan(PERIODISATION.micro);
    setAiLoadAccepted(false);
    setAttendance(ATTENDANCE_SEED);
    setFitnessTests(FITNESS_TESTS);
    setRole("director");
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn("[AMS] Failed to clear persisted state:", err);
    }
  }, []);

  const getAthlete = useCallback(
    (id) => athletes.find((a) => a.id === id),
    [athletes]
  );

  const getInjuryByRegion = useCallback(
    (athleteId, region) =>
      injuries.find((i) => i.athleteId === athleteId && i.region === region),
    [injuries]
  );

  const getInjuriesForAthlete = useCallback(
    (athleteId) => injuries.filter((i) => i.athleteId === athleteId),
    [injuries]
  );

  const advanceInjuryStage = useCallback((injuryId) => {
    setInjuries((prev) =>
      prev.map((i) => {
        if (i.id !== injuryId) return i;
        const idx = REHAB_STAGES.indexOf(i.stage);
        const nextIdx = Math.min(idx + 1, REHAB_STAGES.length - 1);
        const nextStage = REHAB_STAGES[nextIdx];
        if (nextStage === i.stage) return i; // already at final stage
        const cleared = nextStage === "Cleared";
        const entry = {
          date: new Date().toISOString().slice(0, 10),
          stage: nextStage,
          author: "Dr Rao",
          note: cleared
            ? "Cleared for full return to training. Discharged from rehab."
            : `Advanced to ${nextStage} stage.`,
        };
        return {
          ...i,
          stage: nextStage,
          severity: cleared ? "cleared" : "rehab",
          history: [...(i.history || []), entry],
        };
      })
    );
    setTimeout(() => {
      setInjuries((cur) => {
        const inj = cur.find((i) => i.id === injuryId);
        if (inj && inj.stage === "Cleared") {
          setAthletes((aPrev) =>
            aPrev.map((a) =>
              a.id === inj.athleteId
                ? { ...a, status: "available", readiness: Math.max(a.readiness, 78) }
                : a
            )
          );
        } else if (inj && inj.stage === "Return-to-play") {
          setAthletes((aPrev) =>
            aPrev.map((a) =>
              a.id === inj.athleteId ? { ...a, status: "rehab" } : a
            )
          );
        }
        return cur;
      });
    }, 0);
  }, []);

  const reportInjury = useCallback((athleteId, region, severity) => {
    const sevLabelMap = { mild: "Mild strain", moderate: "Moderate strain", severe: "Severe strain" };
    const newInjury = {
      id: `INJ-${Date.now()}`,
      athleteId,
      region,
      diagnosis: sevLabelMap[severity] || "Reported injury",
      mechanism: "Manually reported",
      severity,
      grade: severity === "severe" ? 3 : severity === "moderate" ? 2 : 1,
      reportedOn: new Date().toISOString().slice(0, 10),
      daysOut: severity === "severe" ? 21 : severity === "moderate" ? 10 : 4,
      stage: "Reported",
      notes: "Just reported via body map.",
      aiPredicted: false,
      history: [
        {
          date: new Date().toISOString().slice(0, 10),
          stage: "Reported",
          author: "Dr Rao",
          note: `${sevLabelMap[severity] || "Injury"} reported via body map.`,
        },
      ],
    };
    setInjuries((p) => [newInjury, ...p]);
    setAthletes((p) =>
      p.map((a) => (a.id === athleteId ? { ...a, status: "injured", readiness: Math.max(40, a.readiness - 15) } : a))
    );
    return newInjury;
  }, []);

  const addAthlete = useCallback((draft) => {
    const id = draft.id || `ATH-${String(Math.floor(Math.random() * 900) + 100)}`;
    const newAthlete = {
      id,
      name: draft.name,
      age: Number(draft.age) || 20,
      sport: draft.sport || "Athletics",
      event: draft.event || "100m sprint",
      squad: draft.squad || "Sprint B",
      coach: draft.coach || "Meera Iyer",
      physio: "Dr Rao",
      status: "available",
      readiness: 75,
      acwr: 1.0,
      docsVerified: false,
      onboarding: draft.onboarding || "invited",
      tags: draft.tags || [],
    };
    setAthletes((p) => [newAthlete, ...p]);
    return newAthlete;
  }, []);

  const updateAthleteOnboarding = useCallback((id, onboarding) => {
    setAthletes((p) =>
      p.map((a) =>
        a.id === id
          ? { ...a, onboarding, docsVerified: onboarding === "verified" || onboarding === "active" }
          : a
      )
    );
  }, []);

  // Advance an athlete through the onboarding pipeline:
  // invited → pending → review → active. Reaching "active" marks docs verified.
  const advanceOnboarding = useCallback((id) => {
    setAthletes((p) =>
      p.map((a) => {
        if (a.id !== id) return a;
        const idx = ONBOARDING_STAGES.indexOf(a.onboarding);
        const nextIdx = Math.min(idx + 1, ONBOARDING_STAGES.length - 1);
        const next = ONBOARDING_STAGES[nextIdx];
        return { ...a, onboarding: next, docsVerified: next === "active" ? true : a.docsVerified };
      })
    );
  }, []);

  const addAthleteTag = useCallback((id, tag) => {
    if (!tag) return;
    setAthletes((p) =>
      p.map((a) =>
        a.id === id && !(a.tags || []).includes(tag)
          ? { ...a, tags: [...(a.tags || []), tag] }
          : a
      )
    );
  }, []);

  const removeAthleteTag = useCallback((id, tag) => {
    setAthletes((p) =>
      p.map((a) =>
        a.id === id ? { ...a, tags: (a.tags || []).filter((t) => t !== tag) } : a
      )
    );
  }, []);

  // Append a clinical note to an injury's history timeline.
  const addInjuryNote = useCallback((injuryId, note, author = "Dr Rao") => {
    if (!note?.trim()) return;
    setInjuries((p) =>
      p.map((i) =>
        i.id === injuryId
          ? {
              ...i,
              history: [
                ...(i.history || []),
                {
                  date: new Date().toISOString().slice(0, 10),
                  stage: i.stage,
                  author,
                  note: note.trim(),
                },
              ],
            }
          : i
      )
    );
  }, []);

  // Set an athlete's attendance status for today's session.
  const setAttendanceStatus = useCallback((athleteId, status, note) => {
    setAttendance((prev) => ({
      ...prev,
      roster: prev.roster.map((r) =>
        r.athleteId === athleteId ? { ...r, status, ...(note !== undefined ? { note } : {}) } : r
      ),
    }));
  }, []);

  const acceptAILoadReduction = useCallback(() => {
    setAiLoadAccepted(true);
    setMicroPlan((p) =>
      p.map((d) =>
        d.day === "Sat"
          ? { ...d, session: "Recovery jog + mobility (AI-adjusted)", load: 25, type: "Recovery" }
          : d.day === "Fri"
            ? { ...d, session: "Pool recovery (AI-adjusted)", load: 20, type: "Recovery" }
            : d
      )
    );
    setAthletes((p) =>
      p.map((a) => (a.id === "SPR-014" ? { ...a, acwr: 1.18 } : a))
    );
  }, []);

  const moveSession = useCallback((fromIdx, toIdx) => {
    if (fromIdx === toIdx) return;
    setMicroPlan((prev) => {
      const next = [...prev];
      // swap session, type & load between the two days; keep the `day` labels in place
      const from = next[fromIdx];
      const to = next[toIdx];
      next[fromIdx] = { ...from, session: to.session, type: to.type, load: to.load };
      next[toIdx] = { ...to, session: from.session, type: from.type, load: from.load };
      return next;
    });
  }, []);

  const dismissAlert = useCallback((id) => {
    setAlerts((p) => p.map((a) => (a.id === id ? { ...a, status: "dismissed" } : a)));
  }, []);

  // Record a new fitness-test result. Benchmark auto-derives from 30 m time
  // if not supplied (Elite ≤ 3.75 s, National ≤ 3.95 s, else Developing).
  const addFitnessTest = useCallback((draft) => {
    const sprint30 = Number(draft.sprint30) || 0;
    const benchmark =
      draft.benchmark || (sprint30 && sprint30 <= 3.75 ? "Elite" : sprint30 && sprint30 <= 3.95 ? "National" : "Developing");
    const ath = athletes.find((a) => a.id === draft.athleteId);
    const row = {
      athleteId: draft.athleteId,
      athleteName: ath?.name || draft.athleteId,
      sprint30,
      sprint60: Number(draft.sprint60) || 0,
      cmj: Number(draft.cmj) || 0,
      broadJump: Number(draft.broadJump) || 0,
      benchmark,
      recordedOn: new Date().toISOString().slice(0, 10),
    };
    setFitnessTests((p) => [row, ...p]);
    return row;
  }, [athletes]);

  const stats = useMemo(() => {
    const total = athletes.length;
    const available = athletes.filter((a) => a.status === "available").length;
    const injured = athletes.filter((a) => a.status === "injured" || a.status === "rehab").length;
    const avgReadiness = Math.round(
      athletes.reduce((s, a) => s + a.readiness, 0) / Math.max(1, total)
    );
    return { total, available, injured, avgReadiness };
  }, [athletes]);

  const value = {
    role,
    setRole,
    athletes,
    injuries,
    alerts,
    microPlan,
    aiLoadAccepted,
    attendance,
    fitnessTests,
    stats,
    getAthlete,
    getInjuryByRegion,
    getInjuriesForAthlete,
    advanceInjuryStage,
    reportInjury,
    addAthlete,
    updateAthleteOnboarding,
    advanceOnboarding,
    addAthleteTag,
    removeAthleteTag,
    addInjuryNote,
    setAttendanceStatus,
    acceptAILoadReduction,
    dismissAlert,
    addFitnessTest,
    moveSession,
    resetDemo,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
