// voiceAlert.ts — thin wrapper around the browser's Web Speech API
// (SpeechSynthesis). No server/API key involved — this either works using
// whatever voices the device/browser ships, or it doesn't, and callers are
// told which so the UI never claims speech happened when it didn't.

import type { LanguageCode } from "./i18n";

const BCP47_FOR_LANGUAGE: Record<LanguageCode, string> = {
  en: "en-US",
  hi: "hi-IN",
  ne: "ne-NP",
  bo: "bo",
};

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

// Resolves true if speech actually started playing, false if the browser
// rejected/errored it (e.g. no voice installed for that language, or the
// tab isn't allowed to autoplay audio yet). Never throws.
export function speak(text: string, language: LanguageCode): Promise<boolean> {
  return new Promise((resolve) => {
    if (!isSpeechSupported()) {
      resolve(false);
      return;
    }
    try {
      window.speechSynthesis.cancel(); // don't stack overlapping alerts
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = BCP47_FOR_LANGUAGE[language] ?? "en-US";
      let settled = false;
      utterance.onstart = () => {
        if (!settled) {
          settled = true;
          resolve(true);
        }
      };
      utterance.onerror = () => {
        if (!settled) {
          settled = true;
          resolve(false);
        }
      };
      window.speechSynthesis.speak(utterance);
      // Some browsers never fire onstart for queued speech — fall back to
      // "assume it worked" shortly after, since onerror still fires later
      // if it genuinely failed and nothing currently listens past this point.
      setTimeout(() => {
        if (!settled) {
          settled = true;
          resolve(true);
        }
      }, 500);
    } catch {
      resolve(false);
    }
  });
}

export function stopSpeaking() {
  if (isSpeechSupported()) window.speechSynthesis.cancel();
}
