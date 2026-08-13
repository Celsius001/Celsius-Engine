importScripts('celsius.config.js');
importScripts('celsius.bundle.js');

// Option 1 Fix: 'self.' is removed from CelsiusRouter
const engine = new CelsiusRouter(self.__celsius$config);

self.addEventListener('install', event => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(clients.claim()));

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    if (engine.isCelsiusRoute(url)) {
        event.respondWith(engine.route(event.request));
    }
});
