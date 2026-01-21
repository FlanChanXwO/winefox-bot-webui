"use client";

import React, {useEffect, useState} from "react";
import {
    Card, CardBody, Avatar, Chip, Button, CircularProgress, Select, SelectItem
} from "@nextui-org/react";
import { Power, Puzzle, Download } from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    AreaChart, Area
} from "recharts";
import {useBotStore} from "@/store/useBotStore";
import {useDashboardStore} from "@/hooks/useDashboardData";
import {FriendAndGroupStatsResponse, getFriendAndGroupStats} from "@/api/friendAndGroup";
import {getConsoleStats} from "@/api/console"; // [新增] 引入API
import {formatLogTime} from "@/utils/time";
import {getValueFontSize} from "@/utils/font";

// --- 模拟数据 (图表部分暂时保持模拟，等待后续后端接口) ---

// 1. 活跃群组
const activityData = [
    { name: 'test', count: 121 },
    { name: '123123', count: 15 },
    { name: '群', count: 5 },
    { name: '某群', count: 2 },
];

// 2. 热门插件
const pluginStatsData = [
    { name: 'BYM_AI', count: 415 },
    { name: '商店', count: 112 },
    { name: '酒狐银行', count: 58 },
    { name: '签到', count: 29 },
    { name: '图片超分', count: 5 },
];

// [修改] 删除旧的 trendData 静态数据，改用 State 管理

// --- 辅助组件 ---
// ... (保持 TimeFilter 和 RingStatCard 不变) ...
const TimeFilter = ({ active = '年' }: { active?: string }) => {
    const filters = ['全部', '日', '周', '月', '年'];
    return (
        <div className="flex flex-wrap gap-1 justify-end text-xs">
            {filters.map(f => (
                <span
                    key={f}
                    className={`cursor-pointer px-2 py-1 rounded-full transition-colors ${
                        f === active
                            ? 'bg-pink-400 text-white font-bold shadow-md shadow-pink-200'
                            : 'text-pink-300 hover:bg-pink-50'
                    }`}
                >
                    {f}
                </span>
            ))}
        </div>
    );
};

const RingStatCard = ({ title, subTitle, color, data }: { title: React.ReactNode, subTitle: string, color: string, data: any[] }) => (
    <Card className="shadow-sm border-none bg-white">
        <CardBody className="p-6">
            <div className={`flex flex-wrap items-center gap-2 mb-6 ${color}`}>
                <span className="font-bold text-lg">{title}</span>
                <span className="text-xs text-gray-400 font-normal ml-2 hidden sm:inline-block">{subTitle}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {data.map((item, idx) => {
                    const fontSizeClass = getValueFontSize(item.val);

                    return (
                        <div key={idx} className="flex flex-col items-center gap-3 relative">
                            {/* 环形进度条 */}
                            <div className="relative flex items-center justify-center">
                                <CircularProgress
                                    classNames={{
                                        svg: "w-20 h-20 drop-shadow-sm",
                                        indicator: item.color,
                                        track: "stroke-gray-100",
                                    }}
                                    value={item.val > 0 ? 75 : 0}
                                    strokeWidth={3}
                                    aria-label={item.label}
                                />
                                <span
                                    className={`absolute font-bold ${fontSizeClass} ${color.replace('text-', 'text-opacity-90 text-')} transition-all duration-300`}
                                >
                                        {item.val}
                                    </span>
                            </div>
                            <span className="text-gray-400 text-xs font-medium">{item.label}</span>
                        </div>
                    )
                })}
            </div>
        </CardBody>
    </Card>
);


export default function Console() {
    // 3. 获取 Store 数据
    const currentBotInfo = useBotStore(state => state.currentBotInfo);
    const {
        summary,
        fetchSummary,
        messageStats,
        fetchMessageStats
    } = useDashboardStore();

    // 4. 本地状态
    const [friendAndGroupStats, setFriendAndGroupStats] = useState<FriendAndGroupStatsResponse>({groupCount: 0, friendCount: 0});
    // [新增] 折线图数据状态
    const [trendChartData, setTrendChartData] = useState<any[]>([]);

    // 5. 数据获取副作用
    useEffect(() => {
        if (currentBotInfo?.botId) {
            fetchSummary();
            fetchMessageStats();
            fetchFriendAndGroupStats(currentBotInfo.botId);
            fetchTrendData(); // [新增] 调用获取折线图数据
        }
    }, [currentBotInfo?.botId]);

    const fetchFriendAndGroupStats = async (botId: number) => {
        try {
            const res = await getFriendAndGroupStats(botId);
            if (res.success) {
                setFriendAndGroupStats(res.data || {groupCount: 0, friendCount: 0});
            } else {
                console.warn("获取统计数据失败:", res.message);
            }
        } catch (error) {
            console.error("获取好友和群组统计数据失败:", error);
        }
    }

    // [新增] 获取并转换折线图数据
    const fetchTrendData = async () => {
        try {
            const res = await getConsoleStats();
            if (res.success && res.data?.trend) {
                const { dates, msgCounts, callCounts } = res.data.trend;

                // 数据转换：将后端的三个平行数组转换为对象数组
                // 假设 dates, msgCounts, callCounts 长度一致
                const chartData = dates.map((date, index) => ({
                    date: date,
                    msg: msgCounts[index] || 0,
                    call: callCounts[index] || 0
                }));

                setTrendChartData(chartData);
            }
        } catch (error) {
            console.error("获取折线图数据失败:", error);
        }
    };

    // 格式化连接时间
    const formattedConnectDate = summary.connectionDate
        ? formatLogTime(summary.connectionDate).dateStr + " " + formatLogTime(summary.connectionDate).timeStr
        : "未连接";

    return (
        <div className="h-full overflow-y-auto bg-transparent p-4 lg:p-6 custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6">

                {/* ... 第一列代码保持不变 ... */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                    {/* ... 用户卡片 & 插件管理卡片 ... */}
                    <Card className="shadow-sm border-none bg-white min-h-[300px]">
                        <CardBody className="flex flex-col items-center justify-center py-10 gap-5">
                            <div className="relative">
                                <Avatar
                                    src={currentBotInfo?.avatarUrl} classNames={{img: "opacity-100"}}
                                    className="w-28 h-28 text-large border-4 border-pink-50 shadow-lg shadow-pink-100/50" imgProps={{referrerPolicy: "no-referrer"}}
                                />

                            </div>
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-bold text-pink-500 tracking-wide">{currentBotInfo?.nickname || "我是谁？"}</h2>
                                <Chip className="bg-pink-400 text-white font-bold border border-pink-300 shadow-sm" size="sm">ID: {currentBotInfo?.botId || "114514 "}</Chip>
                            </div>

                            <div className="flex justify-around w-full mt-6 px-2">
                                <div className="text-center group cursor-pointer">
                                    <p className="text-xl font-bold text-blue-400 group-hover:scale-110 transition-transform">
                                        {friendAndGroupStats.friendCount}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">好友数量</p>
                                </div>
                                <div className="text-center group cursor-pointer">
                                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-1 group-hover:bg-green-100 transition-colors">
                                        <Power className="w-4 h-4 text-green-500" />
                                    </div>
                                    <p className="text-xs text-gray-400">全局开关</p>
                                </div>
                                <div className="text-center group cursor-pointer">
                                    <p className="text-xl font-bold text-green-500 group-hover:scale-110 transition-transform">
                                        {friendAndGroupStats.groupCount}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">群组数量</p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="shadow-sm border-none bg-white flex-1">
                        <CardBody className="p-6">
                            <h3 className="text-md font-bold text-pink-500 flex items-center gap-2 mb-6 line-through">
                                <Puzzle size={18} /> Bot插件管理
                            </h3>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-500">全局禁用被动</span>
                                    </div>
                                    <Select
                                        size="sm"
                                        variant="bordered"
                                        placeholder="请选择要禁用的被动"
                                        className="max-w-full"
                                        classNames={{ trigger: "border-gray-200" }}
                                    >
                                        <SelectItem key="none">无</SelectItem>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-500">全局禁用插件</span>
                                    </div>
                                    <Select
                                        size="sm"
                                        variant="bordered"
                                        placeholder="请选择要禁用的插件"
                                        className="max-w-full"
                                        classNames={{ trigger: "border-gray-200" }}
                                    >
                                        <SelectItem key="none">无</SelectItem>
                                    </Select>
                                </div>

                                <Button className="w-full bg-pink-400 text-white font-bold shadow-lg shadow-pink-200 mt-4 rounded-xl">
                                    应用设置
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </div>


                {/* === 第二列：核心数据环形图与折线图 (col-span-6) === */}
                <div className="lg:col-span-6 flex flex-col gap-6">

                    {/* ... 两个 RingStatCard 保持不变 ... */}
                    <RingStatCard
                        title={<>(●'◡'●)✿ 消息接收</>}
                        subTitle="勇者结识伙伴，收到的问候，口才+1"
                        color="text-pink-500"
                        data={[
                            { val: messageStats.total, label: "总数", color: "stroke-orange-500" },
                            { val: messageStats.oneDay, label: "一日内", color: "stroke-gray-300" },
                            { val: messageStats.oneWeek, label: "一周内", color: "stroke-purple-400" },
                            { val: messageStats.oneMonth, label: "一月内", color: "stroke-blue-400" },
                            { val: messageStats.oneYear, label: "一年内", color: "stroke-green-500" },
                        ]}
                    />

                    <RingStatCard
                        title={<>(/●ヮ●)/ *:･ﾟ✧ 功能调用</>}
                        subTitle="勇者磨砺自身，辛勤的汗水，力量+1"
                        color="text-pink-500"
                        data={[
                            { val: 631, label: "总数", color: "stroke-orange-500" },
                            { val: 0, label: "一日内", color: "stroke-gray-300" },
                            { val: 2, label: "一周内", color: "stroke-purple-400" },
                            { val: 23, label: "一月内", color: "stroke-blue-400" },
                            { val: 631, label: "一年内", color: "stroke-green-500" },
                        ]}
                    />

                    {/* 3. 消息/调用统计折线图 */}
                    <Card className="shadow-sm border-none bg-pink-50/30">
                        <CardBody className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-md font-bold text-pink-500">消息/调用统计</h3>
                                    <div className="flex gap-4 text-xs font-bold mt-1">
                                        <div className="flex items-center gap-1 text-pink-400">
                                            <span className="w-2 h-2 rounded-full border-2 border-pink-400 bg-white"></span>
                                            消息统计
                                        </div>
                                        <div className="flex items-center gap-1 text-pink-300">
                                            <span className="w-2 h-2 rounded-full border-2 border-pink-300 bg-white"></span>
                                            调用统计
                                        </div>
                                    </div>
                                </div>
                                <Button isIconOnly size="sm" variant="light" className="text-pink-300">
                                    <Download size={16} />
                                </Button>
                            </div>

                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    {/* [修改] data 属性改为使用 trendChartData */}
                                    <AreaChart data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorMsg" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2}/>
                                                <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorCall" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f472b6" stopOpacity={0.2}/>
                                                <stop offset="95%" stopColor="#f472b6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fbcfe8" strokeOpacity={0.5} />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(236, 72, 153, 0.1)' }}
                                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                        />
                                        <Area type="monotone" dataKey="msg" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorMsg)" activeDot={{ r: 4, strokeWidth: 0 }} />
                                        <Area type="monotone" dataKey="call" stroke="#f472b6" strokeWidth={2} fillOpacity={1} fill="url(#colorCall)" activeDot={{ r: 4, strokeWidth: 0 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* === 第三列 ... 代码保持不变 ... === */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                    <Card className="shadow-sm border-none bg-pink-50/50">
                        <CardBody className="p-5 space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-pink-500">累计登录</span>
                                <span className="font-bold text-pink-400 font-mono">{summary.totalLoginCount}</span>
                            </div>
                            <div className="h-px bg-pink-100/50 w-full border-t border-dashed border-pink-200"></div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-pink-500">连接时长</span>
                                <span className="font-bold text-pink-400 font-mono">{summary.connectionDuration}</span>
                            </div>
                            <div className="h-px bg-pink-100/50 w-full border-t border-dashed border-pink-200"></div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-pink-500">连接日期</span>
                                <span className="font-bold text-pink-400 font-mono text-xs">{formattedConnectDate}</span>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="shadow-sm border-none bg-white flex-1 min-h-[220px]">
                        <CardBody className="p-4">
                            <div className="flex flex-wrap justify-between items-start mb-2 gap-2">
                                <h3 className="text-sm font-bold text-pink-500 w-10 leading-tight">活跃群组</h3>
                                <TimeFilter active="年"/>
                            </div>
                            <div className="h-[150px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={activityData} layout="vertical" margin={{top: 0, right: 10, left: 0, bottom: 0}}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#fce7f3" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={40} axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 10}} />
                                        <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="count" fill="#fb7185" radius={[0, 4, 4, 0]} barSize={16} label={{ position: 'right', fill: '#fb7185', fontSize: 10, fontWeight: 'bold' }} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="shadow-sm border-none bg-white flex-1 min-h-[220px]">
                        <CardBody className="p-4">
                            <div className="flex flex-wrap justify-between items-start mb-2 gap-2">
                                <h3 className="text-sm font-bold text-pink-500 w-10 leading-tight">热门插件</h3>
                                <TimeFilter active="年"/>
                            </div>
                            <div className="h-[160px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={pluginStatsData} margin={{top: 15, right: 0, left: -25, bottom: 0}}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fce7f3" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 9}} interval={0} angle={-15} textAnchor="end" height={40}/>
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 10}} />
                                        <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="count" fill="#f472b6" radius={[4, 4, 0, 0]} barSize={24} label={{ position: 'top', fill: '#666', fontSize: 10 }} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}
