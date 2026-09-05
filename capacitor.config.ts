import type { CapacitorConfig } from "@capacitor/cli";

// SnowSentinel ships as one Next.js codebase for web, Android, and iOS —
// no platform-specific application logic. The native shells load the same
// Next.js server (this app uses a live API route for AI explanations, so it
// is not a static export) via `server.url` below.
//
// - Default: the live production deployment, so a built APK/IPA works on
//   any real device with normal internet — no dev server required.
// - Local dev/emulator testing: set CAPACITOR_SERVER_URL=http://10.0.2.2:3000
//   (10.0.2.2 is the Android emulator's alias for your machine's localhost)
//   before `npx cap sync`, so the emulator hits your `npm run dev` server.
// - Redeploying: after a new production deploy, no change needed here — the
//   URL below stays the same unless you move to a different host.
const serverUrl = process.env.CAPACITOR_SERVER_URL || "https://snowsenti.vercel.app";

const config: CapacitorConfig = {
  appId: "com.binarybrains.snowsentinel",
  appName: "SnowSentinel",
  webDir: "public",
  server: {
    url: serverUrl,
    cleartext: serverUrl.startsWith("http://"),
  },
};

export default config;
