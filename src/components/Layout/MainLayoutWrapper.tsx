"use client";

import React, {useEffect, useState} from "react";
import {useDisclosure} from "@nextui-org/react";
import ApiSettingsModal from "@/components/Common/ApiSettingsModal";
import {useBotStore} from "@/store/useBotStore";
import AuthGuard from "@/components/Auth/AuthGuard";
import Sidebar from "@/components/Layout/Sidebar";
import Header from "@/components/Layout/Header";
import {Toaster} from "sonner";
import {usePathname} from "next/navigation";
import {useLogStore} from "@/store/useLogStore";

export default function MainLayoutWrapper({children}: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";

    const {isOpen: isSettingsOpen, onOpen: onSettingsOpen, onOpenChange: onSettingsOpenChange} = useDisclosure();
    const {initBots} = useBotStore(state => state);
    const {connectWebSocket} = useLogStore();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [, setActiveTab] = useState("dashboard");

    // 初始化数据
    useEffect(() => {
        if (!isLoginPage) {
            initBots();
            connectWebSocket();
            const timer = setInterval(initBots, 30000);
            return () => clearInterval(timer);
        }
    }, [isLoginPage, initBots]);

    // 响应式监听
    useEffect(() => {
        const handleResize = () => {
            if (typeof window === "undefined") return;
            if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
                setIsSidebarCollapsed(false);
            } else {
                setIsSidebarCollapsed(true);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 登录页模式
    if (isLoginPage) {
        return (
            <>
                <main className="w-full h-screen bg-[#fff0f5] flex items-center justify-center">
                    {children}
                </main>
                <Toaster position="top-center" richColors/>
            </>
        );
    }

    // 正常应用模式
    return (
        <>
            <AuthGuard>
                <ApiSettingsModal isOpen={isSettingsOpen} onOpenChange={onSettingsOpenChange}/>

                <div className="flex w-full h-screen bg-[#fff0f5] overflow-hidden relative">
                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}

                    <Sidebar
                        isSidebarOpen={isSidebarOpen}
                        setIsSidebarOpen={setIsSidebarOpen}
                        isSidebarCollapsed={isSidebarCollapsed}
                        setIsSidebarCollapsed={setIsSidebarCollapsed}
                        setActiveTab={setActiveTab}
                    />

                    <main className="flex-1 overflow-hidden relative z-10 p-0 flex flex-col w-full">
                        <Header
                            setIsSidebarOpen={setIsSidebarOpen}
                            onSettingsOpen={onSettingsOpen}
                        />
                        <div className="flex-1 overflow-hidden pt-4 pb-2 px-2 md:px-6">
                            {children}
                        </div>
                    </main>
                </div>
            </AuthGuard>
            <Toaster position="top-center" richColors/>
        </>
    );
}
