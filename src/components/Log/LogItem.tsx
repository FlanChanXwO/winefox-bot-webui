import React, {memo, useState} from 'react';
import {formatTime} from '@/utils/time';
import {LogEntry} from '@/store/useLogStore';
import {Popover, PopoverTrigger, PopoverContent} from "@nextui-org/react";

interface LogItemProps {
    log: LogEntry;
    variant?: 'default' | 'compact';
}

export const LogItem: React.FC<LogItemProps> = memo(({log, variant = 'default'}) => {
    const isCompact = variant === 'compact';
    // 控制堆栈信息的展开/折叠
    const [isStackExpanded, setIsStackExpanded] = useState(false);

    const containerClass = isCompact
        ? "flex flex-wrap items-baseline gap-x-2 leading-relaxed hover:bg-pink-50 rounded px-1 -mx-1 transition-colors"
        : "flex flex-wrap items-baseline gap-x-2 hover:bg-pink-50/30 rounded px-2 -mx-2 transition-colors duration-200";

    const textSizeClass = isCompact ? "text-[10px] sm:text-xs" : "text-sm";

    // 判断是否有堆栈信息
    const hasStack = !!log.stackTrace;

    return (
        <div className="flex flex-col mb-0.5">
            <div className={`${containerClass} ${textSizeClass}`}>
                {/* 1. 时间 */}
                <span className="text-green-600 font-mono whitespace-nowrap select-none opacity-90 text-xs sm:text-sm">
                    {formatTime(log.timestamp)}
                </span>

                {/* 2. 级别 */}
                <span
                    className={`font-bold px-1.5 rounded py-0.5 select-none text-[10px] min-w-[3em] text-center border ${
                        log.level === 'ERROR' ? 'bg-red-50 text-red-600 border-red-100' :
                            log.level === 'WARN' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                                log.level === 'DEBUG' ? 'text-blue-500 border-blue-100' :
                                    'text-gray-500 border-gray-100'
                    }`}>
                    {log.level}
                </span>

                {/* 3. [新增] 线程名 - 紫色系 */}
                {log.thread && (
                    <span
                        className="text-purple-500 font-mono text-[10px] sm:text-xs shrink-0 select-none"
                        title={`Thread: ${log.thread}`}
                    >
                        [{log.thread}]
                    </span>
                )}

                {/* 4. Logger全类名 - 青色系 */}
                {log.logger && (
                    <>
                        <Popover placement="top" showArrow backdrop="transparent">
                            <PopoverTrigger>
                                <span
                                    className="text-cyan-600 opacity-80 hover:opacity-100 cursor-pointer max-w-[150px] sm:max-w-[300px] truncate align-bottom text-[11px] sm:text-xs font-mono select-none"
                                    // 移除 title，因为 Popover 会接管显示
                                >
                                    {log.logger}
                                </span>
                            </PopoverTrigger>
                            <PopoverContent>
                                <div className="px-1 py-2">
                                    <div
                                        className="text-tiny font-mono break-all select-all text-gray-600 dark:text-gray-300">
                                        {log.logger}
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                        {/* 分隔符，稍微淡一点 */}
                        <span className="text-gray-300 select-none hidden sm:inline">|</span>
                    </>
                )}

                {/* 5. 消息主体 */}
                <span className={`break-all flex-1 ${log.level === 'ERROR' ? 'text-red-500' : 'text-gray-700'}`}>
                    {log.message}
                </span>

                {/* 6. 堆栈展开按钮 (如果有堆栈) */}
                {hasStack && (
                    <button
                        onClick={() => setIsStackExpanded(!isStackExpanded)}
                        className={`text-[10px] px-2 py-0.5 rounded border ml-auto transition-colors whitespace-nowrap ${
                            isStackExpanded
                                ? 'bg-red-100 text-red-600 border-red-200'
                                : 'bg-white text-red-400 border-red-200 hover:bg-red-50'
                        }`}
                    >
                        {isStackExpanded ? '收起' : '堆栈'}
                    </button>
                )}
            </div>

            {/* 7. 堆栈信息展示区域 */}
            {hasStack && isStackExpanded && (
                <div
                    className="mt-1 ml-4 sm:ml-12 p-3 bg-[#1e1e1e] rounded-md border border-gray-700 overflow-x-auto shadow-inner">
                    <pre className="font-mono text-xs text-red-300 whitespace-pre-wrap break-all leading-5">
                        {log.stackTrace}
                    </pre>
                </div>
            )}
        </div>
    );
});

LogItem.displayName = 'LogItem';
