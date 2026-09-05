"use client";

// useDisasterSimulation — drives the guided "RUN DISASTER SIMULATION" demo
// sequence. Must be owned by a component that stays mounted regardless of
// which dashboard tab is active (e.g. the dashboard page itself), because
// the sequence's own job is to switch tabs — if the timers lived inside a
// component that only renders on one tab, navigating away would unmount it
// and silently kill the rest of the sequence.

import { useEffect, useRef, useState } from "react";
import { useScenario } from "./ScenarioContext";
import type { DashboardTab } from "./dashboardTabs";

interface Step {
  tab: DashboardTab;
  message: string;
  delayMs: number; // time to stay on the previous step before advancing to this one
}

const STEPS: Step[] = [
  { tab: "satellite", message: "Satellite anomaly appears…", delayMs: 8000 },
  { tab: "risk", message: "Risk score increasing…", delayMs: 8000 },
  { tab: "impact", message: "Priority zones activating, hazard path rendering…", delayMs: 10000 },
  { tab: "shelters", message: "Nearby shelters highlighted…", delayMs: 8000 },
  { tab: "help", message: "Available emergency resources appearing…", delayMs: 8000 },
  { tab: "family", message: "Family safety panel updating…", delayMs: 8000 },
  { tab: "emergency", message: "Preparedness alert issued. You can trigger SOS now.", delayMs: 8000 },
];

export function useDisasterSimulation(
  onNavigate: (tab: DashboardTab) => void,
  onTriggerImpactSimulation: () => void
) {
  const { scenario, setScenarioId } = useScenario();
  const [running, setRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const stop = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setRunning(false);
    setStepIndex(-1);
  };

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const run = () => {
    stop();
    setRunning(true);
    setScenarioId(`${scenario.region.id}-extreme`);
    let elapsed = 0;
    STEPS.forEach((step, i) => {
      elapsed += step.delayMs;
      const t = setTimeout(() => {
        setStepIndex(i);
        onNavigate(step.tab);
        if (step.tab === "impact") onTriggerImpactSimulation();
        if (i === STEPS.length - 1) {
          const endTimer = setTimeout(() => setRunning(false), 2000);
          timers.current.push(endTimer);
        }
      }, elapsed);
      timers.current.push(t);
    });
  };

  return {
    running,
    message: stepIndex >= 0 ? STEPS[stepIndex].message : null,
    run,
    stop,
  };
}
