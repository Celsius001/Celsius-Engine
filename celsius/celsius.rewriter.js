import config from './celsius.config.js';

function isHtmlContent(contentType) {
    return contentType && (contentType.includes('text/html') || contentType.includes('application/xhtml'));
}

function isCssContent(contentType) {
    return contentType && contentType.includes('text/css');
}

function isJavaScriptContent(contentType) {
    return contentType && (contentType.includes('application/javascript') || contentType.includes('text/javascript'));
}

function rewriteHtmlUrls(html, baseUrl) {
    let rewritten = html;

    const baseTag = `<base href="${baseUrl}" target="_self">`;
    if (!rewritten.includes('<base')) {
        rewritten = rewritten.replace(/<head[^>]*>/i, (match) => match + baseTag);
    }

    rewritten = rewritten.replace(/href=["'](?!(?:https?:|\/\/|javascript:|mailto:|#|data:))/g, (match) => {
        return match + baseUrl;
    });

    rewritten = rewritten.replace(/src=["'](?!(?:https?:|\/\/|javascript:|data:))/g, (match) => {
        return match + baseUrl;
    });

    rewritten = rewritten.replace(/<form[^>]+action=["'](?!(?:https?:|\/\/|javascript:))/gi, (match) => {
        return match + baseUrl;
    });

    rewritten = rewritten.replace(/(url\(["']?)(?!(?:https?:|\/\/|javascript:|data:))/g, (match) => {
        return match + baseUrl;
    });

    return rewritten;
}

function rewriteCssUrls(css, baseUrl) {
    let rewritten = css;

    rewritten = rewritten.replace(/(url\(["']?)(?!(?:https?:|\/\/|javascript:|data:))/g, (match) => {
        return match + baseUrl;
    });

    return rewritten;
}

function rewriteJavaScriptUrls(js, originalUrl) {
    let rewritten = js;

    const urlPattern = /["']((?!(?:https?:|\/\/|javascript:|data:)).+?)["']/g;
    rewritten = rewritten.replace(urlPattern, (match, urlPart) => {
        try {
            const resolvedUrl = new URL(urlPart, originalUrl).href;
            const encoded = config.encodeUrl(resolvedUrl);
            return match.replace(urlPart, `${config.prefix}${encoded}`);
        } catch {
            return match;
        }
    });

    return rewritten;
}

function rewriteResponse(content, contentType, originalUrl) {
    if (isHtmlContent(contentType)) {
        try {
            return rewriteHtmlUrls(content, originalUrl);
        } catch {
            return content;
        }
    }

    if (isCssContent(contentType)) {
        try {
            return rewriteCssUrls(content, originalUrl);
        } catch {
            return content;
        }
    }

    if (isJavaScriptContent(contentType)) {
        try {
            return rewriteJavaScriptUrls(content, originalUrl);
        } catch {
            return content;
        }
    }

    return content;
}

export default {
    rewriteResponse,
    isHtmlContent,
    isCssContent,
    isJavaScriptContent
};
