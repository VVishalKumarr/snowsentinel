"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserCircle, Users2, Globe, AtSign, LogOut } from "lucide-react";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";
import LanguageSelector from "@/components/LanguageSelector";
import { useAuth } from "@/lib/AuthContext";
import { useAppState } from "@/lib/AppStateContext";
import { LANGUAGES, useLanguage } from "@/lib/i18n";

function ProfileContent() {
  const { user, logout } = useAuth();
  const { trustedContacts } = useAppState();
  const { language, t } = useLanguage();
  const router = useRouter();

  const currentLangLabel = LANGUAGES.find((l) => l.code === language)?.label ?? "English";

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8 sm:px-6">
        <div className="glass-panel rounded-2xl p-6">
          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 border border-teal-200">
              <UserCircle className="h-9 w-9 text-teal-700" strokeWidth={1.5} />
            </div>
            <h1 className="text-lg font-semibold text-slate-900">{user.name}</h1>
            <span className="font-mono text-sm font-bold text-teal-700">@{user.username}</span>
          </div>

          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <dt className="flex items-center gap-1.5 text-slate-500">
                <AtSign className="h-3.5 w-3.5" /> {t("authUsername")}
              </dt>
              <dd className="font-mono text-slate-700">@{user.username}</dd>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <dt className="flex items-center gap-1.5 text-slate-500">
                <Users2 className="h-3.5 w-3.5" /> {t("emergencyContacts")}
              </dt>
              <dd className="text-slate-700">{trustedContacts.length}</dd>
            </div>
            <div className="flex items-center justify-between pb-1">
              <dt className="flex items-center gap-1.5 text-slate-500">
                <Globe className="h-3.5 w-3.5" /> {t("language")}
              </dt>
              <dd>
                <LanguageSelector compact />
              </dd>
            </div>
          </dl>

          <p className="mt-2 text-[11px] text-slate-400">Current: {currentLangLabel}</p>

          <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Link
              href="/dashboard?tab=family"
              className="rounded-lg border border-slate-200 bg-white py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {t("manageFamily")}
            </Link>
            <Link
              href="/dashboard?tab=emergency"
              className="rounded-lg border border-slate-200 bg-white py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {t("emergencyContacts").toUpperCase()}
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 py-2.5 text-xs font-semibold text-red-700 hover:bg-red-100"
          >
            <LogOut className="h-3.5 w-3.5" /> {t("logOut")}
          </button>
        </div>

        <p className="mt-4 text-center text-[11px] text-slate-400">
          Your account only stores your name, username, and family connections you explicitly approve.
          Your password is never stored in plain text. See the Trust &amp; Limitations section in the
          Emergency tab for what this prototype does and doesn&apos;t do.
        </p>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
