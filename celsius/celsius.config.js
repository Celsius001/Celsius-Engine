self.__celsius$config = {
    prefix: '/celsius/go/',
    // Replace this with your actual Vercel project URL!! very important
    bare: '/api/bare', 
    encodeUrl: url => btoa(url).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ''),
    decodeUrl: url => {
        let str = url.replace(/-/g, '+').replace(/_/g, '/');
        while (str.length % 4) str += '=';
        return atob(str);
    }
};
