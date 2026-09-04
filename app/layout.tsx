import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ScenarioProvider } from "@/lib/ScenarioContext";
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
  title: "SnowSentinel — Mountain Hazard Monitor",
  description:
    "SnowSentinel is a hackathon prototype for AI-assisted mountain hazard monitoring: satellite observation, change detection, experimental risk assessment, and simulated impact mapping.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <ScenarioProvider>{children}</ScenarioProvider>
      </body>
    </html>
  );
}
