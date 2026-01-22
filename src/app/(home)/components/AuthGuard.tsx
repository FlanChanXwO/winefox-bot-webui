"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
// 移除原有的 CircularProgress 引用，不再需要
import { jwtDecode } from "jwt-decode";
import { TOKEN_KEY } from "@/utils/request";
import { useLogStore } from "@/store/useLogStore";
import { motion } from "framer-motion";

// JWT Payload 接口定义
interface JwtPayload {
    exp: number; // 过期时间戳 (秒)
    [key: string]: any;
}

// 定义粒子类型，解决 hydration 问题
interface Particle {
    id: number;
    x: string;
    y: string;
    size: number;
    duration: number;
    delay: number;
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    // 用于存储随机粒子数据，确保服务端和客户端渲染一致
    const [particles, setParticles] = useState<Particle[]>([]);

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
        // 生成随机背景粒子 (仅在客户端执行)
        const newParticles = Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            size: Math.random() * 20 + 10, // 10px - 30px
            duration: Math.random() * 10 + 10, // 10s - 20s
            delay: Math.random() * 5
        }));
        setParticles(newParticles);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, pathname]);

    // 如果未授权且不在登录页，显示 Loading
    if (!authorized) {
        return (
            <div className="h-screen w-full relative overflow-hidden bg-[#fff0f5] flex flex-col items-center justify-center">

                {/* === 1. 动态粒子背景层 === */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    {particles.map((p) => (
                        <motion.div
                            key={p.id}
                            className="absolute bg-white rounded-full opacity-40 blur-sm"
                            style={{
                                left: p.x,
                                top: p.y,
                                width: p.size,
                                height: p.size,
                            }}
                            animate={{
                                y: [0, -100, 0], // 上下漂浮
                                x: [0, Math.random() * 50 - 25, 0], // 左右轻微摆动
                                opacity: [0.2, 0.5, 0.2], // 忽隐忽现
                            }}
                            transition={{
                                duration: p.duration,
                                repeat: Infinity,
                                delay: p.delay,
                                ease: "easeInOut",
                            }}
                        />
                    ))}
                    {/* 额外加两个大的光晕增加氛围 */}
                    <motion.div
                        className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-30"
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                        transition={{ duration: 10, repeat: Infinity }}
                    />
                    <motion.div
                        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-30"
                        animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
                        transition={{ duration: 12, repeat: Infinity }}
                    />
                </div>

                {/* === 2. 核心 Loading 内容 === */}
                <div className="relative z-10 flex flex-col items-center">

                    {/* 变形的主体 (无外圈) */}
                    <div className="w-32 h-32 flex items-center justify-center mb-8">
                        <motion.div
                            className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 shadow-lg shadow-pink-500/30"
                            animate={{
                                scale: [1, 0.8, 1.2, 0.9, 1], // 更有弹性的缩放
                                rotate: [0, 180, 360],
                                borderRadius: ["20%", "50%", "30%", "50%", "20%"], // 方圆变换
                            }}
                            transition={{
                                duration: 3,
                                ease: "easeInOut",
                                repeat: Infinity,
                                times: [0, 0.2, 0.5, 0.8, 1]
                            }}
                        />
                    </div>

                    {/* 新版进度条：Spring 弹力球风格 */}
                    <div className="w-64 h-3 bg-white/50 backdrop-blur-sm rounded-full overflow-hidden p-[2px]">
                        <motion.div
                            className="h-full bg-gradient-to-r from-orange-400 to-pink-500 rounded-full"
                            // 关键修改：使用 layout 布局动画 + spring 物理效果
                            initial={{ width: "20%", x: "0%" }}
                            animate={{
                                x: ["0%", "400%", "0%"], // 这里的 400% 是基于自身宽度的倍数 (20% * 5 = 100%)
                                width: ["20%", "25%", "20%"] // 移动时稍微拉长，更有速度感
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut", // 使用缓入缓出模拟物理惯性
                            }}
                        />
                    </div>

                    <motion.p
                        className="mt-4 text-pink-600/80 font-medium tracking-wide text-sm"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        Loading...
                    </motion.p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
