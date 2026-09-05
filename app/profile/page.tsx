"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserCircle, Users2, Globe, Phone, LogOut } from "lucide-react";
import Navbar from "@/components/Navbar";
import LanguageSelector from "@/components/LanguageSelector";
import { useAuth } from "@/lib/AuthContext";
import { useAppState } from "@/lib/AppStateContext";
import { LANGUAGES, useLanguage } from "@/lib/i18n";

function maskPhone(phone: string): string {
  if (phone.length <= 4) return phone;
  return phone.slice(0, -4).replace(/\d/g, "•") + phone.slice(-4);
}

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();
  const { trustedContacts } = useAppState();
  const { language } = useLanguage();
  const router = useRouter();

  const currentLangLabel = LANGUAGES.find((l) => l.code === language)?.label ?? "English";

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (loading) return null;

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="glass-panel max-w-sm rounded-2xl p-6 text-center">
            <p className="mb-3 text-sm text-slate-600">You&apos;re not logged in.</p>
            <Link href="/login" className="inline-block rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700">
              Log in / Sign up
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            <span className="font-mono text-sm font-bold text-teal-700">#{user.uniqueCode}</span>
          </div>

          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <dt className="flex items-center gap-1.5 text-slate-500">
                <Phone className="h-3.5 w-3.5" /> Phone number
              </dt>
              <dd className="font-mono text-slate-700">{maskPhone(user.phoneNumber)}</dd>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <dt className="flex items-center gap-1.5 text-slate-500">
                <Users2 className="h-3.5 w-3.5" /> Trusted contacts (local, non-account)
              </dt>
              <dd className="text-slate-700">{trustedContacts.length}</dd>
            </div>
            <div className="flex items-center justify-between pb-1">
              <dt className="flex items-center gap-1.5 text-slate-500">
                <Globe className="h-3.5 w-3.5" /> Language
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
              MANAGE FAMILY
            </Link>
            <Link
              href="/dashboard?tab=emergency"
              className="rounded-lg border border-slate-200 bg-white py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              EMERGENCY CONTACTS
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 py-2.5 text-xs font-semibold text-red-700 hover:bg-red-100"
          >
            <LogOut className="h-3.5 w-3.5" /> LOG OUT
          </button>
        </div>

        <p className="mt-4 text-center text-[11px] text-slate-400">
          Your account only stores your name, phone number, and family connections you explicitly
          approve. See the Trust &amp; Limitations section in the Emergency tab for what this prototype
          does and doesn&apos;t do.
        </p>
      </main>
    </div>
  );
}
