const CACHE = "reperage-ph-v11";

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll([
        new Request("./", { cache: "reload" }),
        new Request("./index.html", { cache: "reload" }),
        new Request("./manifest.json", { cache: "reload" }),
        new Request("./icon-192.png", { cache: "reload" }),
        new Request("./icon-512.png", { cache: "reload" })
      ]))
      .catch(() => {})
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  /* Réseau d'abord, en contournant le cache HTTP du navigateur :
     sans cela, Safari peut répondre depuis sa propre réserve et
     la mise à jour du dépôt n'apparaît pas. Repli sur le cache hors réseau. */
  e.respondWith(
    fetch(e.request, { cache: "no-store" })
      .then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return r;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./")))
  );
});
