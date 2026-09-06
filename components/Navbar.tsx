"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Satellite, UserCircle, Menu, X } from "lucide-react";
import ConnectionIndicator from "./ConnectionIndicator";
import LanguageSelector from "./LanguageSelector";
import NotificationBell from "./NotificationBell";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/i18n";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/dashboard", label: t("navHome") },
    { href: "/dashboard?tab=family", label: t("tabFamily") },
    { href: "/dashboard?tab=emergency", label: t("tabEmergency") },
  ];

  return (
    <header className="sticky top-0 z-[1150] border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:px-6 sm:py-3">
        <div className="flex min-w-0 items-center gap-1">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? t("commonDismiss") : t("navMenu")}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-slate-600 hover:bg-slate-50 sm:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/dashboard" className="group flex min-w-0 items-center gap-2 sm:gap-2.5">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-teal-200 bg-teal-50 transition-colors group-hover:border-teal-400">
              <Satellite className="h-4.5 w-4.5 text-teal-700" strokeWidth={1.75} />
            </div>
            <div className="flex min-w-0 flex-col leading-none">
              <span className="truncate text-xs font-semibold tracking-[0.1em] text-slate-900 sm:text-sm sm:tracking-[0.14em]">
                {t("appName").toUpperCase()}
              </span>
              <span className="hidden truncate text-[10px] tracking-[0.18em] text-slate-500 sm:block">
                {t("appTagline").toUpperCase()}
              </span>
            </div>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 sm:flex">
          {links.map((link) => {
            const active = pathname === link.href.split("?")[0];
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

        <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
          <LanguageSelector compact />
          <ConnectionIndicator />
          {user && <NotificationBell />}
          <Link
            href={user ? "/profile" : "/login"}
            className="flex flex-shrink-0 items-center gap-1 rounded-full border border-slate-200 px-1.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 sm:px-2"
          >
            <UserCircle className="h-4 w-4" />
            <span className="hidden sm:inline">{user ? user.name : t("authLogin")}</span>
          </Link>
        </div>
      </div>

      {menuOpen && (
        <nav className="relative z-[1250] border-t border-slate-200 bg-white px-3 py-2 sm:hidden">
          {links.map((link) => {
            const active = pathname === link.href.split("?")[0];
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block rounded-md px-3 py-2.5 text-sm font-medium tracking-wide transition-colors ${
                  active ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
