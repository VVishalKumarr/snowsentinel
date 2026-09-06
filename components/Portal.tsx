"use client";

// Portal — renders children into document.body instead of wherever this
// component sits in the React tree. Used for overlays that must be
// guaranteed to sit in the ROOT stacking context, immune to any ancestor
// that might introduce its own (a transform, filter, or positioned+
// z-indexed wrapper) — see EmergencyQuickBar's SOS modal, which is
// rendered per-page (not at the root layout) and was getting painted
// behind Leaflet's zoom/attribution controls (z-index: 1000 in
// leaflet.css) before this fix.

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}
