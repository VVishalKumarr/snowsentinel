"use client";

import { useState } from "react";
import { Siren, PhoneCall, HeartPulse, Home, X } from "lucide-react";
import SOSButton from "./SOSButton";
import Portal from "./Portal";
import { useLanguage } from "@/lib/i18n";

export type QuickBarTab = "emergency" | "help" | "shelters";

export default function EmergencyQuickBar({ onNavigate }: { onNavigate: (tab: QuickBarTab) => void }) {
  const { t } = useLanguage();
  const [sosOpen, setSosOpen] = useState(false);

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-[1100] border-t border-slate-200 bg-white/95 backdrop-blur-md sm:hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-4">
          <button
            onClick={() => setSosOpen(true)}
            className="flex flex-col items-center gap-1 bg-red-600 py-2.5 text-white"
          >
            <Siren className="h-5 w-5" />
            <span className="text-[10px] font-bold tracking-wide">{t("sos")}</span>
          </button>
          <button
            onClick={() => onNavigate("emergency")}
            className="flex flex-col items-center gap-1 py-2.5 text-slate-600"
          >
            <PhoneCall className="h-5 w-5" />
            <span className="text-[10px] font-medium tracking-wide">{t("quickBarHelpline")}</span>
          </button>
          <button
            onClick={() => onNavigate("help")}
            className="flex flex-col items-center gap-1 py-2.5 text-slate-600"
          >
            <HeartPulse className="h-5 w-5" />
            <span className="text-[10px] font-medium tracking-wide">{t("quickBarHelp")}</span>
          </button>
          <button
            onClick={() => onNavigate("shelters")}
            className="flex flex-col items-center gap-1 py-2.5 text-slate-600"
          >
            <Home className="h-5 w-5" />
            <span className="text-[10px] font-medium tracking-wide">{t("quickBarShelter")}</span>
          </button>
        </div>
      </div>

      {/* Desktop: floating SOS + quick actions in the corner */}
      <div className="fixed bottom-6 right-6 z-[1100] hidden flex-col items-end gap-2 sm:flex">
        <button
          onClick={() => setSosOpen(true)}
          className="sos-pulse flex h-16 w-16 items-center justify-center rounded-full border-4 border-red-700 bg-red-600 text-white shadow-lg transition-transform hover:scale-105"
        >
          <Siren className="h-7 w-7" />
        </button>
      </div>

      {sosOpen && (
        <Portal>
          <div className="fixed inset-0 z-[1400] flex items-end justify-center bg-slate-900/40 p-3 sm:items-center sm:p-4">
            <div className="max-h-[calc(100vh-1.5rem)] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-wide text-slate-800">{t("emergencySosModalTitle")}</h3>
                <button onClick={() => setSosOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <SOSButton />
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
