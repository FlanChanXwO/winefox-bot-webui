import request from "@/utils/request";
import {RankingItem} from "@/api/stats";

// 获取活跃群组统计
export const getActiveGroupStats = (range: string = 'WEEK') => {
    return request.get<RankingItem[]>('/api/group/stats', { params: { range } });
};
