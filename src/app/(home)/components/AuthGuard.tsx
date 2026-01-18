"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { CircularProgress } from "@nextui-org/react";
import { jwtDecode } from "jwt-decode";
import { TOKEN_KEY } from "@/utils/request";
import { useLogStore } from "@/store/useLogStore";

// JWT Payload 接口定义
interface JwtPayload {
    exp: number; // 过期时间戳 (秒)
    [key: string]: any;
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname(); // 监控路径变化
    const [authorized, setAuthorized] = useState(false);

    // 使用 useRef 存储定时器，方便清除
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    // 从 Store 中获取断开连接的方法
    const disconnectWebSocket = useLogStore((state) => state.disconnectWebSocket);

    // 核心验证逻辑：检查 Token 是否存在且有效
    const validateToken = () => {
        if (typeof window === 'undefined') return false;

        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) return false;

        try {
            // 解析 Token
            const decoded = jwtDecode<JwtPayload>(token);
            const currentTime = Date.now() / 1000;

            // 如果当前时间 > 过期时间，说明已过期
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

    // 统一的登出处理
    const handleLogout = () => {
        disconnectWebSocket();
        localStorage.removeItem(TOKEN_KEY);
        setAuthorized(false);
        // 如果已经在登录页，就不用跳了，防止循环
        if (pathname !== '/login') {
            router.replace('/login');
        }
    };

    useEffect(() => {
        // 1. 初次加载时的检查
        const isInitiallyValid = validateToken();

        if (!isInitiallyValid) {
            handleLogout();
        } else {
            setAuthorized(true);
        }

        // 2. 设置定时器：每3秒检查一次
        intervalRef.current = setInterval(() => {
            const isValid = validateToken();
            if (!isValid) {
                // 如果在定时检查中发现失效
                console.warn("Auto-check: Token expired, redirecting...");
                clearInterval(intervalRef.current!);
                handleLogout();
            }
        }, 3000); // 3000毫秒 = 3秒

        // 3. 清理函数：组件卸载时清除定时器
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, pathname]);

    // 如果未授权且不在登录页，显示 Loading
    // 注意：这里要避免在验证失败的一瞬间显示页面内容
    if (!authorized) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[#fff0f5]">
                <CircularProgress color="danger" label="正在验证身份..." />
            </div>
        );
    }

    return <>{children}</>;
}
