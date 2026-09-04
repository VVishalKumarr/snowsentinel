import { Satellite, BrainCircuit, Map as MapIcon, ShieldAlert } from "lucide-react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

const CAPABILITIES = [
  {
    icon: Satellite,
    title: "SATELLITE MONITORING",
    description: "Track changes across time using repeated satellite-style observations of a monitored region.",
  },
  {
    icon: BrainCircuit,
    title: "AI-ASSISTED ANALYSIS",
    description: "Interpret environmental signals and translate structured data into plain-language explanations.",
  },
  {
    icon: MapIcon,
    title: "IMPACT MAPPING",
    description: "Visualize potential affected areas downstream of a monitored zone in an interactive map.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <Hero />

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {CAPABILITIES.map((cap) => (
            <div key={cap.title} className="glass-panel rounded-2xl p-6">
              <cap.icon className="h-6 w-6 text-cyan-400" strokeWidth={1.5} />
              <h3 className="mt-4 text-sm font-semibold tracking-[0.1em] text-slate-200">{cap.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{cap.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-4 pb-16 sm:px-6">
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
          <ShieldAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" strokeWidth={1.75} />
          <p className="text-sm leading-relaxed text-amber-200/90">
            This prototype is not an operational avalanche prediction system. Risk assessments and impact
            zones are experimental simulations intended for demonstration and preparedness research.
          </p>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-5xl px-4 py-20 text-center sm:px-6">
        <h2 className="text-2xl font-bold leading-snug tracking-tight text-slate-100 sm:text-4xl">
          WE CAN&apos;T STOP NATURE.
          <br />
          <span className="text-cyan-400">BUT WE CAN SEE IT CHANGING.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
          SnowSentinel turns Earth-observation data into information that can help humans prepare, respond
          and recover.
        </p>
      </section>

      <footer className="mt-auto border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-center text-xs text-slate-600 sm:flex-row sm:text-left sm:px-6">
          <span>SnowSentinel — Team Binary Brains (Vishal, Aashiv, Anhad)</span>
          <span>Track 1 — When Nature Strikes · Hackathon Prototype</span>
        </div>
      </footer>
    </div>
  );
}
