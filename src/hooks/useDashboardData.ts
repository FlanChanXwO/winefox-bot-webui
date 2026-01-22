
import { create } from 'zustand';
import { useBotStore } from "@/store/useBotStore";
import {
    getSystemConfigs,
    getConnectionLogs,
    getConnectionSummary,
    ConfigItem,
    ConnectionLog,
    ConnectionSummaryResponse, RankingItem
} from "@/api/stats";
import {
    getMessageStatistics,
    MessageStatisticsResponse
} from "@/api/messageStats";
import PluginApi,{InvokeSummaryResponse}  from "@/api/plugin";
import {getActiveGroupStats} from "@/api/group";

// --- Store 状态定义 ---

interface DashboardState {
    // 状态 - 配置
    configs: ConfigItem[];

    // 状态 - 日志
    logs: ConnectionLog[];
    logPage: { current: number; size: number; total: number; pages: number };
    isLoadingLogs: boolean;

    // 插件调用统计
    invokeStats: InvokeSummaryResponse;
    hotPlugins: RankingItem[];
    // 活跃群组统计
    activeGroups: RankingItem[];


    // 状态 - 概览
    summary: ConnectionSummaryResponse;
    isLoadingSummary: boolean;

    // 状态 - 消息统计
    messageStats: MessageStatisticsResponse;
    isLoadingMessageStats: boolean;

    // 动作
    fetchConfigs: () => Promise<void>;
    fetchLogs: (page?: number, size?: number) => Promise<void>;
    fetchSummary: () => Promise<void>;
    fetchMessageStats: () => Promise<void>;
    fetchInvokeStats: () => Promise<void>;
    fetchHotPlugins: (range?: string) => Promise<void>;
    fetchActiveGroups: (range?: string) => Promise<void>;

}

// 定义时间范围选项
const TIME_RANGES = [
    { key: 'ALL', label: '全部' },
    { key: 'DAY', label: '日' },
    { key: 'WEEK', label: '周' },
    { key: 'MONTH', label: '月' },
    { key: 'YEAR', label: '年' },
];

// 初始概览数据
const initialSummary: ConnectionSummaryResponse = {
    totalLoginCount: 0,
    connectionDuration: "00:00:00",
    connectionDate: null
};

// 初始消息统计数据
const initialMessageStats: MessageStatisticsResponse = {
    total: 0,
    today: 0,
    oneDay: 0,
    oneWeek: 0,
    oneMonth: 0,
    oneYear: 0
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
    // --- Initial State ---
    configs: [],
    logs: [],
    logPage: { current: 1, size: 5, total: 0, pages: 0 },
    isLoadingLogs: false,
    summary: initialSummary,
    isLoadingSummary: false,
    messageStats: initialMessageStats,
    isLoadingMessageStats: false,
    invokeStats: { total: 0, day: 0, week: 0, month: 0, year: 0 },
    hotPlugins: [],
    activeGroups: [],

    // --- Actions ---

    // 1. 获取系统配置
    fetchConfigs: async () => {
        try {
            const res = await getSystemConfigs();
            if (res.success && res.data) {
                set({ configs: res.data });
            }
        } catch (error) {
            console.error("获取配置失败", error);
        }
    },

    // 2. 获取连接日志 (分页)
    fetchLogs: async (page = 1, size = 5) => {
        set({ isLoadingLogs: true });

        const currentBotId = useBotStore.getState().currentBotId;

        // 防御：无 BotID 时清空数据并返回
        if (!currentBotId) {
            set({ isLoadingLogs: false, logs: [], logPage: { current: 1, size, total: 0, pages: 0 } });
            return;
        }

        try {
            // 调用 API 函数
            const res = await getConnectionLogs(currentBotId, page, size);

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
    },

    // 3. 获取连接统计概览 (新增)
    fetchSummary: async () => {
        set({ isLoadingSummary: true });

        const currentBotId = useBotStore.getState().currentBotId;

        if (!currentBotId) {
            set({ isLoadingSummary: false, summary: initialSummary });
            return;
        }

        try {
            const res = await getConnectionSummary(currentBotId);

            if (res.success && res.data) {
                set({ summary: res.data });
            }
        } catch (error) {
            console.error("获取概览统计失败", error);
        } finally {
            set({ isLoadingSummary: false });
        }
    },

    // 获取消息统计
    fetchMessageStats: async () => {
        set({ isLoadingMessageStats: true });


        const currentBotId = useBotStore.getState().currentBotId;

        if (!currentBotId) {
            set({ isLoadingMessageStats: false, messageStats: initialMessageStats });
            return;
        }

        try {
            const res = await getMessageStatistics(currentBotId);
            if (res.success && res.data) {
                set({ messageStats: res.data });
            }
        } catch (error) {
            console.error("获取消息统计失败", error);
        } finally {
            set({ isLoadingMessageStats: false });
        }
    },
    fetchInvokeStats: async () => {
        try {
            const res = await PluginApi.getInvokeSummary();
            // 假设 request 工具返回结构是 { data: ... } 或者直接返回 data
            // 根据你的 request 封装调整，这里假设 res.data 是 payload
            if (res.data) {
                set({ invokeStats: res.data });
            }
        } catch (error) {
            console.error("Fetch invoke stats failed", error);
        }
    },

    fetchHotPlugins: async (range = 'WEEK') => {
        try {
            const res = await PluginApi.getHotPluginRanking(range);
            if (res.data) {
                set({ hotPlugins: res.data });
            }
        } catch (error) {
            console.error("Fetch hot plugins failed", error);
        }
    },

    fetchActiveGroups: async (range = 'WEEK') => {
        try {
            const res = await getActiveGroupStats(range);
            // 后端现在直接返回数组，不再包裹在 activeGroups 字段里
            if (res.data) {
                set({ activeGroups: res.data });
            }
        } catch (error) {
            console.error("Fetch active groups failed", error);
        }
    }
}));
