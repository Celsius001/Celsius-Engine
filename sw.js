// / i made sw.js at root level :)
importScripts('/celsius/celsius.config.js');
importScripts('/celsius/celsius.bundle.js');

const engine = new CelsiusRouter(self.__celsius$config);

self.addEventListener('install', event => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(clients.claim()));

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    if (engine.isCelsiusRoute(url)) {
        event.respondWith(engine.route(event.request));
    }
});
