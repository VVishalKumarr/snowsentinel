"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { SCENARIOS, DEFAULT_SCENARIO_ID, getScenario, getScenariosForRegion, severityKeyOf } from "./demoData";
import { REGIONS } from "./demoData";
import type { HazardScenario } from "./types";

interface ScenarioContextValue {
  scenario: HazardScenario;
  scenarioId: string;
  setScenarioId: (id: string) => void;
  setRegionId: (regionId: string) => void;
  scenarios: HazardScenario[];
  scenariosForCurrentRegion: HazardScenario[];
}

const ScenarioContext = createContext<ScenarioContextValue | null>(null);

const STORAGE_KEY = "snowsentinel:scenarioId";

export function ScenarioProvider({ children }: { children: ReactNode }) {
  const [scenarioId, setScenarioIdState] = useState<string>(DEFAULT_SCENARIO_ID);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && SCENARIOS.some((s) => s.id === stored)) {
        setScenarioIdState(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  const setScenarioId = (id: string) => {
    setScenarioIdState(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // ignore
    }
  };

  // Switching region keeps the current severity level (e.g. "extreme") where
  // possible, so a presenter mid-demo doesn't get bounced back to a default.
  const setRegionId = (regionId: string) => {
    if (!REGIONS.some((r) => r.id === regionId)) return;
    const severity = severityKeyOf(scenarioId);
    const candidateId = `${regionId}-${severity}`;
    const nextId = SCENARIOS.some((s) => s.id === candidateId)
      ? candidateId
      : getScenariosForRegion(regionId)[0]?.id ?? DEFAULT_SCENARIO_ID;
    setScenarioId(nextId);
  };

  const value = useMemo<ScenarioContextValue>(() => {
    const scenario = getScenario(scenarioId);
    return {
      scenario,
      scenarioId,
      setScenarioId,
      setRegionId,
      scenarios: SCENARIOS,
      scenariosForCurrentRegion: getScenariosForRegion(scenario.region.id),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId]);

  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>;
}

export function useScenario() {
  const ctx = useContext(ScenarioContext);
  if (!ctx) throw new Error("useScenario must be used within ScenarioProvider");
  return ctx;
}
