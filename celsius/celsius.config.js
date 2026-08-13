const prefix = '/celsius/go/';
const bare = '/api/bare';

function encodeUrl(url) {
    return Buffer.from(url).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function decodeUrl(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    const remainder = str.length % 4;
    if (remainder) {
        str += '='.repeat(4 - remainder);
    }
    return Buffer.from(str, 'base64').toString('utf-8');
}

export default {
    prefix,
    bare,
    encodeUrl,
    decodeUrl
};
