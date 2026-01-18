import { create } from 'zustand';
import request, { Result } from '@/utils/request';
import {useBotStore} from "@/store/useBotStore";

// --- 类型定义 ---

// 1. 配置项实体
export interface ConfigItem {
    label: string;
    value: string;
    description: string;
    order: number;
}

// 2. 日志实体 (对应后端实体)
export interface ConnectionLog {
    id: string;
    botId: string; // 对应 bot_id
    eventType: 'CONNECT' | 'DISCONNECT' | 'RECONNECT' | 'ERROR';
    createdAt: string;
}

// 3. 分页元数据 (对应 MyBatis-Plus Page 对象结构)
export interface PageData<T> {
    records: T[];
    total: number;
    size: number;
    current: number;
    pages: number;
}

// --- Store 状态定义 ---

interface DashboardState {
    // 状态
    configs: ConfigItem[];
    logs: ConnectionLog[];
    logPage: { current: number; size: number; total: number; pages: number };
    isLoadingLogs: boolean;

    // 动作
    fetchConfigs: () => Promise<void>;
    fetchLogs: (page?: number, size?: number) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
    configs: [],
    logs: [],
    logPage: { current: 1, size: 5, total: 0, pages: 0 },
    isLoadingLogs: false,

    // 获取系统配置
    fetchConfigs: async () => {
        try {
            const res = await request.get<ConfigItem[]>('/api/system/config');
            if (res.success && res.data) {
                set({ configs: res.data} );
            }
        } catch (error) {
            console.error("获取配置失败", error);
        }
    },

    // 获取连接日志 (分页)
    fetchLogs: async (page = 1, size = 5) => {
        set({ isLoadingLogs: true });
        // 1. 获取 ID
        let currentBotId = useBotStore.getState().currentBotId;

        // 2. 核心防御：如果 ID 为空，尝试重新初始化或者直接返回
        if (!currentBotId) {
            console.warn("fetchLogs: BotID 为空，尝试重新获取或跳过...");
            // 可选策略 A：直接跳过（推荐，防止发错误请求）
            set({ isLoadingLogs: false, logs: [] });
            return;
        }

        try {
            // 注意 URL 参数拼接
            const res = await request.get<PageData<ConnectionLog>>(
                `/api/logs/connection?page=${page}&size=${size}&botId=${currentBotId}`
            );


            if (res.success && res.data) {
                set({
                    logs: res.data.records,
                    logPage: {
                        current: res.data.current,
                        size: res.data.size,
                        total: res.data.total,
                        pages: res.data.pages
                    }
                });
            }
        } catch (error) {
            console.error("获取日志失败", error);
        } finally {
            set({ isLoadingLogs: false });
        }
    }
}));
