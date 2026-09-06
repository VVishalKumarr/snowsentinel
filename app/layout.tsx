import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ScenarioProvider } from "@/lib/ScenarioContext";
import { AppStateProvider } from "@/lib/AppStateContext";
import { AuthProvider } from "@/lib/AuthContext";
import { NotificationProvider } from "@/lib/NotificationContext";
import { PushRegistrationProvider } from "@/lib/PushRegistrationContext";
import { HazardAlertProvider } from "@/lib/HazardAlertContext";
import { LanguageProvider } from "@/lib/i18n";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import FamilySosAlertOverlay from "@/components/FamilySosAlertOverlay";
import HazardAlertBanner from "@/components/HazardAlertBanner";
import SafetyAssistant from "@/components/SafetyAssistant";
import SoundUnlocker from "@/components/SoundUnlocker";
import LanguageSync from "@/components/LanguageSync";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SnowSentinel — Mountain Hazard & Emergency Response",
  description:
    "SnowSentinel is a hackathon prototype connecting satellite-based mountain hazard monitoring with emergency preparedness: shelters, nearby help, one-tap SOS, family safety, and offline-first access.",
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <LanguageProvider>
          <AuthProvider>
            <PushRegistrationProvider>
              <NotificationProvider>
                <ScenarioProvider>
                  <HazardAlertProvider>
                    <AppStateProvider>
                      <ServiceWorkerRegister />
                      <SoundUnlocker />
                      <LanguageSync />
                      <FamilySosAlertOverlay />
                      <HazardAlertBanner />
                      {children}
                      <SafetyAssistant />
                    </AppStateProvider>
                  </HazardAlertProvider>
                </ScenarioProvider>
              </NotificationProvider>
            </PushRegistrationProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
