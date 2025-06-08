// SubMemo PWA Service Worker
const CACHE_NAME = "submemo-v1";

// Install event
self.addEventListener("install", (event) => {
  console.log("Service Worker: Install event");
  self.skipWaiting();
});

// Activate event
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activate event");
  event.waitUntil(self.clients.claim());
});

// Fetch event - パススルー（オフライン機能なし）
self.addEventListener("fetch", (event) => {
  // ネットワークリクエストをそのまま通す
  event.respondWith(fetch(event.request));
});
