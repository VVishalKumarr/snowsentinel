"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Satellite, Radio } from "lucide-react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/monitor", label: "Monitor" },
  { href: "/analysis", label: "Impact Map" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05080d]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-cyan-500/10 border border-cyan-500/30 group-hover:border-cyan-400/60 transition-colors">
            <Satellite className="h-4.5 w-4.5 text-cyan-400" strokeWidth={1.75} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-[0.14em] text-slate-100">
              SNOWSENTINEL
            </span>
            <span className="text-[10px] tracking-[0.18em] text-slate-500">
              MOUNTAIN HAZARD MONITOR
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1.5 text-xs font-medium tracking-wide transition-colors ${
                  active
                    ? "bg-white/10 text-slate-100"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
          <Radio className="h-3 w-3 text-emerald-400 pulse-dot" strokeWidth={2} />
          <span className="text-[10px] font-medium tracking-[0.12em] text-emerald-300">
            SYSTEM MONITORING
          </span>
        </div>
      </div>
    </header>
  );
}
