"use client";

import React, {useEffect, useState} from "react";
import {Button, Card, CardBody, DatePicker, DateValue} from "@nextui-org/react";
import {AlertCircle, History, Search, Terminal} from "lucide-react";
import {LogEntry, useLogStore} from "@/store/useLogStore";
import {getLocalTimeZone, parseDate, today} from "@internationalized/date";
import request from "@/utils/request";
import {useParams} from "next/dist/client/components/navigation";
import LogViewer from "./components/LogViewer";

async function fetchHistoryLogs(date: DateValue, type: 'history' | 'error'): Promise<LogEntry[]> {
    try {
        const dateStr = date.toString();
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
                const json = JSON.parse(line);
                return {
                    timestamp: (json["@timestamp"] || json.timestamp || new Date().toISOString()).replace(' ', 'T'),
                    level: json.level || 'INFO',
                    thread: json.thread_name || json.thread || 'unknown',
                    logger: json.logger_name || json.logger || 'root',
                    message: json.message || '',
                    stackTrace: json.stack_trace || json.stackTrace || undefined
                } as LogEntry;
            } catch (e) {
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

// 导出组件名字稍微改一下，叫 LogsClient
export default function LogsClient() {
    const {isConnected } = useLogStore();
    const [selectedDate, setSelectedDate] = useState(today(getLocalTimeZone()));
    const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
    const [historyLogs, setHistoryLogs] = useState<LogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDatesLoading, setIsDatesLoading] = useState(true);

    const params = useParams();
    const subType = params.type as 'live' | 'history' | 'error';

    useEffect(() => {
        if (subType === 'live') return;
        const fetchDates = async () => {
            setIsDatesLoading(true);
            try {
                const res = await request.get<string[]>('/api/logs/available-dates', {
                    params: { type: subType }
                });
                // @ts-ignore
                const dates: string[] = res.data || [];
                if (dates.length > 0) {
                    const dateSet = new Set(dates);
                    setAvailableDates(dateSet);
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
                setIsDatesLoading(false);
            }
        };
        fetchDates();
    }, [subType]);

    useEffect(() => {
        if (subType !== 'live') {
            setIsLoading(true);
            setHistoryLogs([]);
            fetchHistoryLogs(selectedDate, subType)
                .then(data => {
                    setHistoryLogs(data);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [subType, selectedDate]);

    const headerConfig = {
        live: { title: "实时控制台", icon: <Terminal size={20} className="text-white" />, color: "bg-pink-400", desc: isConnected ? "正在接收实时数据流..." : "连接建立中..." },
        history: { title: "历史归档", icon: <History size={20} className="text-white" />, color: "bg-blue-400", desc: "查看过往的运行记录" },
        error: { title: "错误堆栈", icon: <AlertCircle size={20} className="text-white" />, color: "bg-red-400", desc: "异常与崩溃信息筛选" }
    };

    // 防止 subType 不匹配导致的崩溃
    const currentHeader = headerConfig[subType] || headerConfig['live'];

    return (
        <div className="flex flex-col h-full gap-4 px-2 md:px-0 pb-4">
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
                                isDateUnavailable={(date: DateValue) => {
                                    if (isDatesLoading || availableDates.size === 0) {
                                        return false;
                                    }
                                    return !availableDates.has(date.toString());
                                }}
                                maxValue={today(getLocalTimeZone())}
                            />
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
