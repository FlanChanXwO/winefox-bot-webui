import {create} from 'zustand';
import {Client, IMessage} from '@stomp/stompjs';
import {getApiConfig} from "@/utils/config";
import {TOKEN_KEY} from "@/utils/request";

export interface LogEntry {
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'TRACE' | string;
    thread?: string;
    logger?: string;
    message: string;
    stackTrace?: string;
}

interface ApplicationLog {
    // 兼容新版 (Logstash/JSON) 格式
    "@timestamp"?: string;
    "@version"?: string;
    "level_value"?: number;

    // 兼容旧版格式
    timestamp?: string;

    // 公共字段
    level: string;
    thread_name: string;
    logger_name: string;
    message: string;
    stack_trace?: string;
}


interface LogState {
    logs: LogEntry[];
    isConnected: boolean;
    maxLogs: number;
    addLog: (log: LogEntry) => void;
    clearLogs: () => void;
    setConnected: (status: boolean) => void;
    connectWebSocket: () => void;
    disconnectWebSocket: () => void;
    reconnectWebSocket: () => void;
}

// 保存 stomp client 实例在 store 外部
let stompClient: Client | null = null;


export const useLogStore = create<LogState>((set, get) => ({
    logs: [],
    isConnected: false,
    maxLogs: 1000,

    addLog: (log) => set((state) => {
        const newLogs = [...state.logs, log];
        // 性能优化：当日志过多时才切割
        if (newLogs.length > state.maxLogs) {
            return {logs: newLogs.slice(newLogs.length - state.maxLogs)};
        }
        return {logs: newLogs};
    }),

    clearLogs: () => set({logs: []}),
    setConnected: (status) => set({isConnected: status}),

    connectWebSocket: () => {
        if (stompClient && stompClient.active) return;

        // 1. 获取 Token
        const token = localStorage.getItem(TOKEN_KEY);

        if (!token) {
            console.warn("尝试连接 WebSocket 但没有 Token，取消连接");
            return;
        }

        const {baseUrl} = getApiConfig();

        let wsUrl = baseUrl.replace(/^http/, 'ws');

        // 防止用户没写 http 前缀的情况 (容错)
        if (!wsUrl.startsWith('ws')) {
            wsUrl = `ws://${baseUrl}`;
        }
        // 拼接具体路径
        const brokerURL = `${wsUrl}/ws-log`;

        stompClient = new Client({
            brokerURL:   brokerURL,
            connectHeaders: {
                Authorization: token
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,

            onConnect: () => {
                get().setConnected(true);
                console.log('🔗 Log WebSocket Connected');

                // --- 修改点 1: 适配新版字段 ---
                const appendLogToConsole = (log: ApplicationLog) => {
                    // 优先取 @timestamp，没有再取 timestamp
                    // 新版日期通常自带 T (ISO8601)，旧版可能只有空格
                    let rawTime = log["@timestamp"] || log.timestamp || new Date().toISOString();
                    // 简单清洗一下，确保是 ISO 格式以便前端显示
                    rawTime = rawTime.replace(' ', 'T');

                    const logEntry: LogEntry = {
                        timestamp: rawTime,
                        level: log.level,
                        logger: log.logger_name,
                        thread: log.thread_name,
                        message: log.message,
                        stackTrace: log.stack_trace
                    };
                    get().addLog(logEntry);
                }

                stompClient?.subscribe('/app/logs/history', (message) => {
                    let rawHistoryList: string[] = [];
                    try {
                        rawHistoryList = JSON.parse(message.body);
                    } catch (e) {
                        console.error("历史日志列表外层解析失败", e);
                        return;
                    }

                    rawHistoryList.forEach(logString => {
                        try {
                            // 尝试正常解析 JSON
                            const logObj: ApplicationLog = JSON.parse(logString);
                            appendLogToConsole(logObj);
                        } catch (e) {
                            // --- 修改点 2: 正则抢救逻辑适配新格式 ---

                            // 1. 正则提取基础字段 (兼容 "@timestamp" 和 "timestamp")
                            // 匹配 key 为 "@timestamp" 或 "timestamp"
                            const timeMatch = logString.match(/"@?timestamp":\s*"([^"]+)"/);

                            const levelMatch = logString.match(/"level":\s*"([^"]+)"/);

                            // 兼容 logger_name 或 logger
                            const loggerMatch = logString.match(/"(logger_name|logger)":\s*"([^"]+)"/);

                            // 2. 尝试正则提取 Message
                            // @ts-ignore
                            let msgMatch = logString.match(/"message":\s*"(.*)"\s*}/s);
                            if (!msgMatch) {
                                // @ts-ignore
                                msgMatch = logString.match(/"message":\s*"(.*)"\s*,\s*"/s);
                            }

                            const timestamp = timeMatch ? timeMatch[1].replace(' ', 'T') : new Date().toISOString();
                            const level = levelMatch ? levelMatch[1] : 'INFO';
                            const logger = loggerMatch ? loggerMatch[2] : 'RawParser'; // match[2] 是捕获组的值
                            const messageStr = msgMatch ? msgMatch[1] : `日志解析部分失败: ${logString.substring(0, 100)}...`;

                            // 3. 关键判定：是否为堆栈
                            const isRealStackTrace = logString.includes('\n\tat ') ||
                                logString.includes('Exception: ') ||
                                logString.includes('Caused by: ') ||
                                logString.includes('"stack_trace"'); // 新增判定

                            get().addLog({
                                timestamp: timestamp,
                                level: level,
                                logger: logger,
                                message: messageStr,
                                thread: 'parser-recovered',
                                stackTrace: isRealStackTrace ? logString : undefined
                            });
                        }
                    });
                });

                stompClient?.subscribe('/topic/logs', (message: IMessage) => {
                    try {
                        if (message.body) {
                            const rawLog: ApplicationLog = JSON.parse(message.body);
                            appendLogToConsole(rawLog)
                        }
                    } catch (error) {
                        console.error("实时日志解析失败:", error);
                        // ... 错误处理保持不变 ...
                    }
                });
            },

            onDisconnect: () => {
                get().setConnected(false);
                console.log('🔌 Log WebSocket Disconnected');
            },

            onStompError: (frame) => {
                console.error('WebSocket 认证或协议错误: ' + frame.headers['message']);
                // 如果是 401 或类似错误，可能需要触发前端登出逻辑
                get().setConnected(false);
            },

            onWebSocketClose: () => {
                get().setConnected(false);
            },
        });

        stompClient.activate();
    },

    disconnectWebSocket: () => {
        if (stompClient) {
            stompClient.deactivate();
            stompClient = null;
            get().setConnected(false);
        }
    },

    reconnectWebSocket: () => {
        const { disconnectWebSocket, connectWebSocket } = get();
        disconnectWebSocket();
        // 稍微延迟一下再连接，确保资源释放，也可以直接连
        setTimeout(() => {
            connectWebSocket();
        }, 200);
    }
}));
