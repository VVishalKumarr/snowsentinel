"use client";

import { Suspense, useEffect, useState } from "react";
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
import RiskCountdown from "@/components/RiskCountdown";
import LocationRiskCard from "@/components/LocationRiskCard";
import CrowdDensityPanel from "@/components/CrowdDensityPanel";
import DemoHazardControlPanel from "@/components/DemoHazardControlPanel";
import { useScenario } from "@/lib/ScenarioContext";
import { useAppState } from "@/lib/AppStateContext";
import { useHazardAlert } from "@/lib/HazardAlertContext";
import { useLanguage } from "@/lib/i18n";
import { useDisasterSimulation } from "@/lib/useDisasterSimulation";
import { getShelters, getAmbulances, VOLUNTEERS } from "@/lib/emergencyData";
import { getTotalEstimatedPeople, getHighestCrowdDensity, CROWD_DENSITY_LABEL_KEY, CROWD_DENSITY_EMOJI } from "@/lib/crowdDensity";
import { ALERT_LEVEL_LABEL_KEY, ALERT_LEVEL_EMOJI, ALERT_LEVEL_COLORS } from "@/lib/alertLevels";
import { DASHBOARD_TABS, type DashboardTab } from "@/lib/dashboardTabs";

function DashboardInner() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as DashboardTab) || "overview";
  const [tab, setTab] = useState<DashboardTab>(
    DASHBOARD_TABS.some((t) => t.id === initialTab) ? initialTab : "overview"
  );
  const [impactSignal, setImpactSignal] = useState(0);

  // Keep the visible tab in sync with ?tab=... even when navigating here
  // via router.push while already mounted on /dashboard (e.g. clicking a
  // notification) — a plain useState initializer only runs once, so
  // without this the tab would silently fail to switch on a same-route
  // navigation.
  useEffect(() => {
    const urlTab = searchParams.get("tab") as DashboardTab | null;
    if (urlTab && DASHBOARD_TABS.some((dt) => dt.id === urlTab)) {
      setTab((prev) => (prev === urlTab ? prev : urlTab));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const { scenario } = useScenario();
  const { familyMembers } = useAppState();
  const { alertLevel, hazardTypeKey, crowdDensityOverride } = useHazardAlert();
  const { t } = useLanguage();
  const simulation = useDisasterSimulation(setTab, () => setImpactSignal((s) => s + 1));
  const alertColors = ALERT_LEVEL_COLORS[alertLevel];
  const totalEstimatedPeople = getTotalEstimatedPeople(scenario);
  const highestDensity = crowdDensityOverride ?? getHighestCrowdDensity(scenario);

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
              <MapPin className="h-3.5 w-3.5" /> {scenario.region.shortName} {t("demoHimalayanRegion")}
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
            <span>{t("simulationRunningPrefix", { message: simulation.message ?? t("simulationStarting") })}</span>
            <button
              onClick={simulation.stop}
              className="rounded border border-teal-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-teal-700 hover:bg-teal-100"
            >
              {t("stopSimulation")}
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

            <div className={`glass-panel rounded-2xl border-2 p-4 sm:p-5 ${alertColors.border} ${alertColors.bg}`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-medium tracking-wide text-slate-500">{t("currentHazard")}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <RiskIndicator level={scenario.risk.riskLevel} />
                    <span className={`text-sm font-bold ${alertColors.text}`}>
                      {ALERT_LEVEL_EMOJI[alertLevel]} {t(ALERT_LEVEL_LABEL_KEY[alertLevel])}
                    </span>
                  </div>
                  <div className="mt-1 text-xs font-medium text-slate-600">{t(hazardTypeKey)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] tracking-wide text-slate-500">{t("riskLabel")}</div>
                  <div className="text-3xl font-bold text-slate-800">
                    {scenario.risk.riskScore}
                    <span className="text-lg text-slate-400">/100</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <RiskCountdown />
                <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs">
                  <div className="text-[10px] font-semibold tracking-wide text-slate-500">{t("crowdDensityFieldLabel")}</div>
                  <div className="mt-1 text-sm font-bold">
                    {CROWD_DENSITY_EMOJI[highestDensity]} {t(CROWD_DENSITY_LABEL_KEY[highestDensity])}
                  </div>
                  <div className="mt-1 text-slate-500">
                    {t("estimatedPeopleLabel")}: <span className="font-mono text-slate-700">{totalEstimatedPeople.toLocaleString()}</span>
                  </div>
                  <div className="mt-1 text-[10px] text-slate-400">{t("demoCrowdDataBadge")}</div>
                </div>
                <div className="flex flex-col justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3">
                  <button
                    onClick={() => setTab("impact")}
                    className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900"
                  >
                    {t("viewImpactMapButton")}
                  </button>
                  <button
                    onClick={() => setTab("shelters")}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {t("findNearbyShelterButton")}
                  </button>
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
            <LocationRiskCard />
            <CrowdDensityPanel scenario={scenario} />
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
            <DemoHazardControlPanel />
            <AlertCenter scenario={scenario} />
            <div className="glass-panel flex flex-col items-center gap-4 rounded-2xl p-6">
              <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-800">
                <Siren className="h-4 w-4 text-red-600" /> {t("oneTapSosTitle")}
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
        {t("dashboardDisclaimer")}
      </footer>
    </div>
  );
}

function DashboardLoadingFallback() {
  const { t } = useLanguage();
  return <div className="p-8 text-sm text-slate-500">{t("loadingDashboard")}</div>;
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<DashboardLoadingFallback />}>
        <DashboardInner />
      </Suspense>
    </AuthGuard>
  );
}
