importScripts('celsius.config.js');
importScripts('celsius.bundle.js');

const engine = new self.CelsiusRouter(self.__celsius$config);

self.addEventListener('install', event => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(clients.claim()));

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    if (engine.isCelsiusRoute(url)) {
        event.respondWith(engine.route(event.request));
    }
});
