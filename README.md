# Celsius Engine

Celsius is a modular, interception-based web proxy engine using Service Workers and DOM sandboxing.

## Architecture
- **Frontend:** Service Worker (`celsius.sw.js`) intercepts network requests. Client-side DOM hooking (`celsius.client.js`) catches dynamic URL generation.
- **Backend:** A Vercel Serverless function (`api/bare.js`) acts as the transport layer to bypass CORS and strip restrictive headers (`X-Frame-Options`).

## Deployment via Vercel

Because the transport relies on a serverless Node.js backend, you must host this on a platform that supports serverless functions, like Vercel.

1. Install the Vercel CLI: `npm i -g vercel`
2. Run `vercel login` and authenticate.
3. In your project root (where your `api` and `celsius` folders are), run `vercel`.
4. Follow the prompts to deploy. Vercel will automatically detect the `api` folder and turn `api/bare.js` into a serverless function endpoint at `/api/bare`.

## Usage
Include `celsius.config.js` in your HTML document, register the Service Worker (`celsius.sw.js`), and point your iframes to `/celsius/go/` followed by the Base64 encoded target URL. Note: For full functionality, the `celsius.client.js` script must be injected into the response body of HTML pages retrieved by the backend.
