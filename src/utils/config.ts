const KEYS = {
    HOST: 'winefox_api_host',
    PORT: 'winefox_api_port'
};

export const getApiConfig = () => {
    // Next.js 服务端渲染时没有 window，返回空即可，反正 SSR 不发 API 请求
    if (typeof window === 'undefined') {
        return { host: '', port: '', baseUrl: '' };
    }

    // 1. 优先尝试从 LocalStorage 读取 (如果你确实想让用户能手动改)
    let host = localStorage.getItem(KEYS.HOST);
    let port = localStorage.getItem(KEYS.PORT);

    // 2. 如果 LocalStorage 没存 (默认情况)，或者存的是旧的 localhost
    //    就自动使用当前浏览器的地址
    if (!host) {
        // window.location.protocol 包含 'https:'
        // window.location.hostname 是 'www.winefox.icu'
        host = `${window.location.protocol}//${window.location.hostname}`;
    }

    if (!port) {
        // window.location.port 是 '5000'
        // 如果是 80 或 443，port 可能是空字符串，处理一下
        port = window.location.port || (window.location.protocol === 'https:' ? '443' : '80');
    }

    // 自动处理 host 结尾可能有 '/' 的情况
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
