"use client";

import { PlayCircle, Square } from "lucide-react";

export default function DemoSimulationRunner({
  running,
  message,
  onRun,
  onStop,
}: {
  running: boolean;
  message: string | null;
  onRun: () => void;
  onStop: () => void;
}) {
  return (
    <div className="glass-panel flex flex-col gap-3 rounded-2xl border-teal-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div>
        <h2 className="text-sm font-semibold tracking-wide text-slate-800">DISASTER SIMULATION</h2>
        <p className="mt-1 text-xs text-slate-500">
          {running && message
            ? message
            : "Runs a guided, ~60–90 second walkthrough across every tab using the Extreme Weather demo scenario."}
        </p>
      </div>
      {running ? (
        <button
          onClick={onStop}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Square className="h-3.5 w-3.5" /> STOP SIMULATION
        </button>
      ) : (
        <button
          onClick={onRun}
          className="flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700"
        >
          <PlayCircle className="h-3.5 w-3.5" /> RUN DISASTER SIMULATION
        </button>
      )}
    </div>
  );
}
