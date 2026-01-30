"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { jwtDecode } from "jwt-decode";
import { TOKEN_KEY } from "@/utils/request";
import { useLogStore } from "@/store/useLogStore";
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
        if (pathname !== '/login') {
            router.replace('/login');
        }
    };

    useEffect(() => {
        const isInitiallyValid = validateToken();
        if (!isInitiallyValid) {
            handleLogout();
        } else {
            setAuthorized(true);
        }

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

    if (!authorized) {
        return <PageLoading />;
    }

    return <>{children}</>;
}
