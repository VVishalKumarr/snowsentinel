// SnowSentinel service worker — minimal offline-first app shell cache.
// Not a full Workbox setup: for a hackathon prototype this caches the app
// shell + static assets so previously visited screens keep working offline.
// It does NOT make live services (ambulance dispatch, family sync, AI calls)
// work offline — those correctly report "last cached" state instead.

const CACHE_NAME = "snowsentinel-v1";
const APP_SHELL = ["/", "/dashboard", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return; // never cache live API calls

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/dashboard")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request)
          .then((response) => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            return response;
          })
          .catch(() => cached)
    )
  );
});

// ---------------------------------------------------------------------------
// Web Push — this is what lets a hazard/SOS notification reach the browser
// even when no SnowSentinel tab is open (as long as the browser itself is
// running). The payload's title/body arrive already translated into the
// recipient's saved language (see lib/pushService.ts) — this file never
// hardcodes English, it only displays what the server sent.
// ---------------------------------------------------------------------------
self.addEventListener("push", (event) => {
  let payload = { title: "SnowSentinel", body: "", channelId: "GENERAL_ALERTS", data: {} };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    // ignore malformed payloads — still show a minimal notification below
  }

  const tag = payload.data && payload.data.type === "sos" ? "sos" : "hazard";
  const requireInteraction = payload.channelId === "CRITICAL_ALERTS" || payload.channelId === "FAMILY_SOS";

  event.waitUntil(
    self.registration.showNotification(payload.title || "SnowSentinel", {
      body: payload.body || "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag,
      renotify: true,
      requireInteraction,
      data: payload.data || {},
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  let path = "/dashboard";
  if (data.type === "hazard") path = `/dashboard?tab=impact&alertId=${encodeURIComponent(data.alertId || "")}`;
  else if (data.type === "sos") path = `/dashboard?tab=family&notificationId=${encodeURIComponent(data.notificationId || "")}`;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(path);
          return client.focus();
        }
      }
      return self.clients.openWindow(path);
    })
  );
});
