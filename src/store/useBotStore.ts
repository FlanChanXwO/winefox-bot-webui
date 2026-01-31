import {create} from 'zustand';
import request from '@/utils/request'; // 假设你的 axios 实例在这里
import {toast} from 'sonner';

// 对应后端的 BotInfoResponse
export interface BotInfo {
    botId: number;
    nickname: string;
    avatarUrl: string;
}

interface BotState {
    // 状态
    currentBotId: number | null;
    currentBotInfo: BotInfo | null;
    availableBots: number[]; // 存储所有在线机器人的ID
    isLoading: boolean;

    // 动作
    fetchAvailableBots: () => Promise<void>;
    switchBot: (botId: number) => Promise<void>;

    // 初始化方法：拉取列表并自动选择第一个
    initBots: () => Promise<void>;
}

export const useBotStore = create<BotState>((set, get) => ({
    currentBotId: null,
    currentBotInfo: null,
    availableBots: [],
    isLoading: false,

    fetchAvailableBots: async () => {
        try {
            // 对应后端: @GetMapping("/avaliable") public List<Long> getAvaliableBots()
            const res = await request.get<number[]>('/api/bot/avaliable');
            // @ts-ignore axios 拦截器处理后可能直接返回 data，根据你的封装调整
            const ids = res.data || res;

            if (Array.isArray(ids)) {
                set({ availableBots: ids });
            }
        } catch (error) {
            console.error("获取机器人列表失败", error);
        }
    },

    switchBot: async (botId: number) => {
        set({ isLoading: true });
        try {
            const res = await request.get<BotInfo>(`/api/bot/info/${botId}`);
            const info = res.data;

            set({
                currentBotId: botId,
                currentBotInfo: info,
                isLoading: false
            });
            toast.success(`已切换至: ${info?.nickname}`);
        } catch (error) {
            console.error(`获取机器人 ${botId} 信息失败`, error);
            toast.error("获取机器人信息失败");
            set({ isLoading: false });
        }
    },

    initBots: async () => {
        const { fetchAvailableBots, switchBot, currentBotId } = get();

        // 1. 获取列表
        await fetchAvailableBots();

        // 2. 获取更新后的列表状态
        const { availableBots } = get();

        // 3. 如果有机器人，且当前没有选中(或者选中的不在列表中)，默认选中第一个
        if (availableBots.length > 0) {
            // 如果还没选，或者选的不在线了，就选第一个
            if (!currentBotId || !availableBots.includes(currentBotId)) {
                await switchBot(availableBots[0]);
            }
        } else {
            set({ currentBotId: null, currentBotInfo: null });
        }
    }
}));
