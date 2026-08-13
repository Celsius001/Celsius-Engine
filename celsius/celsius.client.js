(function(config) {
    if (!config) return;

    const PREFIX = config.prefix;

    function shouldRewrite(url) {
        if (!url || typeof url !== 'string') return false;
        if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('javascript:')) return false;
        return !url.startsWith(PREFIX);
    }

    function rewriteUrl(url) {
        if (!shouldRewrite(url)) return url;
        try {
            const absoluteUrl = new URL(url, window.location.origin).href;
            return PREFIX + config.encodeUrl(absoluteUrl);
        } catch (e) {
            return url;
        }
    }

    function unwriteUrl(url) {
        if (typeof url === 'string' && url.startsWith(PREFIX)) {
            try { return config.decodeUrl(url.slice(PREFIX.length)); } catch (e) { return url; }
        }
        return url;
    }

    const originalFetch = window.fetch;
    window.fetch = async function(resource, options) {
        let reqUrl = resource instanceof Request ? resource.url : resource;
        if (shouldRewrite(reqUrl)) {
            const rewritten = rewriteUrl(reqUrl);
            return resource instanceof Request 
                ? originalFetch.call(this, new Request(rewritten, resource)) 
                : originalFetch.call(this, rewritten, options);
        }
        return originalFetch.call(this, resource, options);
    };

    const originalXHRopen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
        return originalXHRopen.call(this, method, shouldRewrite(url) ? rewriteUrl(url) : url, async, user, password);
    };

    const originalCreateElement = Document.prototype.createElement;
    Document.prototype.createElement = function(tagName, options) {
        const el = originalCreateElement.call(this, tagName, options);
        if (['script', 'iframe', 'embed', 'object', 'img', 'link', 'audio', 'video', 'source', 'a', 'form'].includes(tagName.toLowerCase())) {
            ['src', 'href', 'action'].forEach(attr => {
                if (attr in el) hookProperty(Object.getPrototypeOf(el), attr);
            });
        }
        return el;
    };

    function hookProperty(proto, prop) {
        const desc = Object.getOwnPropertyDescriptor(proto, prop);
        if (!desc || !desc.configurable) return;
        Object.defineProperty(proto, prop, {
            get: function() { return unwriteUrl(desc.get.call(this)); },
            set: function(v) { desc.set.call(this, shouldRewrite(v) ? rewriteUrl(v) : v); },
            enumerable: desc.enumerable,
            configurable: desc.configurable
        });
    }

    ['src', 'href', 'action'].forEach(attr => {
        [HTMLImageElement, HTMLScriptElement, HTMLIFrameElement, HTMLEmbedElement, HTMLMediaElement, HTMLSourceElement, HTMLAnchorElement, HTMLLinkElement, HTMLFormElement].forEach(el => {
            if (attr in el.prototype) hookProperty(el.prototype, attr);
        });
    });

    const originalWindowOpen = window.open;
    window.open = function(url, target, features) {
        return originalWindowOpen.call(this, shouldRewrite(url) ? rewriteUrl(url) : url, target, features);
    };

    window.__celsius$location = { href: unwriteUrl(window.location.href) };
    try {
        const p = new URL(window.__celsius$location.href);
        Object.assign(window.__celsius$location, { origin: p.origin, protocol: p.protocol, host: p.host, hostname: p.hostname, port: p.port, pathname: p.pathname, search: p.search, hash: p.hash });
    } catch(e) {}

})(self.__celsius$config);
