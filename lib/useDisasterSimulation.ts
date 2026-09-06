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
import { useLanguage } from "./i18n";
import type { TranslationKey } from "./i18n/en";

interface Step {
  tab: DashboardTab;
  messageKey: TranslationKey;
  delayMs: number; // time to stay on the previous step before advancing to this one
}

const STEPS: Step[] = [
  { tab: "satellite", messageKey: "simStepSatellite", delayMs: 8000 },
  { tab: "risk", messageKey: "simStepRisk", delayMs: 8000 },
  { tab: "impact", messageKey: "simStepImpact", delayMs: 10000 },
  { tab: "shelters", messageKey: "simStepShelters", delayMs: 8000 },
  { tab: "help", messageKey: "simStepHelp", delayMs: 8000 },
  { tab: "family", messageKey: "simStepFamily", delayMs: 8000 },
  { tab: "emergency", messageKey: "simStepEmergency", delayMs: 8000 },
];

export function useDisasterSimulation(
  onNavigate: (tab: DashboardTab) => void,
  onTriggerImpactSimulation: () => void
) {
  const { scenario, setScenarioId } = useScenario();
  const { t } = useLanguage();
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
    message: stepIndex >= 0 ? t(STEPS[stepIndex].messageKey) : null,
    run,
    stop,
  };
}
