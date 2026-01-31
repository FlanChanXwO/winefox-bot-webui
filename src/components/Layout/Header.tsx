"use client";
import React from "react";
import {usePathname} from "next/navigation";
import {Button} from "@nextui-org/react";
import {Globe, Menu, RefreshCw} from "lucide-react";
import {useBotStore} from "@/store/useBotStore";
import BotSwitcher from "./BotSwitcher";
import {menuItems} from "@/config/menu";

interface HeaderProps {
    setIsSidebarOpen: (v: boolean) => void;
    onSettingsOpen: () => void;
}

export default function Header({ setIsSidebarOpen, onSettingsOpen }: HeaderProps) {
    const pathname = usePathname();
    const initBots = useBotStore(state => state.initBots);

    // 根据路径查找当前页面的 Label
    const currentLabel = menuItems.find(i =>
        i.href === "/" ? pathname === "/" : pathname.startsWith(i.href)
    )?.label || '仪表盘';

    return (
        <header className="flex justify-between items-center h-16 px-4 md:px-8 flex-none bg-white/30 backdrop-blur-sm mx-2 md:mx-6 mt-2 md:mt-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2">
                {/* 移动端汉堡菜单 */}
                <Button
                    isIconOnly
                    variant="light"
                    className="md:hidden -ml-2 text-gray-600"
                    onPress={() => setIsSidebarOpen(true)}
                >
                    <Menu size={24} />
                </Button>

                <div className="hidden md:flex gap-2">
                    <span className="font-bold text-gray-500">控制台</span>
                    <span className="text-gray-300">/</span>
                    <span className="font-bold text-pink-500">{currentLabel}</span>
                </div>

                {/* 移动端只显示当前标题 */}
                <span className="md:hidden font-bold text-pink-500 ml-1">{currentLabel}</span>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
                <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    className="text-pink-400 hover:bg-pink-50"
                    onPress={onSettingsOpen}
                    title="API 地址设置"
                >
                    <Globe size={20} />
                </Button>

                <Button
                    isIconOnly
                    size="sm"
                    className="bg-pink-100 text-pink-400 rounded-full hidden sm:flex"
                    onPress={() => initBots()}
                >
                    <RefreshCw size={14} />
                </Button>

                <BotSwitcher />
            </div>
        </header>
    );
}
