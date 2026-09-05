"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MapPin, Siren, Satellite as SatelliteIcon, ShieldHalf, LifeBuoy, Home, Users2, PhoneCall } from "lucide-react";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";
import ConnectionIndicator from "@/components/ConnectionIndicator";
import StatCard from "@/components/StatCard";
import RiskIndicator from "@/components/RiskIndicator";
import ImageComparison from "@/components/ImageComparison";
import RiskPanel from "@/components/RiskPanel";
import ImpactZone from "@/components/ImpactZone";
import PriorityZonePanel from "@/components/PriorityZonePanel";
import WarningPanel from "@/components/WarningPanel";
import AnalysisPanel from "@/components/AnalysisPanel";
import ShelterList from "@/components/ShelterList";
import NearbyHelpList from "@/components/NearbyHelpList";
import AmbulanceList from "@/components/AmbulanceList";
import VolunteerList from "@/components/VolunteerList";
import FamilyNetworkPanel from "@/components/FamilyNetworkPanel";
import HelplineSection from "@/components/HelplineSection";
import SOSButton from "@/components/SOSButton";
import OfflineGuide from "@/components/OfflineGuide";
import TrustSection from "@/components/TrustSection";
import AlertCenter from "@/components/AlertCenter";
import EmergencyQuickBar from "@/components/EmergencyQuickBar";
import DemoSimulationRunner from "@/components/DemoSimulationRunner";
import OverviewMap from "@/components/OverviewMap";
import MountainSelector from "@/components/MountainSelector";
import { useScenario } from "@/lib/ScenarioContext";
import { useAppState } from "@/lib/AppStateContext";
import { useLanguage } from "@/lib/i18n";
import { useDisasterSimulation } from "@/lib/useDisasterSimulation";
import { getShelters, getAmbulances, VOLUNTEERS } from "@/lib/emergencyData";
import { DASHBOARD_TABS, type DashboardTab } from "@/lib/dashboardTabs";

function DashboardInner() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as DashboardTab) || "overview";
  const [tab, setTab] = useState<DashboardTab>(
    DASHBOARD_TABS.some((t) => t.id === initialTab) ? initialTab : "overview"
  );
  const [impactSignal, setImpactSignal] = useState(0);

  const { scenario } = useScenario();
  const { familyMembers } = useAppState();
  const { t } = useLanguage();
  const simulation = useDisasterSimulation(setTab, () => setImpactSignal((s) => s + 1));

  const shelters = getShelters(scenario.region.id);
  const ambulances = getAmbulances(scenario.region.id);
  const availableAmbulances = ambulances.filter((a) => a.status === "AVAILABLE").length;
  const availableVolunteers = VOLUNTEERS.filter((v) => v.status === "AVAILABLE").length;
  const safeCount = familyMembers.filter((m) => m.status === "SAFE").length;

  return (
    <div className="flex min-h-screen flex-col pb-20 sm:pb-8">
      <Navbar />

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 pulse-dot" /> {t("systemMonitoring")}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {scenario.region.shortName} (Demo Himalayan Region)
            </span>
          </div>
          <ConnectionIndicator />
        </div>

        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6">
          {DASHBOARD_TABS.map((dt) => (
            <button
              key={dt.id}
              onClick={() => setTab(dt.id)}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
                tab === dt.id ? "bg-teal-50 text-teal-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              {t(dt.labelKey)}
            </button>
          ))}
        </nav>

        {simulation.running && tab !== "overview" && (
          <div className="flex items-center justify-center gap-3 border-t border-teal-200 bg-teal-50 px-4 py-1.5 text-center text-[11px] font-medium text-teal-700 sm:px-6">
            <span>▶ DISASTER SIMULATION RUNNING — {simulation.message ?? "starting…"}</span>
            <button
              onClick={simulation.stop}
              className="rounded border border-teal-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-teal-700 hover:bg-teal-100"
            >
              STOP
            </button>
          </div>
        )}
      </div>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        {tab === "overview" && (
          <div className="space-y-6">
            <DemoSimulationRunner
              running={simulation.running}
              message={simulation.message}
              onRun={simulation.run}
              onStop={simulation.stop}
            />

            <MountainSelector />

            <div className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-2xl p-4 sm:p-5">
              <div>
                <div className="text-[10px] font-medium tracking-wide text-slate-500">{t("currentHazard")}</div>
                <div className="mt-1">
                  <RiskIndicator level={scenario.risk.riskLevel} />
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] tracking-wide text-slate-500">{t("riskLabel")}</div>
                <div className="text-3xl font-bold text-slate-800">
                  {scenario.risk.riskScore}
                  <span className="text-lg text-slate-400">/100</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                icon={SatelliteIcon}
                label={t("statSatelliteChange")}
                value={`+${scenario.environmentalChange.deltaFromPrevious}%`}
              />
              <StatCard icon={ShieldHalf} label={t("statPriorityZones")} value={scenario.settlements.length} />
              <StatCard icon={Home} label={t("statNearbyShelters")} value={shelters.length} />
              <StatCard icon={LifeBuoy} label={t("statAvailableAmbulances")} value={availableAmbulances} />
              <StatCard icon={Users2} label={t("statVolunteersAvailable")} value={availableVolunteers} />
              <StatCard
                icon={Users2}
                label={t("statFamilySafety")}
                value={`${safeCount}/${familyMembers.length}`}
                sublabel={t("statCheckedIn")}
              />
            </div>

            <OverviewMap scenario={scenario} />
          </div>
        )}

        {tab === "satellite" && <ImageComparison scenario={scenario} />}

        {tab === "risk" && (
          <div className="space-y-6">
            <RiskPanel scenario={scenario} />
            <AnalysisPanel scenario={scenario} />
          </div>
        )}

        {tab === "impact" && (
          <div className="space-y-6">
            <ImpactZone scenario={scenario} autoSimulateSignal={impactSignal} />
            <PriorityZonePanel scenario={scenario} />
            <WarningPanel scenario={scenario} />
          </div>
        )}

        {tab === "help" && (
          <div className="space-y-6">
            <NearbyHelpList />
            <AmbulanceList />
            <VolunteerList />
          </div>
        )}

        {tab === "shelters" && <ShelterList />}

        {tab === "family" && <FamilyNetworkPanel />}

        {tab === "emergency" && (
          <div className="space-y-6">
            <AlertCenter scenario={scenario} />
            <div className="glass-panel flex flex-col items-center gap-4 rounded-2xl p-6">
              <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-800">
                <Siren className="h-4 w-4 text-red-600" /> ONE-TAP SOS
              </div>
              <SOSButton />
            </div>
            <HelplineSection />
            <OfflineGuide />
            <TrustSection />
          </div>
        )}
      </main>

      <EmergencyQuickBar
        onNavigate={(t) => setTab(t === "emergency" ? "emergency" : t === "help" ? "help" : "shelters")}
      />

      <footer className="hidden border-t border-slate-200 py-6 text-center text-[11px] text-slate-400 sm:block">
        <PhoneCall className="mr-1 inline h-3 w-3" />
        SnowSentinel is a hackathon prototype — not a substitute for official emergency services.
      </footer>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading dashboard…</div>}>
        <DashboardInner />
      </Suspense>
    </AuthGuard>
  );
}
