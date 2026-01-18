const KEYS = {
    HOST: 'winefox_api_host',
    PORT: 'winefox_api_port'
};

const DEFAULTS = {
    HOST: 'http://localhost',
    PORT: '8080'
};

export const getApiConfig = () => {
    // Next.js 服务端渲染时没有 window，需做判断
    if (typeof window === 'undefined') {
        return { host: DEFAULTS.HOST, port: DEFAULTS.PORT, baseUrl: `${DEFAULTS.HOST}:${DEFAULTS.PORT}` };
    }

    const host = localStorage.getItem(KEYS.HOST) || DEFAULTS.HOST;
    const port = localStorage.getItem(KEYS.PORT) || DEFAULTS.PORT;

    // 自动处理 host 结尾可能有 '/' 的情况，避免出现 //
    const cleanHost = host.replace(/\/$/, '');

    return {
        host: cleanHost,
        port,
        baseUrl: `${cleanHost}:${port}`
    };
};

export const saveApiConfig = (host: string, port: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(KEYS.HOST, host);
        localStorage.setItem(KEYS.PORT, port);
    }
};
