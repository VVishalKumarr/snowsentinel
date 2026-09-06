"use client";

// LanguageSync — persists the selected language to the server whenever an
// authenticated user changes it. localStorage alone (lib/i18n's normal
// persistence) only helps this browser; a push notification sent while
// the app isn't running has to be rendered server-side (see
// lib/pushService.ts), so the server needs to know the user's language
// choice too.

import { useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/lib/AuthContext";

export default function LanguageSync() {
  const { language } = useLanguage();
  const { user, authedFetch } = useAuth();
  const lastSynced = useRef<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (lastSynced.current === language) return;
    lastSynced.current = language;
    authedFetch("/api/user/language", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ language }),
    }).catch(() => {});
  }, [user, language, authedFetch]);

  return null;
}
