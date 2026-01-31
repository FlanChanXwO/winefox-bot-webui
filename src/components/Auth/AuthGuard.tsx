"use client";

import {useEffect, useRef, useState} from 'react';
import {usePathname, useRouter} from 'next/navigation';
import {jwtDecode} from "jwt-decode";
import {TOKEN_KEY} from "@/utils/request";
import {useLogStore} from "@/store/useLogStore";
import PageLoading from "@/components/Common/PageLoading";

// JWT Payload 接口定义
interface JwtPayload {
    exp: number; // 过期时间戳 (秒)
    [key: string]: any;
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const disconnectWebSocket = useLogStore((state) => state.disconnectWebSocket);


    // 辅助函数：标准化路径，移除尾部斜杠
    // 例如: "/login/" -> "/login"
    const normalizePath = (path: string) => path.replace(/\/+$/, "");

    const validateToken = () => {
        if (typeof window === 'undefined') return false;
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) return false;
        try {
            const decoded = jwtDecode<JwtPayload>(token);
            const currentTime = Date.now() / 1000;
            if (decoded.exp < currentTime) {
                console.warn("Token expired locally.");
                return false;
            }
            return true;
        } catch (error) {
            console.error("Token decode failed:", error);
            return false;
        }
    };

    const handleLogout = () => {
        disconnectWebSocket();
        localStorage.removeItem(TOKEN_KEY);
        setAuthorized(false);
        const currentPath = normalizePath(window.location.pathname); // 使用 window.location 获取最新状态
        if (currentPath !== '/login') {
            router.replace('/login');
        }
    };

    useEffect(() => {
        // 登录页不需要 Token 也能访问
        if (normalizePath(pathname) === '/login') {
            setAuthorized(true);
            return; // 登录页不需要启动定时检查
        }

        // 2. 非登录页，执行 Token 检查
        const isInitiallyValid = validateToken();
        if (!isInitiallyValid) {
            handleLogout();
        } else {
            setAuthorized(true);
        }

        // 3. 启动定时检查 (仅在非登录页)
        intervalRef.current = setInterval(() => {
            const isValid = validateToken();
            if (!isValid) {
                console.warn("Auto-check: Token expired, redirecting...");
                clearInterval(intervalRef.current!);
                handleLogout();
            }
        }, 3000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [router, pathname]);

    if (!authorized && normalizePath(pathname) !== '/login') {
        return <PageLoading />;
    }

    return <>{children}</>;
}
