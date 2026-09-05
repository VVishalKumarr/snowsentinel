"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Satellite } from "lucide-react";
import ConnectionIndicator from "./ConnectionIndicator";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-50 border border-teal-200 group-hover:border-teal-400 transition-colors">
            <Satellite className="h-4.5 w-4.5 text-teal-700" strokeWidth={1.75} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-[0.14em] text-slate-900">
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
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <ConnectionIndicator />
      </div>
    </header>
  );
}
