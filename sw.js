// Funzionamento offline: l'app resta disponibile anche senza connessione.
const CACHE = 'venezia-v11';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './weather.json'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // Pagina e meteo: prima la rete (per avere gli aggiornamenti), poi la copia salvata.
  if (url.pathname.endsWith('/') || url.pathname.endsWith('.html') || url.pathname.endsWith('weather.json')) {
    e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(url.pathname.endsWith('weather.json') ? './weather.json' : e.request, copy)); return r; })
      .catch(() => caches.match(url.pathname.endsWith('weather.json') ? './weather.json' : e.request, {ignoreSearch:true}).then(r => r || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
