import type { CapacitorConfig } from "@capacitor/cli";

// SnowSentinel ships as one Next.js codebase for web, Android, and iOS —
// no platform-specific application logic. The native shells load the same
// Next.js server (this app uses a live API route for AI explanations, so it
// is not a static export) via `server.url` below.
//
// - Local development / emulator testing: keep the default. On the Android
//   emulator, 10.0.2.2 is the host machine's localhost, so `npm run dev`
//   on your computer is reachable from inside the emulator.
// - Production: set CAPACITOR_SERVER_URL to your deployed HTTPS URL (e.g.
//   a Vercel deployment of this project) before running `npx cap sync`,
//   then rebuild the native project in Android Studio / Xcode.
const serverUrl = process.env.CAPACITOR_SERVER_URL || "http://10.0.2.2:3000";

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
