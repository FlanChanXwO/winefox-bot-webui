"use client";
import React, {useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {Button, Image, ScrollShadow,} from "@nextui-org/react";
import {Bot, ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen, X} from "lucide-react";
import {menuItems} from "@/config/menu";
import NextLink from "next/link";

interface SidebarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (v: boolean) => void;
    isSidebarCollapsed: boolean;
    setIsSidebarCollapsed: (v: boolean) => void;
    setActiveTab: (v: string) => void; // 用于跳转到 about 等隐藏页面
}

export default function Sidebar({
                                    isSidebarOpen,
                                    setIsSidebarOpen,
                                    isSidebarCollapsed,
                                    setIsSidebarCollapsed,
                                    setActiveTab
                                }: SidebarProps) {
    const router = useRouter()
    const pathname = usePathname();
    const [logsOpen, setLogsOpen] = useState(false);

    // 计算当前激活的 Tab (用于子菜单判断)
    const activeTabId = menuItems.find(item =>
        item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
    )?.id || "dashboard";


    return (
        <aside
            className={`
                fixed md:relative z-[100] h-full
                bg-white/40 border-r border-white/50 backdrop-blur-md flex flex-col py-4
                transition-transform duration-300 ease-in-out
                ${isSidebarCollapsed ? 'w-[80px]' : 'w-[240px]'}
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
            `}
        >
            {/* 移动端右上角关闭按钮 */}
            <div className="md:hidden absolute top-4 right-4 z-50">
                <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    onPress={() => setIsSidebarOpen(false)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100/50"
                >
                    <X size={22} />
                </Button>
            </div>

            {/* PC端悬浮折叠按钮 */}
            <div className="hidden md:flex absolute -right-3 top-10 z-50">
                <button
                    className="bg-white rounded-full p-1 shadow-md text-pink-400 hover:text-pink-600 border border-pink-100 transition-transform hover:scale-110"
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                >
                    {isSidebarCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
                </button>
            </div>

            {/* Logo Area */}
            <div className={`mb-6 px-4 relative transition-all duration-300 flex items-center justify-center gap-2 ${isSidebarCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
                <div className="relative w-16 h-16 flex-shrink-0">
                    <Image src="/logo_2.png" alt="WineFox Bot Logo" className="object-contain -rotate-4" />
                </div>
                <div className="relative flex flex-col justify-center">
                    <h1 className="text-xl font-black text-pink-300 transform -rotate-6 select-none leading-none" style={{ textShadow: "1px 1px 0px #fff" }}>WineFox</h1>
                    <h1 className="text-2xl font-black text-pink-400 transform rotate-3 mt-1 ml-5 select-none leading-none" style={{ textShadow: "1px 1px 0px #fff" }}>Bot</h1>
                </div>
            </div>

            {/* Logo Placeholder for Collapsed Mode */}
            {isSidebarCollapsed && (
                <div className="mb-6 mt-4 flex justify-center">
                    <div className="w-10 h-10 bg-pink-400 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                        W
                    </div>
                </div>
            )}

            {/* 菜单列表 */}
            <ScrollShadow className="w-full flex-1">
                <nav className="w-full flex flex-col gap-2 pb-4">
                    {menuItems.map((item) => {
                        if (item.hidden) return null;

                        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                        const isSubmenuOpen = (item.id === "logs" && logsOpen) || (isActive && item.hasSubmenu);
                        const isLink = !item.hasSubmenu;

                        return (
                            <div key={item.id} className="w-full px-2">
                                <div className="relative">
                                    {isActive && !item.hasSubmenu && !isSidebarCollapsed && (
                                        <div className="absolute left-0 top-1 bottom-1 w-1 bg-pink-400 rounded-r-md" />
                                    )}

                                    <Button
                                        as={isLink ? NextLink  : "button"}
                                        href={isLink ? item.href : undefined}
                                        isDisabled={item.disabled}
                                        isIconOnly={isSidebarCollapsed}
                                        className={`w-full ${isSidebarCollapsed ? 'justify-center aspect-square px-0' : 'justify-start px-3'} h-12 text-md font-bold transition-all ${isActive && !item.hasSubmenu
                                            ? "bg-pink-500/10 text-pink-600"
                                            : item.disabled
                                                ? "bg-transparent text-gray-300 cursor-not-allowed"
                                                : "bg-transparent text-gray-500 hover:text-pink-400 hover:bg-white/30"
                                        }`}
                                        variant="light"
                                        onPress={() => {
                                            if (item.hasSubmenu) {
                                                if (isSidebarCollapsed) {
                                                    setIsSidebarCollapsed(false);
                                                    setLogsOpen(true);
                                                } else {
                                                    setLogsOpen(!logsOpen);
                                                }
                                            } else {
                                                if (window.innerWidth < 768) setIsSidebarOpen(false);
                                            }
                                        }}
                                        title={isSidebarCollapsed ? item.label : undefined}
                                    >
                                        <div className={`flex items-center w-full gap-3 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                                            <span className="flex-shrink-0">{item.icon}</span>
                                            {!isSidebarCollapsed && (
                                                <>
                                                    <span className="whitespace-nowrap flex-1 text-left">{item.label}</span>
                                                    {item.hasSubmenu && (
                                                        <span className="text-gray-400">
                                                            {isSubmenuOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </Button>
                                </div>
                                {/* 子菜单 */}
                                {item.hasSubmenu && isSubmenuOpen && !isSidebarCollapsed && (
                                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-pink-100 pl-2">
                                        {item.submenu?.map((sub) => {
                                            const isSubActive = activeTabId === sub.id || pathname === sub.href;
                                            return (
                                                <Button
                                                    as={NextLink}
                                                    key={sub.id}
                                                    size="sm"
                                                    className={`w-full justify-start h-9 text-sm font-medium transition-all ${isSubActive
                                                        ? "text-pink-500 bg-pink-50/50"
                                                        : "bg-transparent text-gray-400 hover:text-pink-400"
                                                    }`}
                                                    variant="light"
                                                    href={sub.href}
                                                    onPress={() => {
                                                        if (window.innerWidth < 768) setIsSidebarOpen(false);
                                                    }}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {sub.icon}
                                                        <span>{sub.label}</span>
                                                    </div>
                                                </Button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </nav>
            </ScrollShadow>

            {/* 底部功能区 */}
            <div className={`mt-auto w-full flex flex-col gap-2 px-2 pt-4 border-t border-white/50 md:pb-0 pb-20 ${isSidebarCollapsed ? 'items-center' : ''}`}>
                <div
                    onClick={() => router.push("/about")}
                    className={`flex items-center gap-3 px-3 py-2 cursor-pointer text-gray-400 hover:text-pink-400 transition-colors rounded-lg hover:bg-white/30 ${isSidebarCollapsed ? 'justify-center w-10 h-10 px-0' : ''}`}>
                    <Bot size={20} />
                    {!isSidebarCollapsed && <span className="font-bold">关于酒狐</span>}
                </div>

                {/* 移动端折叠按钮 */}
                <div className="md:hidden w-full flex justify-center mt-2">
                    <Button
                        variant="light"
                        size="sm"
                        className={`group text-gray-500 hover:text-pink-500 bg-transparent hover:bg-white/40 transition-all duration-300 ${isSidebarCollapsed ? 'min-w-0 px-2 aspect-square' : 'w-full justify-start px-3'}`}
                        onPress={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    >
                        {isSidebarCollapsed ? (
                            <div className="w-full flex justify-center">
                                <PanelLeftOpen size={20} className="text-pink-400 group-hover:scale-110 transition-transform" />
                            </div>
                        ) : (
                            <div className="flex items-center w-full gap-3">
                                <PanelLeftClose size={18} className="text-pink-400 group-hover:text-pink-500" />
                                <span className="font-bold text-sm">折叠菜单</span>
                            </div>
                        )}
                    </Button>
                </div>
            </div>
        </aside>
    );
}
