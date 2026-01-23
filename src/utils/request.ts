import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getApiConfig } from './config';

// 定义通用的后端返回结构
export interface Result<T> {
    success: boolean;
    message: string;
    data: T | null;
    timestamp: number;
}

export const TOKEN_KEY = 'auth_token'; // 定义存储key常量

const service = axios.create({
    timeout: 50000,
});

// --- 请求拦截器 ---
service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const { baseUrl } = getApiConfig();
        config.baseURL = baseUrl;

        // 需求：仅当 uri 以 "/api" 开头且本地 token 不为空时携带
        // 注意：baseURL 拼接后 config.url 可能是相对路径也可能是绝对路径，
        // 这里假设你的请求写的是 '/api/xxx' 或者 baseURL 包含了 '/api'
        // 为了稳健，我们检查最终请求的 url 或者 config.url
        const token = localStorage.getItem(TOKEN_KEY);

        // 简单判断：只要 url 包含 /api 或者是去往后端的请求，通常都携带 token
        // 如果严格按照你的需求 "uri以/api开头"：
        if (token && config.url?.startsWith('/api')) {
            config.headers.set('Authorization', token);
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// --- 响应拦截器 ---
service.interceptors.response.use(
    (response: AxiosResponse) => {
        // Axios 获取的 headers key 默认是小写的
        const authHeader = response.headers['authorization'];

        if (authHeader) {
            localStorage.setItem(TOKEN_KEY, authHeader);
        }

        // 拦截器返回 data，剥离 axios 的外壳
        return response.data;
    },
    (error) => {
        console.error("API请求失败:", error);

        // 可选：处理 401 token 过期自动登出
        if (error.response && error.response.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            // 2. 强制跳转到登录页
            // 这是一个兜底策略，当 AuthGuard 还没反应过来，但后端已经拒绝服务时触发
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                // 使用 window.location.href 强刷页面跳转，确保状态清空
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

// 封装层
const request = {
    get: <T = any>(url: string, config?: any): Promise<Result<T>> => service.get(url, config),
    post: <T = any>(url: string, data?: any, config?: any): Promise<Result<T>> => service.post(url, data, config),
    put: <T = any>(url: string, data?: any, config?: any): Promise<Result<T>> => service.put(url, data, config),
    delete: <T = any>(url: string, config?: any): Promise<Result<T>> => service.delete(url, config),
};

export default request;
