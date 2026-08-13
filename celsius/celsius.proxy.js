import config from './celsius.config.js';
import rewriter from './celsius.rewriter.js';

const restrictedHeaders = [
    'x-frame-options',
    'content-security-policy',
    'clear-site-data',
    'x-content-type-options',
    'x-xss-protection',
    'referrer-policy'
];

async function proxyRequest(targetUrl, options = {}) {
    const method = options.method || 'GET';
    const body = options.body;
    const incomingHeaders = options.headers || {};

    const headersToForward = {};
    const excludedHeaders = ['host', 'connection', 'content-length', 'transfer-encoding'];
    
    for (const [key, value] of Object.entries(incomingHeaders)) {
        if (!excludedHeaders.includes(key.toLowerCase())) {
            headersToForward[key] = value;
        }
    }

    headersToForward['user-agent'] = headersToForward['user-agent'] || 'Celsius-Proxy/1.0';

    try {
        const fetchOptions = {
            method,
            headers: headersToForward,
            redirect: 'follow'
        };

        if (body && !['GET', 'HEAD'].includes(method)) {
            fetchOptions.body = body;
        }

        const response = await fetch(targetUrl, fetchOptions);

        const contentType = response.headers.get('content-type') || '';
        let responseBody = await response.text();

        if (rewriter.isHtmlContent(contentType) || rewriter.isCssContent(contentType) || rewriter.isJavaScriptContent(contentType)) {
            responseBody = rewriter.rewriteResponse(responseBody, contentType, targetUrl);
        }

        const responseHeaders = {};
        for (const [key, value] of response.headers.entries()) {
            if (!restrictedHeaders.includes(key.toLowerCase())) {
                responseHeaders[key] = value;
            }
        }

        responseHeaders['access-control-allow-origin'] = '*';
        responseHeaders['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH';
        responseHeaders['access-control-allow-headers'] = '*';
        responseHeaders['x-content-type-options'] = 'nosniff';

        return {
            status: response.status,
            headers: responseHeaders,
            body: responseBody
        };
    } catch (error) {
        return {
            status: 502,
            headers: { 'content-type': 'text/plain' },
            body: `Proxy Error: ${error.message}`
        };
    }
}

export default {
    proxyRequest
};
