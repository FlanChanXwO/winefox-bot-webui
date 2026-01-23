"use client";

import React, { useState, useEffect } from "react";
import {Card, CardBody, Button, DatePicker, DateValue} from "@nextui-org/react";
import { Terminal, Search, AlertCircle, History } from "lucide-react";
import { useLogStore, LogEntry } from "@/store/useLogStore";
import LogViewer from "./LogViewer";
import {getLocalTimeZone, parseDate, today} from "@internationalized/date";
import request from "@/utils/request";

// 获取历史日志
async function fetchHistoryLogs(date: DateValue, type: 'history' | 'error'): Promise<LogEntry[]> {
    try {
        const dateStr = date.toString(); // YYYY-MM-DD
        const res = await request.get<string[]>(`/api/logs/content`, {
            params: {
                date: dateStr,
                type: type
            }
        });

        // @ts-ignore
        const rawLines = res.data || [];

        return rawLines.map((line: string) => {
            try {
                // 尝试解析每一行 JSON
                const json = JSON.parse(line);

                // --- 核心修复：字段映射 ---
                return {
                    // 时间：优先用 @timestamp，其次 timestamp，最后用当前时间
                    timestamp: (json["@timestamp"] || json.timestamp || new Date().toISOString()).replace(' ', 'T'),

                    // 级别
                    level: json.level || 'INFO',

                    // 线程名 (后端是 thread_name)
                    thread: json.thread_name || json.thread || 'unknown',

                    // 全类名/Logger (后端是 logger_name)
                    logger: json.logger_name || json.logger || 'root',

                    // 消息
                    message: json.message || '',

                    // 堆栈信息 (后端是 stack_trace，这行代码解决了堆栈不显示的问题)
                    stackTrace: json.stack_trace || json.stackTrace || undefined
                } as LogEntry;

            } catch (e) {
                // 如果解析失败，回退到纯文本显示
                return {
                    timestamp: new Date().toISOString(),
                    level: 'INFO',
                    message: line,
                    thread: '-',
                    logger: '-'
                } as LogEntry;
            }
        });
    } catch (error) {
        console.error("Fetch logs failed", error);
        return [];
    }
}


export default function LogView({ subType }: { subType: 'live' | 'history' | 'error' }) {
    const {isConnected } = useLogStore();
    const [selectedDate, setSelectedDate] = useState(today(getLocalTimeZone()));
    const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
    const [historyLogs, setHistoryLogs] = useState<LogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDatesLoading, setIsDatesLoading] = useState(true);

    // 1. 获取可用日期列表
    useEffect(() => {
        if (subType === 'live') return;

        const fetchDates = async () => {
            setIsDatesLoading(true); // 开始加载
            try {
                // 请求后端获取日期列表
                const res = await request.get<string[]>('/api/logs/available-dates', {
                    params: { type: subType }
                });

                // @ts-ignore Result结构解包
                const dates: string[] = res.data || [];

                if (dates.length > 0) {
                    const dateSet = new Set(dates);
                    setAvailableDates(dateSet);

                    // 自动跳到最近的一个有日志的日期 (提升体验)
                    // dates[0] 是排序后最新的日期
                    // 只有当当前选中的日期不在可用列表中时，才自动跳转
                    const currentSelectedStr = selectedDate.toString();
                    if (!dateSet.has(currentSelectedStr)) {
                        setSelectedDate(parseDate(dates[0]));
                    }
                } else {
                    setAvailableDates(new Set());
                }
            } catch (e) {
                console.error("Failed to fetch available dates", e);
            } finally {
                setIsDatesLoading(false); // 结束加载
            }
        };

        fetchDates();
    }, [subType]);

    // 历史/错误日志获取
    useEffect(() => {
        if (subType !== 'live') {
            setIsLoading(true);
            setHistoryLogs([]); // 切换时先清空，避免显示上一页的数据

            fetchHistoryLogs(selectedDate, subType)
                .then(data => {
                    setHistoryLogs(data);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [subType, selectedDate]);

    // 标题配置
    const headerConfig = {
        live: { title: "实时控制台", icon: <Terminal size={20} className="text-white" />, color: "bg-pink-400", desc: isConnected ? "正在接收实时数据流..." : "连接建立中..." },
        history: { title: "历史归档", icon: <History size={20} className="text-white" />, color: "bg-blue-400", desc: "查看过往的运行记录" },
        error: { title: "错误堆栈", icon: <AlertCircle size={20} className="text-white" />, color: "bg-red-400", desc: "异常与崩溃信息筛选" }
    };

    const currentHeader = headerConfig[subType];

    return (
        <div className="flex flex-col h-full gap-4 px-2 md:px-0 pb-4">
            {/* 顶部控制栏 - 白色卡片 */}
            <Card className="bg-white border border-pink-50 shadow-sm flex-none rounded-2xl">
                <CardBody className="py-3 px-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl shadow-md shadow-pink-100 ${currentHeader.color}`}>
                            {currentHeader.icon}
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-700 text-lg">{currentHeader.title}</h2>
                            <p className="text-xs text-gray-400 flex items-center gap-2">
                                {subType === 'live' && (
                                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-300'}`}></span>
                                )}
                                {currentHeader.desc}
                            </p>
                        </div>
                    </div>

                    {/* 日期选择器 (仅在非实时模式显示) */}
                    {subType !== 'live' && (
                        <div className="flex items-center gap-2 w-full md:w-auto bg-gray-50 p-1 rounded-xl border border-gray-100">
                            <DatePicker
                                aria-label="Date"
                                className="max-w-xs"
                                size="sm"
                                variant="flat"
                                value={selectedDate}
                                onChange={value => {
                                    if (value) {
                                        setSelectedDate(value)
                                    }
                                }}
                                color="secondary"
                                showMonthAndYearPickers
                                // 核心功能：如果该日期不在 availableDates 集合中，则禁用
                                isDateUnavailable={(date: DateValue) => {
                                    // 1. 如果正在加载，或者后端完全没返回任何日期（避免全灰），则所有日期都可用
                                    if (isDatesLoading || availableDates.size === 0) {
                                        return false;
                                    }
                                    // 2. 正常逻辑：只允许列表里的日期
                                    return !availableDates.has(date.toString());
                                }}
                                // 可选：限制不能选未来时间
                                maxValue={today(getLocalTimeZone())}
                            />
                            {/* 手动刷新按钮保持不变 */}
                            <Button
                                isIconOnly
                                size="sm"
                                className="bg-white text-pink-500 shadow-sm rounded-lg"
                                onPress={() => {
                                    setIsLoading(true);
                                    fetchHistoryLogs(selectedDate, subType).then(setHistoryLogs).finally(() => setIsLoading(false));
                                }}
                            >
                                <Search size={16}/>
                            </Button>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* 日志查看器容器 */}
            <div className="flex-1 min-h-0 relative">
                {isLoading ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-3xl border border-pink-50">
                        <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mb-2"></div>
                        <span className="text-xs text-pink-400 font-bold">读取记录中...</span>
                    </div>
                ) : (
                    <LogViewer
                        mode={subType === 'live' ? 'live' : 'static'}
                        staticData={historyLogs}
                        autoScroll={subType === 'live'}
                    />
                )}
            </div>
        </div>
    );
}
