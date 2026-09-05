import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { RIDGE_BACK, RIDGE_MID, RIDGE_FRONT, SNOW_CAP_FULL } from "@/lib/satelliteArt";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-white">
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-teal-700">
              HACKATHON PROTOTYPE · DISASTER PREPAREDNESS
            </div>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
              See the change before it becomes a disaster.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg">
              Satellite intelligence and AI-assisted analysis, connected to shelters, emergency
              help, and family safety — for mountain hazard preparedness.
            </p>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-500">
              SnowSentinel monitors changes in mountain environments, evaluates experimental hazard
              indicators, and connects that signal to what people need next: where to go, who can
              help, and how to reach loved ones.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="group flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-3 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-teal-700"
              >
                START MONITORING
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/dashboard?tab=impact"
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold tracking-wide text-slate-700 transition-colors hover:bg-slate-50"
              >
                <PlayCircle className="h-4 w-4" />
                VIEW DEMO
              </Link>
            </div>
          </div>

          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 shadow-md">
            <svg viewBox="0 0 800 500" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
              <defs>
                <linearGradient id="heroSky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0a1526" />
                  <stop offset="55%" stopColor="#0d1b2e" />
                  <stop offset="100%" stopColor="#050a12" />
                </linearGradient>
                <linearGradient id="heroSnow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f1f8ff" />
                  <stop offset="100%" stopColor="#b9d4e8" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="800" height="500" fill="url(#heroSky)" />
              {Array.from({ length: 50 }).map((_, i) => (
                <circle key={i} cx={(i * 163) % 800} cy={(i * 89) % 160} r={i % 4 === 0 ? 1.4 : 0.7} fill="#7fb8e0" opacity={0.4} />
              ))}
              <polygon points={RIDGE_BACK} fill="#16283e" />
              <polygon points={RIDGE_MID} fill="#12202f" />
              <polygon points={SNOW_CAP_FULL} fill="url(#heroSnow)" opacity={0.9} />
              <polygon points={RIDGE_FRONT} fill="#0b1520" />
            </svg>

            <div className="scan-grid pointer-events-none absolute inset-0 opacity-40" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-cyan-400/10 to-transparent scan-sweep" />

            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-1">
              <span className="text-[9px] font-semibold tracking-[0.1em] text-amber-300">DEMO OBSERVATION</span>
            </div>
            <div className="absolute bottom-3 right-3 text-[9px] tracking-wide text-slate-500">
              SYNTHETIC RENDER · NOT LIVE IMAGERY
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
