import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ScenarioProvider } from "@/lib/ScenarioContext";
import { AppStateProvider } from "@/lib/AppStateContext";
import { AuthProvider } from "@/lib/AuthContext";
import { LanguageProvider } from "@/lib/i18n";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
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
            <ScenarioProvider>
              <AppStateProvider>
                <ServiceWorkerRegister />
                {children}
              </AppStateProvider>
            </ScenarioProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
