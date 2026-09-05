"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Satellite, UserCircle } from "lucide-react";
import ConnectionIndicator from "./ConnectionIndicator";
import LanguageSelector from "./LanguageSelector";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/i18n";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useLanguage();

  const links = [
    { href: "/dashboard", label: t("navHome") },
    { href: "/dashboard?tab=family", label: t("tabFamily") },
    { href: "/dashboard?tab=emergency", label: t("tabEmergency") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-50 border border-teal-200 group-hover:border-teal-400 transition-colors">
            <Satellite className="h-4.5 w-4.5 text-teal-700" strokeWidth={1.75} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-[0.14em] text-slate-900">
              {t("appName").toUpperCase()}
            </span>
            <span className="text-[10px] tracking-[0.18em] text-slate-500">
              {t("appTagline").toUpperCase()}
            </span>
          </div>
        </Link>

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

        <div className="flex items-center gap-2">
          <LanguageSelector compact />
          <ConnectionIndicator />
          <Link
            href={user ? "/profile" : "/login"}
            className="flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <UserCircle className="h-4 w-4" />
            <span className="hidden sm:inline">{user ? user.name : t("authLogin")}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
