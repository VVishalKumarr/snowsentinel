"use client";

// AuthGuard — client-side defense-in-depth for protected pages.
// middleware.ts already blocks direct navigation with no session cookie at
// all; this additionally handles the case where a cookie exists but the
// session it names is invalid/expired (checked against the database via
// /api/auth/me), and gives a real loading state instead of ever leaving
// the screen stuck on a blank "Rendering..." frame.

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/i18n";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("authCheckingSession")}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
