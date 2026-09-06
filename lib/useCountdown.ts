"use client";

// useCountdown — ticks once a second toward a target timestamp. Used by the
// Risk Countdown display. The target itself is always DEMO PREDICTION data
// (see HazardAlertContext) — this hook only does the arithmetic/formatting,
// it makes no claim about where the target time came from.

import { useEffect, useState } from "react";

export function useCountdown(targetMs: number | null): { remainingMs: number | null; reached: boolean } {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (targetMs == null) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  if (targetMs == null) return { remainingMs: null, reached: false };
  const remainingMs = Math.max(0, targetMs - now);
  return { remainingMs, reached: remainingMs <= 0 };
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return days > 0 ? `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

// Deterministic DEMO PREDICTION duration per severity — not a scientific
// arrival-time model. "stable" scenarios have no predicted arrival at all.
export function getCountdownDurationMs(severity: "high-anomaly" | "stable" | "extreme"): number | null {
  if (severity === "stable") return null;
  if (severity === "extreme") return ((1 * 60 + 42) * 60 + 18) * 1000; // 01:42:18
  return 4 * 60 * 60 * 1000; // high-anomaly: 04:00:00
}
