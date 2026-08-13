class CelsiusRouter {
    constructor(config) {
        this.prefix = config.prefix;
        this.encode = config.encodeUrl;
        this.decode = config.decodeUrl;
        this.bareServer = config.bare;
    }

    isCelsiusRoute(url) {
        return url.pathname.startsWith(this.prefix);
    }

    async route(request) {
        const url = new URL(request.url);
        const encodedTarget = url.pathname.replace(this.prefix, '');
        let targetUrl;
        
        try {
            targetUrl = this.decode(encodedTarget) + url.search;
        } catch (e) {
            return new Response("Invalid URL", { status: 400 });
        }

        const transportHeaders = new Headers(request.headers);
        transportHeaders.set('x-celsius-target', targetUrl);
        // Prevent origin leakage
        transportHeaders.delete('origin');
        transportHeaders.delete('referer');

        try {
            return await fetch(this.bareServer, {
                method: request.method,
                headers: transportHeaders,
                body: ['GET', 'HEAD'].includes(request.method) ? null : await request.blob(),
                redirect: 'manual'
            });
        } catch (error) {
            return new Response("Transport Error", { status: 500 });
        }
    }
}

self.CelsiusRouter = CelsiusRouter;
