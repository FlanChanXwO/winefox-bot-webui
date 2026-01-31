"use client";

import React, {useEffect, useState} from "react";
import {motion} from "framer-motion";

interface Particle {
    id: number;
    x: string;
    y: string;
    size: number;
    duration: number;
    delay: number;
}

export default function PageLoading() {
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        // 客户端生成粒子，避免 SSR 水合不匹配
        const newParticles = Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            size: Math.random() * 20 + 10,
            duration: Math.random() * 10 + 10,
            delay: Math.random() * 5
        }));
        setParticles(newParticles);
    }, []);

    return (
        <motion.div
            className="fixed inset-0 top-0 left-0 w-screen h-screen z-[9999] bg-[#fff0f5] flex flex-col items-center justify-center overflow-hidden m-0 p-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
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
                        // 粒子保持循环动画
                        animate={{
                            y: [0, -100, 0],
                            x: [0, Math.random() * 50 - 25, 0],
                            opacity: [0.2, 0.5, 0.2],
                        }}
                        transition={{
                            duration: p.duration,
                            repeat: Infinity,
                            delay: p.delay,
                            ease: "easeInOut",
                        }}
                    />
                ))}

                {/* 背景光晕入场动画 */}
                <motion.div
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-30"
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{
                        scale: { duration: 0.5 }, // 入场快
                        default: { duration: 10, repeat: Infinity } // 循环慢
                    }}
                />
                <motion.div
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-30"
                    initial={{ scale: 0 }}
                    animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
                    transition={{
                        scale: { duration: 0.5, delay: 0.1 },
                        default: { duration: 12, repeat: Infinity }
                    }}
                />
            </div>

            {/* === 2. 核心 Loading 内容 === */}
            <div className="relative z-10 flex flex-col items-center">
                {/* 主体图标 */}
                <div className="w-32 h-32 flex items-center justify-center mb-8">
                    <motion.div
                        className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 shadow-lg shadow-pink-500/30"
                        // ✅ 修复动画无感问题：添加 scale 入场动画
                        // 初始是从 0 弹出来，然后开始循环
                        initial={{ scale: 0, rotate: -180, borderRadius: "50%" }}
                        animate={{
                            scale: [1, 0.8, 1.2, 0.9, 1],
                            rotate: 360, // 这里只写终点，Framer 会自动接续
                            borderRadius: ["20%", "50%", "30%", "50%", "20%"],
                        }}
                        transition={{
                            // 分离配置：入场动画执行一次，之后的动画循环执行
                            scale: {
                                duration: 3,
                                ease: "easeInOut",
                                repeat: Infinity,
                                times: [0, 0.2, 0.5, 0.8, 1]
                            },
                            rotate: {
                                duration: 3,
                                ease: "linear",
                                repeat: Infinity
                            },
                            borderRadius: {
                                duration: 3,
                                ease: "easeInOut",
                                repeat: Infinity
                            },
                            // 这里的 initial 动画会由 layout 自动处理，或者我们可以显式覆盖
                        }}
                    />
                </div>

                {/* 进度条 */}
                <div className="w-64 h-3 bg-white/50 backdrop-blur-sm rounded-full overflow-hidden p-[2px]">
                    <motion.div
                        className="h-full bg-gradient-to-r from-orange-400 to-pink-500 rounded-full"
                        initial={{ width: "0%", x: "0%" }}
                        animate={{
                            x: ["0%", "400%", "0%"],
                            width: ["20%", "25%", "20%"] // 初始宽度设为 20%
                        }}
                        transition={{
                            duration: 1.5, // 加快一点速度，让反馈更明显
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                </div>

                <motion.p
                    className="mt-4 text-pink-600/80 font-medium tracking-wide text-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: [0.5, 1, 0.5], y: 0 }}
                    transition={{
                        y: { duration: 0.5 },
                        opacity: { duration: 2, repeat: Infinity }
                    }}
                >
                    Loading...
                </motion.p>
            </div>
        </motion.div>
    );
}
