/* PocketDeck service worker — makes the app open instantly, even before it reaches your Mac.
   App files: served from cache straight away, refreshed in the background.
   The live connection to your Mac goes to a different (Cloudflare) address, so it never touches this cache. */
const CACHE = 'pocketdeck-v4';
const SHELL = ['./', 'app.js', 'link.js', 'deck-config.js', 'style.css', 'manifest.webmanifest', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon.svg'];
const BASE = new URL('./', self.location).pathname;
const SHELL_PATHS = new Set(SHELL.map(f => new URL(f, self.location).pathname));

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(f => new URL(f, self.location).pathname))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || !url.pathname.startsWith(BASE)) return;
  const key = e.request.mode === 'navigate' ? BASE : url.pathname;
  if (!SHELL_PATHS.has(key)) return;   // never cache the address book (endpoint.json / pair.json)
  e.respondWith(caches.open(CACHE).then(async cache => {
    const hit = await cache.match(key);
    const fresh = fetch(e.request).then(res => { if (res.ok) cache.put(key, res.clone()); return res; }).catch(() => hit);
    return hit || fresh; // stale-while-revalidate
  }));
});
