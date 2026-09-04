"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { SCENARIOS, DEFAULT_SCENARIO_ID, getScenario } from "./demoData";
import type { HazardScenario } from "./types";

interface ScenarioContextValue {
  scenario: HazardScenario;
  scenarioId: string;
  setScenarioId: (id: string) => void;
  scenarios: HazardScenario[];
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

  const value = useMemo<ScenarioContextValue>(
    () => ({
      scenario: getScenario(scenarioId),
      scenarioId,
      setScenarioId,
      scenarios: SCENARIOS,
    }),
    [scenarioId]
  );

  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>;
}

export function useScenario() {
  const ctx = useContext(ScenarioContext);
  if (!ctx) throw new Error("useScenario must be used within ScenarioProvider");
  return ctx;
}
