self.__celsius$config = {
    prefix: '/celsius/go/',
    bare: '/api/bare', 
    encodeUrl: url => btoa(url).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ''),
    decodeUrl: url => {
        let str = url.replace(/-/g, '+').replace(/_/g, '/');
        while (str.length % 4) str += '=';
        return atob(str);
    }
};
