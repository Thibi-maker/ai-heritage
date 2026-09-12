(function () {
    const localHosts = ['localhost', '127.0.0.1', '[::1]'];
    const backendHost = window.location.hostname === '127.0.0.1' ? '127.0.0.1' : 'localhost';
    const backendOrigin = 'http://' + backendHost + ':3000';
    const isLocalDevelopment = window.location.protocol === 'file:' ||
        localHosts.includes(window.location.hostname);

    window.apiUrl = function (path) {
        if (window.location.protocol === 'http:' && isLocalDevelopment && window.location.port !== '3000') {
            return backendOrigin + path;
        }
        return path;
    };

    window.getAiHeritageSession = function () {
        for (const storage of [window.localStorage, window.sessionStorage]) {
            try {
                const raw = storage.getItem('aiHeritageSession');
                if (!raw) continue;

                const session = JSON.parse(raw);
                if (session && session.token && session.user) return session;
                storage.removeItem('aiHeritageSession');
            } catch (error) {
                storage.removeItem('aiHeritageSession');
            }
        }
        return null;
    };
})();
