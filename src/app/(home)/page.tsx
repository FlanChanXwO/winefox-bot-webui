"use client";

import ReactECharts from "echarts-for-react";
import React, {useEffect, useRef, useState} from "react";
import {Avatar, Card, CardBody, Chip} from "@nextui-org/react";
import {User, Users, MessageSquare, Repeat, Server, Activity, Database} from "lucide-react";
import {useLogStore} from "@/store/useLogStore";
import {useSystemStatus} from "@/hooks/useSystemStatus";
import {useDashboardStore} from "@/hooks/useDashboardData";
import {useBotStore} from "@/store/useBotStore";
import {FriendAndGroupStatsResponse, getFriendAndGroupStats} from "@/api/friendAndGroup";
import {toast} from "sonner";
import PluginApi from "@/api/plugin"; // 引入 PluginApi
import { getActiveGroupStats } from "@/api/group";
import {RankingItem} from "@/api/stats";
import {formatLogTime} from "@/utils/time";
import {LogItem} from "@/components/Log/LogItem";

const getEventColor = (type: string) => {
    switch (type) {
        case '连接': return "success";
        case '断开': return "warning";
        case '错误': return "danger";
        default: return "default";
    }
};

const getEventLabel = (type: string) => {
    switch (type) {
        case 'CONNECT': return "连接";
        case 'DISCONNECT': return "断开";
        case 'RECONNECT': return "重连";
        case 'ERROR': return "错误";
        default: return type;
    }
}

// 定义时间范围选项
const TIME_RANGES = [
    { key: 'ALL', label: '全部' },
    { key: 'DAY', label: '日' },
    { key: 'WEEK', label: '周' },
    { key: 'MONTH', label: '月' },
    { key: 'YEAR', label: '年' },
];

export default function DashboardHome() {
    const {logs} = useLogStore();
    const logsContainerRef = useRef<HTMLDivElement>(null);
    // 使用 Hook 获取实时数据，自动轮询
    const {status} = useSystemStatus();
    const {
        configs,
        logs: dbLogs,
        logPage,
        isLoadingLogs,
        messageStats,
        invokeStats,
        fetchConfigs,
        fetchLogs,
        fetchInvokeStats,
        fetchMessageStats,
    } = useDashboardStore();
    const {currentBotInfo,availableBots} = useBotStore(state => state);
    const [pluginRange, setPluginRange] = useState('WEEK');
    const [hotPlugins, setHotPlugins] = useState<RankingItem[]>([]);
    const [groupRange, setGroupRange] = useState('WEEK');
    const [activeGroups, setActiveGroups] = useState<RankingItem[]>([]);
    const [friendAndGroupStats, setFriendAndGroupStats] = useState<FriendAndGroupStatsResponse>({groupCount: 0, friendCount: 0});


    // 初始化加载数据
    useEffect(() => {
        fetchConfigs();     // 获取配置
        fetchLogs(1);       // 获取第一页日志
        fetchMessageStats(); // 获取消息统计
        fetchFriendAndGroupStats(currentBotInfo?.botId); // 获取好友和群组统计数据
        fetchInvokeStats();
        // 初始加载图表数据
        fetchHotPluginsData('WEEK');
        fetchActiveGroupsData('WEEK');
    }, []);

    useEffect(() => {
        fetchLogs(1)
        fetchMessageStats();
        fetchFriendAndGroupStats(currentBotInfo?.botId);
    }, [currentBotInfo?.botId]);

// 自动滚动到底部
    useEffect(() => {
        if (logsContainerRef.current) {
            logsContainerRef.current.scrollTo({
                top: logsContainerRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [logs]);


    // --- 监听 Range 变化 ---
    useEffect(() => {
        fetchHotPluginsData(pluginRange);
    }, [pluginRange]);

    useEffect(() => {
        fetchActiveGroupsData(groupRange);
    }, [groupRange]);

    const fetchFriendAndGroupStats = async (botId?: number) => {
        if (!botId) return;
        try {
            const res = await getFriendAndGroupStats(botId);
            if (!res.success) {
                toast.error(res.message);
                return;
            }
            setFriendAndGroupStats(res.data || {groupCount: 0, friendCount: 0});
        } catch (error) {
            console.error("获取好友和群组统计数据失败:", error);
            toast.error("获取好友和群组统计数据失败");
        }
    }

    const fetchHotPluginsData = async (range: string) => {
        try {
            const res = await PluginApi.getHotPluginRanking(range);
            if (res.data) {
                setHotPlugins(res.data);
            } else {
                setHotPlugins([]);
            }
        } catch (e) { console.error(e); }
    };

    const fetchActiveGroupsData = async (range: string) => {
        try {
            const res = await getActiveGroupStats(range);
            if (res.data) {
                setActiveGroups(res.data);
            } else {
                setActiveGroups([]);
            }
        } catch (e) { console.error(e); }
    };

    const getRankingOption = (title: string, data: RankingItem[], colorStart: string, colorEnd: string) => {
        return {
            title: {
                text: title,
                textStyle: { color: '#ec4899', fontSize: 18, fontWeight: 'bold' }, // 调整标题颜色
                top: 0,
                left: 0
            },
            // 留出空间给右上角的按钮
            grid: { top: '25%', bottom: '15%', left: '12%', right: '5%' },
            tooltip: { trigger: 'axis' },
            xAxis: {
                type: 'category',
                data: data.map(item => item.name),
                axisLine: { lineStyle: { color: '#e5e7eb' } },
                axisLabel: {
                    color: '#4b5563',
                    fontSize: 10,
                    interval: 0,
                    rotate: 20 // 稍微倾斜
                },
                axisTick: { show: false }
            },
            yAxis: {
                type: 'value',
                splitLine: { lineStyle: { type: 'dashed', color: '#f3f4f6' } },
                axisLabel: { color: '#6b7280' }
            },
            series: [{
                data: data.map(item => item.value),
                type: 'bar',
                barWidth: '40%',
                label: {
                    show: true,
                    position: 'top',
                    color: '#374151',
                    fontWeight: 'bold'
                },
                itemStyle: {
                    color: {
                        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: colorStart },
                            { offset: 1, color: colorEnd }
                        ]
                    },
                    borderRadius: [6, 6, 0, 0]
                }
            }]
        };
    };

    // --- 筛选按钮渲染组件 ---
    const renderFilter = (currentKey: string, setKey: (k: string) => void) => (
        <div className="flex gap-1 absolute top-4 right-4 z-10">
            {TIME_RANGES.map(t => (
                <button
                    key={t.key}
                    onClick={() => setKey(t.key)}
                    className={`
                        text-[10px] px-2 py-0.5 rounded-full transition-all
                        ${currentKey === t.key
                        ? 'bg-pink-400 text-white shadow-md shadow-pink-200 font-bold'
                        : 'bg-pink-50 text-pink-300 hover:bg-pink-100'}
                    `}
                >
                    {t.label}
                </button>
            ))}
        </div>
    );

    return (
        <div className="h-full w-full overflow-y-auto p-2">
            {/* 栅格布局：移动端1列，PC端3列 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-10">

                {/* --- 左侧栏 (占3份) --- */}
                <div className="lg:col-span-3 space-y-6">
                    {/* 在线酒狐卡片 */}
                    <Card className="shadow-sm border-none bg-white/80 backdrop-blur-sm">
                        <CardBody className="p-6 flex flex-col items-center gap-4">
                            <div className="w-full flex items-center gap-2 mb-2">
                                <div className="w-1 h-6 bg-pink-400 rounded-full"></div>
                                <h3 className="text-xl font-bold text-pink-500">在线酒狐 ({availableBots.length})</h3>
                            </div>

                            <div
                                className="flex items-center gap-4 w-full bg-pink-50/50 p-4 rounded-2xl border border-pink-100">
                                <Avatar src={currentBotInfo?.avatarUrl}
                                        classNames={{img: "opacity-100"}}
                                        className="w-20 h-20 text-large border-2 border-pink-200" isBordered
                                        imgProps={{referrerPolicy: "no-referrer"}}/>
                                <div className="flex flex-col">
                                    <span className="text-xl font-black text-gray-700">| {currentBotInfo?.nickname || "我是谁？"}</span>
                                    <span className="text-xs text-pink-400 font-bold mt-1">ID: {currentBotInfo?.botId || "114514"}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 w-full">
                                <div
                                    className="bg-pink-50 text-pink-500 py-2 rounded-xl flex justify-center items-center gap-2 font-bold text-sm">
                                    <User size={16} fill="currentColor"/> 好友 {friendAndGroupStats.friendCount}
                                </div>
                                <div
                                    className="bg-emerald-50 text-emerald-500 py-2 rounded-xl flex justify-center items-center gap-2 font-bold text-sm">
                                    <Users size={16} fill="currentColor"/> 群组 {friendAndGroupStats.groupCount}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 w-full mt-2">
                                <div className="flex flex-row justify-center items-center bg-gray-50 p-3 rounded-xl">
                                    <Repeat className="text-pink-300 mb-0.5" size={20}/>
                                    <span className="text-xs text-gray-400 ml-1">今日调用</span>
                                    <span className="text-pink-400 font-bold ml-1 mb-0.5">{invokeStats.day}</span>
                                </div>
                                <div className="flex flex-row justify-center items-center bg-gray-50 p-3 rounded-xl">
                                    <MessageSquare className="text-pink-300 mb-0.5" size={20}/>
                                    <span className="text-xs text-gray-400 ml-1">今日消息</span>
                                    <span className="text-pink-400 font-bold ml-1 mb-0.5">{messageStats.today}</span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* 连接日志 */}
                    <Card className="shadow-sm border-none bg-white/80 backdrop-blur-sm">
                        <CardBody className="p-5">
                            <h3 className="text-lg font-bold text-pink-400 mb-4 text-center border-b-2 border-pink-50 pb-2 border-dashed">连接日志</h3>
                            <div className="space-y-3">
                                <div className="grid grid-cols-3 text-xs font-bold text-gray-500 text-center mb-2">
                                    <span>日期</span>
                                    <span>账号</span>
                                    <span>类型</span>
                                </div>
                                {/* 数据列表 */}
                                <div className="flex-1 space-y-2">
                                    {dbLogs.length === 0 && !isLoadingLogs ? (
                                        <div className="text-center text-gray-300 text-xs py-8">暂无数据...</div>
                                    ) : (
                                        dbLogs.map((log) => {
                                            const { dateStr, timeStr } = formatLogTime(log.createdAt);
                                            return (
                                                <div key={log.id} className="grid grid-cols-3 text-xs text-gray-400 text-center items-center bg-pink-50/30 py-2 rounded-lg hover:bg-pink-50 transition-colors">
                                                    <span className="text-pink-300 leading-tight">
                                                        {dateStr}<br/>
                                                        <span className="text-[10px] opacity-70 font-mono">{timeStr}</span>
                                                    </span>
                                                    <span className="text-pink-400 break-all px-1 font-mono">
                                                        {log.botId}
                                                    </span>
                                                    <span>
                                                        <Chip size="sm" color={getEventColor(log.eventType)} className="text-white h-5 text-[10px] shadow-sm">
                                                            {getEventLabel(log.eventType)}
                                                        </Chip>
                                                    </span>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                                {/* 分页控制 */}
                                <div className="flex justify-center gap-2 mt-auto pt-2 select-none">
                                    <button
                                        disabled={logPage.current <= 1 || isLoadingLogs}
                                        onClick={() => fetchLogs(logPage.current - 1)}
                                        className="w-6 h-6 rounded flex items-center justify-center text-xs transition-colors bg-pink-50 text-pink-400 hover:bg-pink-100 disabled:opacity-50 disabled:cursor-not-allowed">
                                        &lt;
                                    </button>

                                    <div className="h-6 px-2 bg-pink-400 rounded flex items-center justify-center text-xs text-white font-bold shadow-md shadow-pink-200">
                                        {logPage.current} / {logPage.pages || 1}
                                    </div>

                                    <button
                                        disabled={logPage.current >= logPage.pages || isLoadingLogs}
                                        onClick={() => fetchLogs(logPage.current + 1)}
                                        className="w-6 h-6 rounded flex items-center justify-center text-xs transition-colors bg-pink-50 text-pink-400 hover:bg-pink-100 disabled:opacity-50 disabled:cursor-not-allowed">
                                        &gt;
                                    </button>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* --- 中间栏 (占5份) --- */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Welcome Banner */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm text-center space-y-2 border border-pink-50">
                        <h1 className="text-2xl font-black text-pink-400">(≥ ▽ ≤)/ Hello 欢迎来到酒狐的小房间!</h1>
                        <p className="text-gray-400 text-sm">这是一场传奇的冒险旅途... ☆⌒(*＾-゜)v</p>
                    </div>

                    {/* 系统状态 Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            {
                                icon: <Server size={20}/>,
                                label: "CPU",
                                val: status.cpuUsage,
                                color: "text-red-400"
                            },
                            {
                                icon: <Activity size={20}/>,
                                label: "MEMORY",
                                val: status.memoryUsage,
                                color: "text-purple-400"
                            },
                            {
                                icon: <Database size={20}/>,
                                label: "DISK",
                                val: status.diskUsage,
                                color: "text-orange-400"
                            },
                        ].map((item, idx) => (
                            <Card key={idx} className="shadow-sm border-none">
                                <CardBody className="flex flex-col items-center justify-center py-6 gap-2">
                                    <div className={`flex items-center gap-2 text-xs font-bold ${item.color}`}>
                                        {item.icon} {item.label}
                                    </div>
                                    <span className="text-2xl font-black text-gray-600">{item.val}</span>
                                </CardBody>
                            </Card>
                        ))}
                    </div>

                    {/* 统计数据 Grid */}
                    <div className="grid grid-cols-4 gap-3">
                        {[
                            {
                                label: "消息总数",
                                val: messageStats.total.toString(),
                                color: "text-pink-400"
                            },
                            {
                                label: "今日消息",
                                val: messageStats.today.toString(),
                                color: "text-gray-400"
                            },
                            {
                                label: "调用总数",
                                val: invokeStats.total.toString(),
                                color: "text-pink-400"
                            },
                            {
                                label: "今日调用",
                                val: invokeStats.day.toString(),
                                color: "text-gray-400"
                            },
                        ].map((item, idx) => (
                            <Card key={idx} className="shadow-sm border-none bg-white">
                                <CardBody className="flex flex-col items-center justify-center py-4">
                                    <span className="text-xs text-gray-400 font-medium mb-1">{item.label}</span>
                                    <span className={`text-xl font-black ${item.color}`}>{item.val}</span>
                                </CardBody>
                            </Card>
                        ))}
                    </div>

                    {/* 查看更多 Bar */}
                    {/*<div*/}
                    {/*    className="w-full bg-white py-3 rounded-xl flex justify-center items-center text-pink-400 text-sm font-bold cursor-pointer hover:bg-pink-50 transition-colors shadow-sm">*/}
                    {/*    (๑•̀ㅂ•́)و✧ 查看更多... &gt;*/}
                    {/*</div>*/}

                    {/* 后台日志 */}
                    <Card className="shadow-sm border-none h-[400px] rounded-xl">
                        <CardBody className="p-5 font-mono text-xs bg-white h-full flex flex-col">
                            <div className="flex justify-between items-center mb-4 flex-none">
                                <h3 className="text-lg font-bold text-pink-500 flex items-center gap-2">
                                    (●'◡'●) 后台日志
                                </h3>
                                <span
                                    className="text-gray-300 text-[10px] hidden sm:block">虽然不知道为什么，但是视力+1</span>
                            </div>

                            {/* 日志容器 */}
                            <div ref={logsContainerRef}  className="flex-1 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar scroll-smooth">
                                {/* 注入自定义滚动条样式，只在这个组件内生效 */}
                                <style jsx>{`
                                    .custom-scrollbar::-webkit-scrollbar {
                                        width: 4px; /* 极细滚动条 */
                                    }

                                    .custom-scrollbar::-webkit-scrollbar-track {
                                        background: transparent; /* 轨道透明，看不见 */
                                    }

                                    .custom-scrollbar::-webkit-scrollbar-thumb {
                                        background-color: transparent; /* 默认透明 */
                                        border-radius: 20px;
                                    }

                                    /* 只有当鼠标悬停在卡片上时，滚动条才变色可见 */
                                    .group:hover .custom-scrollbar::-webkit-scrollbar-thumb {
                                        background-color: #fbcfe8; /* 浅粉色 */
                                    }

                                    .group:hover .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                        background-color: #f472b6; /* 深粉色 */
                                    }
                                `}</style>

                                {logs.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center select-none">
                                        <div
                                            className="flex items-baseline text-gray-300 font-bold text-2xl opacity-30">
                                            <span>Waiting</span>
                                            <span className="animate-bounce [animation-delay:-0.3s] ml-1">.</span>
                                            <span className="animate-bounce [animation-delay:-0.15s]">.</span>
                                            <span className="animate-bounce">.</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {logs.slice(-50).map((log, i) => (
                                            <LogItem key={i} log={log} variant="compact"/>
                                        ))}
                                    </>
                                )}
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* --- 右侧栏 (占4份) --- */}
                <div className="lg:col-span-4 space-y-6">
                    {/* WineFoxBot 配置 */}
                    <Card className="shadow-sm border-none">
                        <CardBody className="p-5">
                            <h3 className="text-lg font-bold text-pink-400 mb-4">WineFoxBot配置</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {configs.length === 0 ? (
                                    <div className="col-span-2 text-center text-gray-300 text-xs py-4 animate-pulse">
                                        暂无配置...
                                    </div>
                                ) : (
                                    configs.map((conf, idx) => (
                                        <div
                                            key={idx}
                                            className={`bg-pink-50/50 p-2 rounded border border-pink-100/50 flex flex-col justify-center
                                                ${/* 特殊处理：如果值很长或者 order 很大，占满一行 */
                                                conf.value.length > 20 || conf.order >= 99 ? 'col-span-2' : ''}
                                            `}
                                            title={conf.description}
                                        >
                                            <div className="text-xs font-bold text-gray-600 truncate w-full" title={conf.value}>
                                                {conf.value}
                                            </div>
                                            <div className="text-[10px] text-pink-300 font-bold mt-0.5">
                                                {conf.label}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardBody>
                    </Card>

                    {/* 活跃群组 Chart */}
                    <Card className="shadow-sm border-none relative overflow-visible">
                        <CardBody className="p-4">
                            {/* 筛选按钮 */}
                            {renderFilter(groupRange, setGroupRange)}

                            <ReactECharts
                                option={getRankingOption(
                                    '活跃群组',
                                    activeGroups, // 直接传入 RankingItem[]
                                    ' #ec4899',
                                    '#fbcfe8'
                                )}
                                style={{height: '220px'}}
                            />
                        </CardBody>
                    </Card>

                    {/* 热门插件 Chart (真实数据) */}
                    <Card className="shadow-sm border-none relative overflow-visible">
                        <CardBody className="p-4">
                            {/* 筛选按钮 */}
                            {renderFilter(pluginRange, setPluginRange)}
                            <ReactECharts
                                option={getRankingOption(
                                    '热门插件',
                                    hotPlugins, // 直接传入 RankingItem[]
                                    ' #ec4899',
                                    '#fbcfe8'
                                )}
                                style={{height: '220px'}}
                            />
                        </CardBody>
                    </Card>
                </div>

            </div>
        </div>
    );
}
