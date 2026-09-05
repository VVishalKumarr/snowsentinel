# SnowSentinel

AI-assisted mountain hazard monitoring and emergency-preparedness prototype.
Built for Hackathon Track 1 — "When Nature Strikes" — by Team Binary Brains
(Vishal, Aashiv, Anhad).

**This is a hackathon prototype, not an operational system.** Satellite
imagery, risk scores, priority zones, shelters, ambulances, and volunteers
are demo/synthetic data unless explicitly labeled otherwise. See the Trust &
Limitations section in the app's Emergency tab.

## Running the web app

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The landing page links to
`/dashboard`, the integrated monitoring + emergency-response experience.

Optional: create `.env.local` (see `.env.local.example`) with
`ANTHROPIC_API_KEY` to enable live AI-generated hazard explanations. Without
it, the app uses a deterministic template explanation built from the same
structured data — everything else works identically either way.

## Project structure

- `lib/demoData.ts`, `lib/riskEngine.ts`, `lib/ai.ts` — the original
  satellite/change-detection/risk-assessment engine.
- `lib/emergencyData.ts`, `lib/emergencyTypes.ts` — the emergency-response
  layer (shelters, hospitals/police/fire, ambulances, volunteers, priority
  zones, alerts), all demo data shaped to accept real APIs later.
- `lib/emergencyContacts.config.ts` — put real, verified local emergency
  numbers here for a real deployment. Left blank by default; SnowSentinel
  never invents emergency numbers.
- `lib/AppStateContext.tsx` — local-first app state (family safety, trusted
  contacts, SOS queue, alert acknowledgement), persisted to `localStorage`.
- `app/dashboard/` — the integrated dashboard (Overview, Satellite, Risk,
  Impact Map, Nearby Help, Shelters, Family Safety, Emergency tabs).
- `public/sw.js` + `app/manifest.ts` — offline-first PWA shell caching.

## Mobile apps (Capacitor)

SnowSentinel ships as **one Next.js codebase** for web, Android, and iOS —
there is no separate mobile application logic. The native shells load the
Next.js app via `capacitor.config.ts`'s `server.url` (this app uses a live
API route for AI explanations, so it isn't a static export).

### Android

The `android/` folder is a ready Android Studio project (already run once in
this environment via `npx cap add android` + `npx cap sync`).

To build a debug APK, you need a JDK and the Android SDK installed (this
development environment did not have them, so no APK has been built here):

```bash
cd android
./gradlew assembleDebug
# output: android/app/build/outputs/apk/debug/app-debug.apk
```

Or open the `android/` folder directly in Android Studio and click Run.

By default the app points at `http://10.0.2.2:3000` (the Android emulator's
alias for your computer's `localhost`), so `npm run dev` on your machine is
reachable from the emulator. For a real device or production build, deploy
the Next.js app (e.g. to Vercel) and set `CAPACITOR_SERVER_URL` to that HTTPS
URL, then re-run `npx cap sync android`.

### iOS

The `ios/` folder is a ready Xcode project (generated via `npx cap add ios`
+ `npx cap sync` — this uses Swift Package Manager, not CocoaPods, so no
`pod install` step is needed). Building iOS requires Xcode on macOS, which
this development environment does not have, so no build has been produced
here.

On a Mac:

```bash
npx cap sync ios         # after any config change
open ios/App/App.xcodeproj
```

Then in Xcode: select a simulator or a connected device, and press Run (⌘R).
As with Android, set `CAPACITOR_SERVER_URL` to your deployed URL before
syncing for anything beyond local testing.

## Offline behavior

A service worker (`public/sw.js`) caches the app shell so previously visited
screens keep working offline. The header connection indicator
(🟢 Online / 🟡 Limited / 🔴 Offline) reflects real browser connectivity.
Family safety state, trusted contacts, and SOS events are stored locally and
sync (replay) automatically when connectivity returns — nothing is falsely
reported as delivered while offline.
