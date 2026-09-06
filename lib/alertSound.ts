// alertSound.ts — synthesized emergency alert tones via the Web Audio API.
// No audio file asset needed (avoids licensing/asset-loading concerns) and
// gives exact control over duration, so this is never an "infinite
// annoying loop" — HIGH plays a short two-beep pattern, CRITICAL a
// slightly longer three-beep pattern, both a few seconds total, and both
// stoppable immediately via the returned stop function (wired to the
// MUTE ALERT button).
//
// Autoplay policy: browsers block audio until the page has seen a user
// gesture. unlockAudio() must be called from a real click/touch handler
// (see components/SoundUnlocker.tsx) — playAlertSound() itself never
// throws even if the context can't start, so a blocked sound never breaks
// the visual alert.

let audioCtx: AudioContext | null = null;

export function isSoundSupported(): boolean {
  return typeof window !== "undefined" && !!(window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
}

function getContext(): AudioContext | null {
  if (audioCtx) return audioCtx;
  if (!isSoundSupported()) return null;
  try {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new Ctor();
    return audioCtx;
  } catch {
    return null;
  }
}

// Call this from a genuine user-gesture handler (a click) as early as
// possible (e.g. once, the first time the user interacts with the page) so
// the context is already running by the time an alert needs to play.
export function unlockAudio(): void {
  const ctx = getContext();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {
      // still blocked — playAlertSound will simply produce no sound
    });
  }
}

type Level = "HIGH" | "CRITICAL";

const PATTERNS: Record<Level, { freq: number; durationS: number; gapS: number }[]> = {
  HIGH: [
    { freq: 660, durationS: 0.28, gapS: 0.14 },
    { freq: 660, durationS: 0.28, gapS: 0 },
  ],
  CRITICAL: [
    { freq: 880, durationS: 0.22, gapS: 0.1 },
    { freq: 880, durationS: 0.22, gapS: 0.1 },
    { freq: 880, durationS: 0.22, gapS: 0.1 },
  ],
};

// Returns a stop() function the caller can invoke to silence the sound
// immediately (MUTE ALERT). Never throws — a blocked/unavailable audio
// context just means stop() is a no-op and no sound was ever produced.
export function playAlertSound(level: Level): () => void {
  const ctx = getContext();
  if (!ctx) return () => {};
  if (ctx.state === "suspended") ctx.resume().catch(() => {});

  const oscillators: OscillatorNode[] = [];
  let t = ctx.currentTime;
  for (const seg of PATTERNS[level]) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(seg.freq, t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
    gain.gain.setValueAtTime(0.18, t + seg.durationS - 0.02);
    gain.gain.linearRampToValueAtTime(0, t + seg.durationS);
    osc.connect(gain).connect(ctx.destination);
    try {
      osc.start(t);
      osc.stop(t + seg.durationS);
      oscillators.push(osc);
    } catch {
      // ignore — this segment just won't play
    }
    t += seg.durationS + seg.gapS;
  }

  let stopped = false;
  return () => {
    if (stopped) return;
    stopped = true;
    oscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch {
        // already stopped/ended — fine
      }
    });
  };
}
