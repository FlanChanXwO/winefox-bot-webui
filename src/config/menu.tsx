import React from "react";
import {
    Bug,
    Clock,
    FolderOpen,
    Home as HomeIcon,
    LayoutDashboard,
    MessageCircle,
    Newspaper,
    Power,
    Puzzle,
    Terminal,
    Timer,
} from "lucide-react";

export interface MenuItem {
    id: string;
    href: string;
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    hidden?: boolean;
    hasSubmenu?: boolean;
    submenu?: MenuItem[];
}

export const menuItems: MenuItem[] = [
    { id: "dashboard", href: "/dashboard", label: "仪表盘", icon: <LayoutDashboard size={20} /> },
    {
        id: "logs",
        label: "日志查看",
        href: "/logs",
        icon: <Terminal size={20} />,
        hasSubmenu: true,
        submenu: [
            { id: "logs-live", href: "/logs/live", label: "实时日志", icon: <Terminal size={16} /> },
            { id: "logs-history", href: "/logs/history", label: "历史日志", icon: <Clock size={16} /> }
        ]
    },
    { id: "message", href: "/message", label: "好友与群组", icon: <MessageCircle size={20} />, disabled: true },
    { id: "console", href: "/console", label: "酒狐控制台", icon: <Power size={20} /> },
    { id: "schedule", href: "/schedule", label: "调度任务", icon: <Timer size={20} /> },
    { id: "subscription", href: "/subscription", label: "订阅管理", icon: <Newspaper size={20} />, disabled: true },
    { id: "plugins", href: "/plugin", label: "插件列表", icon: <Puzzle size={20} /> },
    { id: "store", href: "/shop", label: "插件商店", icon: <HomeIcon size={20} />, disabled: true },
    { id: "files", href: "/file", label: "文件管理", icon: <FolderOpen size={20} /> },
    { id: "about", href: "/about", label: "关于酒狐", hidden: true }
];
