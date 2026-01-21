import request from "@/utils/request";

/**
 * 消息统计响应结构
 * 对应后端 MessageStatisticsResponse
 */
export interface MessageStatisticsResponse {
    total: number;
    today: number;
    oneDay: number;   // 一日内
    oneWeek: number;  // 一周内
    oneMonth: number; // 一月内
    oneYear: number;  // 一年内
}

/**
 * 获取消息统计概览
 * GET /api/stats/messages/overview
 */
export const getMessageStatistics = (botId : number) => {
    return request.get<MessageStatisticsResponse>(`/api/stats/messages/overview/${botId}`);
};
