"use client";

import { useState } from "react";
import { Siren, PhoneCall, HeartPulse, Home, X } from "lucide-react";
import SOSButton from "./SOSButton";

export type QuickBarTab = "emergency" | "help" | "shelters";

export default function EmergencyQuickBar({ onNavigate }: { onNavigate: (tab: QuickBarTab) => void }) {
  const [sosOpen, setSosOpen] = useState(false);

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md sm:hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-4">
          <button
            onClick={() => setSosOpen(true)}
            className="flex flex-col items-center gap-1 bg-red-600 py-2.5 text-white"
          >
            <Siren className="h-5 w-5" />
            <span className="text-[10px] font-bold tracking-wide">SOS</span>
          </button>
          <button
            onClick={() => onNavigate("emergency")}
            className="flex flex-col items-center gap-1 py-2.5 text-slate-600"
          >
            <PhoneCall className="h-5 w-5" />
            <span className="text-[10px] font-medium tracking-wide">HELPLINE</span>
          </button>
          <button
            onClick={() => onNavigate("help")}
            className="flex flex-col items-center gap-1 py-2.5 text-slate-600"
          >
            <HeartPulse className="h-5 w-5" />
            <span className="text-[10px] font-medium tracking-wide">HELP</span>
          </button>
          <button
            onClick={() => onNavigate("shelters")}
            className="flex flex-col items-center gap-1 py-2.5 text-slate-600"
          >
            <Home className="h-5 w-5" />
            <span className="text-[10px] font-medium tracking-wide">SHELTER</span>
          </button>
        </div>
      </div>

      {/* Desktop: floating SOS + quick actions in the corner */}
      <div className="fixed bottom-6 right-6 z-40 hidden flex-col items-end gap-2 sm:flex">
        <button
          onClick={() => setSosOpen(true)}
          className="sos-pulse flex h-16 w-16 items-center justify-center rounded-full border-4 border-red-700 bg-red-600 text-white shadow-lg transition-transform hover:scale-105"
        >
          <Siren className="h-7 w-7" />
        </button>
      </div>

      {sosOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-wide text-slate-800">EMERGENCY SOS</h3>
              <button onClick={() => setSosOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>
            <SOSButton />
          </div>
        </div>
      )}
    </>
  );
}
