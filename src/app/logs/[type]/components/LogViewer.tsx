'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@nextui-org/react";
import { Trash2, Pause, Play} from 'lucide-react';
import { useLogStore, LogEntry } from '@/store/useLogStore';
import {LogItem} from "@/components/Log/LogItem";

interface LogViewerProps {
    mode: 'live' | 'static';
    staticData?: LogEntry[];
    autoScroll?: boolean;
}

const LogViewer: React.FC<LogViewerProps> = ({ mode, staticData = [], autoScroll = true }) => {
    const liveLogs = useLogStore(state => state.logs);
    const clearLogs = useLogStore(state => state.clearLogs);

    const logs = mode === 'live' ? liveLogs : staticData;

    const [isAutoScroll, setIsAutoScroll] = useState(autoScroll);
    const viewportRef = useRef<HTMLDivElement>(null);

    // 自动滚动
    useEffect(() => {
        if (isAutoScroll && viewportRef.current) {
            viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
        }
    }, [logs, isAutoScroll]);

    return (
        <div
            className="flex flex-col h-full w-full bg-white rounded-3xl shadow-sm border border-pink-50 overflow-hidden relative">
            {/* 顶部工具栏 - 清爽风格 */}
            <div
                className="flex justify-between items-center px-6 py-3 bg-white border-b border-pink-50 flex-none z-10">
                <div className="flex items-center gap-2">
                    <h3 className="text-pink-500 font-bold text-lg flex items-center gap-2">
                        (●'◡'●) {mode === 'live' ? '实时监控' : '归档记录'}
                    </h3>
                    <span className="text-xs text-gray-300 bg-gray-50 px-2 py-0.5 rounded-full ml-2">
                        {logs.length} 条记录
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {mode === 'live' && (
                        <>
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                className={`${isAutoScroll ? 'text-green-500 bg-green-50' : 'text-gray-400 bg-gray-100'}`}
                                onPress={() => setIsAutoScroll(!isAutoScroll)}
                                title={isAutoScroll ? "自动滚动中" : "已暂停滚动"}
                            >
                                {isAutoScroll ? <Pause size={16}/> : <Play size={16}/>}
                            </Button>
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                className="text-red-400 hover:bg-red-50 hover:text-red-500"
                                onPress={clearLogs}
                                title="清空"
                            >
                                <Trash2 size={16}/>
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* 日志内容区域 */}
            <div
                ref={viewportRef}
                className="flex-1 overflow-y-auto p-6 font-mono text-sm leading-7 space-y-1 relative scroll-smooth"
            >
                {logs.length === 0 ? (
                    <div
                        className="h-full flex flex-col items-center justify-center text-gray-300 space-y-2 select-none">
                        <span className="text-6xl opacity-20">Zzz...</span>
                        <p className="text-xs">暂时没有日志哦</p>
                    </div>
                ) : (
                    // 极简调用，默认 variant="default"
                    logs.map((log, index) => (
                        <LogItem key={index} log={log}/>
                    ))
                )}
            </div>
        </div>
    );
};

export default LogViewer;
