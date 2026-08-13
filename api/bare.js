export default async function handler(req, res) {
    const targetUrl = req.headers['x-celsius-target'];
    
    if (!targetUrl) {
        return res.status(400).send('Missing x-celsius-target header');
    }

    // Clean up headers before forwarding
    const headersToForward = { ...req.headers };
    delete headersToForward['host'];
    delete headersToForward['x-celsius-target'];
    delete headersToForward['x-forwarded-for'];
    delete headersToForward['x-forwarded-proto'];

    try {
        const fetchRes = await fetch(targetUrl, {
            method: req.method,
            headers: headersToForward,
            body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
            redirect: 'manual'
        });

        // Set response status
        res.status(fetchRes.status);

        // Forward headers from the target, omitting those that break iframes
        for (const [key, value] of fetchRes.headers.entries()) {
            if (['x-frame-options', 'content-security-policy', 'access-control-allow-origin'].includes(key.toLowerCase())) {
                continue; 
            }
            res.setHeader(key, value);
        }

        // Allow our proxy to load it
        res.setHeader('Access-Control-Allow-Origin', '*');

        // Stream the response back to the client
        const buffer = await fetchRes.arrayBuffer();
        res.send(Buffer.from(buffer));

    } catch (err) {
        res.status(500).send(`Serverless Transport Error: ${err.message}`);
    }
}
