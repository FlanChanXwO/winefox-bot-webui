"use client";
import {useEffect, useState} from "react";
import {
    Button,
    Avatar,
    ScrollShadow, useDisclosure
} from "@nextui-org/react";
import {
    LayoutDashboard,
    Puzzle,
    FolderOpen,
    Power,
    Timer,
    Newspaper,
    Settings,
    Home as HomeIcon,
    Terminal,
    MessageCircle,
    ChevronDown,
    ChevronRight,
    RefreshCw,
    Clock,
    Bug,
    Menu,        // 新增：菜单图标
    X,           // 新增：关闭图标
    PanelLeftClose, // 新增：侧边栏折叠图标
    PanelLeftOpen, Globe   // 新增：侧边栏展开图标
} from "lucide-react";

// 引入拆分后的组件
import ConsoleView from "./components/ConsoleView";
import PluginListView from "./components/PluginListView";
import FileManagerView from "./components/FileManagerView";
import LogView from "./components/Log/HistoryLogViewer";
import FriendsAndGroups from "./components/FriendsAndGroups";
import AuthGuard from "./components/AuthGuard";
import DashboardHome from "./components/DashboardHome";
import ScheduleManager from "@/app/(home)/components/ScheduleManager";
import SubscriptionManager from "@/app/(home)/components/SubscriptionManager";
import ApiSettingsModal from "@/components/ApiSettingsModal";
import ConfigManager from "@/app/(home)/components/ConfigManager";
import {useBotStore} from "@/store/useBotStore"; // 引入刚才新建的组件

// --- 主页面组件 ---
export default function Home() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [logsOpen, setLogsOpen] = useState(false);

    // 控制侧边栏状态
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 移动端开关
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // PC端折叠

    const {isOpen: isSettingsOpen, onOpen: onSettingsOpen, onOpenChange: onSettingsOpenChange} = useDisclosure(); // API地址设置
    const {initBots, currentBotInfo} = useBotStore(state => state);


    useEffect(() => {
        // 组件挂载时，初始化机器人数据
        initBots();
        const timer = setInterval(initBots, 30000);
        return () => clearInterval(timer);
    }, []);


    // 新增：监听窗口大小变化，自动重置侧边栏状态
    // 监听屏幕尺寸变化
    useEffect(() => {
        const handleResize = () => {
            if (typeof window === "undefined") {
                return;
            }
            // 当屏幕变窄（进入移动端模式 < 768px）时
            if (window.innerWidth < 768) {
                setIsSidebarOpen(false)
                setIsSidebarCollapsed(false);
            } else {
                setIsSidebarCollapsed(true)
            }
        };
        window.addEventListener('resize', handleResize);
        // 记得清理监听器
        return () =>  window.removeEventListener('resize', handleResize);;
    }, []);


    // 菜单配置
    const menuItems = [
        {id: "dashboard", label: "仪表盘", icon: <LayoutDashboard size={20}/>},
        {
            id: "logs",
            label: "日志查看",
            icon: <Terminal size={20}/>,
            hasSubmenu: true,
            submenu: [
                {id: "logs-live", label: "实时日志", icon: <Terminal size={16}/>},
                {id: "logs-history", label: "历史日志", icon: <Clock size={16}/>},
                {id: "logs-error", label: "错误日志", icon: <Bug size={16}/>}
            ]
        },
        {id: "message", label: "好友与群组", icon: <MessageCircle size={20}/>},
        {id: "console", label: "酒狐控制台", icon: <Power size={20}/>},
        {id: "schedule", label: "调度任务", icon: <Timer size={20}/>},
        {id: "subscription", label: "订阅管理", icon: <Newspaper size={20}/>},
        {id: "plugins", label: "插件列表", icon: <Puzzle size={20}/>},
        {id: "store", label: "插件商店", icon: <HomeIcon size={20}/>, disabled: true},
        {id: "config", label: "配置管理", icon: <Settings size={20}/>},
        {id: "files", label: "文件管理", icon: <FolderOpen size={20}/>},
    ];

    // 渲染内容区域
    const renderContent = () => {
        if (activeTab.startsWith("logs-")) {
            const subType = activeTab.split("-")[1] as 'live' | 'history' | 'error';
            return <LogView subType={subType}/>;
        }

        switch (activeTab) {
            case "dashboard":
                return <DashboardHome/>; // 使用新组件
            case "console":
                return <ConsoleView/>;
            case "schedule":
                return <ScheduleManager/>
            case "subscription":
                return <SubscriptionManager/>
            case "plugins":
                return <PluginListView/>;
            case "config":
                return <ConfigManager/>
            case "files":
                return <FileManagerView/>;
            case "message":
                return <FriendsAndGroups/>;
            default:
                return <div className="flex items-center justify-center h-full text-gray-400">该页面无法显示</div>;
        }
    };

    // 侧边栏内容组件 (提取出来以便复用)
    // 侧边栏内容组件 (已移除底部设置按钮，改为在外部统一渲染)
    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div
                className={`mb-6 px-4 relative transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
                <div className="relative text-center mt-4">
                    <h1 className="text-3xl font-black text-pink-300 transform -rotate-6 select-none"
                        style={{textShadow: "2px 2px 0px #fff"}}>WineFox</h1>
                    <h1 className="text-4xl font-black text-pink-400 transform rotate-3 -mt-2 ml-4 select-none"
                        style={{textShadow: "2px 2px 0px #fff"}}>Bot</h1>
                </div>
            </div>

            {/* Logo Placeholder for Collapsed Mode */}
            {isSidebarCollapsed && (
                <div className="mb-6 mt-4 flex justify-center">
                    <div
                        className="w-10 h-10 bg-pink-400 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                        W
                    </div>
                </div>
            )}

            {/* 菜单列表 */}
            <ScrollShadow className="w-full flex-1">
                <nav className="w-full flex flex-col gap-2 pb-4">
                    {menuItems.map((item) => {
                        const isActive = activeTab === item.id || (item.hasSubmenu && activeTab.startsWith(item.id + "-"));
                        const isSubmenuOpen = item.id === "logs" && logsOpen;

                        return (
                            <div key={item.id} className="w-full px-2">
                                <div className="relative">
                                    {isActive && !item.hasSubmenu && !isSidebarCollapsed && (
                                        <div className="absolute left-0 top-1 bottom-1 w-1 bg-pink-400 rounded-r-md"/>
                                    )}

                                    <Button
                                        isDisabled={item.disabled}
                                        isIconOnly={isSidebarCollapsed}
                                        className={`w-full ${isSidebarCollapsed ? 'justify-center aspect-square px-0' : 'justify-start px-3'} h-12 text-md font-bold transition-all ${
                                            isActive && !item.hasSubmenu
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
                                                setActiveTab(item.id);
                                                typeof window !== "undefined" && window.innerWidth < 768 && setIsSidebarOpen(false);
                                            }
                                        }}
                                        title={isSidebarCollapsed ? item.label : undefined}
                                    >
                                        <div
                                            className={`flex items-center w-full gap-3 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                                            <span className="flex-shrink-0">{item.icon}</span>
                                            {!isSidebarCollapsed && (
                                                <>
                                                    <span
                                                        className="whitespace-nowrap flex-1 text-left">{item.label}</span>
                                                    {item.hasSubmenu && (
                                                        <span className="text-gray-400">
                                                            {isSubmenuOpen ? <ChevronDown size={14}/> :
                                                                <ChevronRight size={14}/>}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </Button>
                                </div>
                                {/* 子菜单渲染略 (保持原样即可，为了节省篇幅这里省略，请保留你原代码中的子菜单部分) */}
                                {item.hasSubmenu && isSubmenuOpen && !isSidebarCollapsed && (
                                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-pink-100 pl-2">
                                        {item.submenu?.map((sub) => {
                                            const isSubActive = activeTab === sub.id;
                                            return (
                                                <Button
                                                    key={sub.id}
                                                    size="sm"
                                                    className={`w-full justify-start h-9 text-sm font-medium transition-all ${
                                                        isSubActive
                                                            ? "text-pink-500 bg-pink-50/50"
                                                            : "bg-transparent text-gray-400 hover:text-pink-400"
                                                    }`}
                                                    variant="light"
                                                    onPress={() => {
                                                        setActiveTab(sub.id);
                                                        if (typeof window !== "undefined" && window.innerWidth < 768) setIsSidebarOpen(false);
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
        </>
    );


    return (
        <AuthGuard>
            <ApiSettingsModal isOpen={isSettingsOpen} onOpenChange={onSettingsOpenChange}/>

            <div className="flex w-full h-screen bg-[#fff0f5] overflow-hidden relative">

                {/* --- 移动端侧边栏遮罩 --- */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* --- 左侧侧边栏 (Responsive & Collapsible) --- */}
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
                    {/* 移动端右上角关闭按钮 (已修复嵌套问题) */}
                    <div className="md:hidden absolute top-4 right-4 z-50">
                        <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            onPress={() => setIsSidebarOpen(false)}
                            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100/50"
                        >
                            <X size={22}/>
                        </Button>
                    </div>

                    {/* PC端悬浮折叠按钮 */}
                    <div className="hidden md:flex absolute -right-3 top-10 z-50">
                        <button
                            className="bg-white rounded-full p-1 shadow-md text-pink-400 hover:text-pink-600 border border-pink-100 transition-transform hover:scale-110"
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        >
                            {isSidebarCollapsed ? <PanelLeftOpen size={14}/> : <PanelLeftClose size={14}/>}
                        </button>
                    </div>

                    {/* 菜单内容 */}
                    <SidebarContent/>

                    {/* --- 底部统一控制区 (设置 + 移动端折叠) --- */}
                    {/* pb-20 是为了避开左下角的红色调试球 */}
                    <div
                        className={`mt-auto w-full flex flex-col gap-2 px-2 pt-4 border-t border-white/50 md:pb-0 pb-20 ${isSidebarCollapsed ? 'items-center' : ''}`}>

                        {/* 设置/关于按钮 */}
                        <div
                            className={`flex items-center gap-3 px-3 py-2 cursor-pointer text-gray-400 hover:text-pink-400 transition-colors rounded-lg hover:bg-white/30 ${isSidebarCollapsed ? 'justify-center w-10 h-10 px-0' : ''}`}>
                            <Settings size={20}/>
                            {!isSidebarCollapsed && <span className="font-bold">关于酒狐</span>}
                        </div>

                        {/* 移动端折叠按钮 (仅移动端显示) - 优化后的样式 */}
                        <div className="md:hidden w-full flex justify-center mt-2">
                            <Button
                                variant="light"
                                size="sm"
                                className={`
                                    group  /* 启用 group-hover 效果 */
                                    text-gray-500 hover:text-pink-500 /* 默认灰色，悬停/点击变粉 */
                                    bg-transparent hover:bg-white/40 /* 默认透明，悬停微白 */
                                    transition-all duration-300
                                    ${isSidebarCollapsed ? 'min-w-0 px-2 aspect-square' : 'w-full justify-start px-3'}
                                `}
                                onPress={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            >
                                {isSidebarCollapsed ? (
                                    <div className="w-full flex justify-center">
                                        <PanelLeftOpen size={20}
                                                       className="text-pink-400 group-hover:scale-110 transition-transform"/>
                                    </div>
                                ) : (
                                    <div className="flex items-center w-full gap-3">
                                        <PanelLeftClose size={18} className="text-pink-400 group-hover:text-pink-500"/>
                                        <span className="font-bold text-sm">折叠菜单</span>
                                    </div>
                                )}
                            </Button>
                        </div>
                    </div>
                </aside>


                {/* --- 右侧内容 --- */}
                <main className="flex-1 overflow-hidden relative z-10 p-0 flex flex-col w-full">
                    {/* 顶部栏 */}
                    <header
                        className="flex justify-between items-center h-16 px-4 md:px-8 flex-none bg-white/30 backdrop-blur-sm mx-2 md:mx-6 mt-2 md:mt-4 rounded-2xl shadow-sm">

                        <div className="flex items-center gap-2">
                            {/* 移动端汉堡菜单 */}
                            <Button
                                isIconOnly
                                variant="light"
                                className="md:hidden -ml-2 text-gray-600"
                                onPress={() => setIsSidebarOpen(true)}
                            >
                                <Menu size={24}/>
                            </Button>

                            <div className="hidden md:flex gap-2">
                                <span className="font-bold text-gray-500">控制台</span>
                                <span className="text-gray-300">/</span>
                                <span
                                    className="font-bold text-pink-500">{menuItems.find(i => i.id === activeTab.split('-')[0])?.label || '仪表盘'}</span>
                            </div>

                            {/* 移动端只显示当前标题 */}
                            <span
                                className="md:hidden font-bold text-pink-500 ml-1">{menuItems.find(i => i.id === activeTab.split('-')[0])?.label || '仪表盘'}</span>
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
                                <Globe size={20}/>
                            </Button>

                            <Button isIconOnly size="sm"
                                    className="bg-pink-100 text-pink-400 rounded-full hidden sm:flex">
                                <RefreshCw size={14}/>
                            </Button>
                            <span className="text-sm font-bold text-gray-600 hidden sm:block">切换账号</span>
                            <Avatar src={currentBotInfo?.avatarUrl}
                                    classNames={{img: "opacity-100"}} imgProps={{referrerPolicy: "no-referrer"}}
                                    size="sm" className="border border-pink-200"/>
                            <Button size="sm" variant="light"
                                    className="text-gray-600 font-bold bg-white/50 min-w-0 px-2 md:px-3">
                                <span className="hidden sm:inline">{currentBotInfo?.nickname}</span> <span
                                className="text-xs">▼</span>
                            </Button>
                        </div>
                    </header>

                    {/* 主视图渲染容器 */}
                    <div className="flex-1 overflow-hidden pt-4 pb-2 px-2 md:px-6">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
