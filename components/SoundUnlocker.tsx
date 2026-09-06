"use client";

// SoundUnlocker — mounted once near the root. Browsers block Web Audio
// until a genuine user gesture; this listens for the first click/touch
// anywhere on the page and unlocks the audio context then, so an
// emergency sound triggered later (e.g. by a hazard alert banner) has the
// best chance of actually playing instead of being silently blocked.

import { useEffect } from "react";
import { unlockAudio } from "@/lib/alertSound";

export default function SoundUnlocker() {
  useEffect(() => {
    function unlock() {
      unlockAudio();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    }
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  return null;
}
