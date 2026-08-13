import config from '../celsius/celsius.config.js';
import proxy from '../celsius/celsius.proxy.js';

export default async function handler(req, res) {
    let targetUrl = req.query.url || req.headers['x-celsius-url'];

    if (!targetUrl) {
        return res.status(400).json({ error: 'Missing url parameter' });
    }

    try {
        targetUrl = config.decodeUrl(targetUrl);
    } catch (err) {
        return res.status(400).json({ error: 'Invalid URL encoding' });
    }

    try {
        new URL(targetUrl);
    } catch (err) {
        return res.status(400).json({ error: 'Invalid target URL' });
    }

    const method = req.method || 'GET';
    let body;

    if (!['GET', 'HEAD'].includes(method)) {
        body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const result = await proxy.proxyRequest(targetUrl, {
        method,
        headers: req.headers,
        body
    });

    res.status(result.status);

    for (const [key, value] of Object.entries(result.headers)) {
        res.setHeader(key, value);
    }

    res.send(result.body);
}
