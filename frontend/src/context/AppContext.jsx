import { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";
import {
  ATHLETES_SEED,
  INJURIES_SEED,
  ALERTS_SEED,
  REHAB_STAGES,
  PERIODISATION,
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

  // persist on any state change (debounced via microtask)
  useEffect(() => {
    savePersisted({ role, athletes, injuries, alerts, microPlan, aiLoadAccepted });
  }, [role, athletes, injuries, alerts, microPlan, aiLoadAccepted]);

  const resetDemo = useCallback(() => {
    setAthletes(ATHLETES_SEED);
    setInjuries(INJURIES_SEED);
    setAlerts(ALERTS_SEED);
    setMicroPlan(PERIODISATION.micro);
    setAiLoadAccepted(false);
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
        const cleared = nextStage === "Cleared";
        return {
          ...i,
          stage: nextStage,
          severity: cleared ? "cleared" : "rehab",
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
    stats,
    getAthlete,
    getInjuryByRegion,
    getInjuriesForAthlete,
    advanceInjuryStage,
    reportInjury,
    addAthlete,
    updateAthleteOnboarding,
    acceptAILoadReduction,
    dismissAlert,
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
