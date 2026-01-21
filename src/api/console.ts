import request from "@/utils/request";

/**
 * 对应后端 ConsoleStatsResponse.TrendChartData
 */
export interface TrendChartData {
    dates: string[];      // X轴：日期 (MM-dd)
    msgCounts: number[];  // Y轴1：消息统计
    callCounts: number[]; // Y轴2：调用统计
}

/**
 * 对应后端 ConsoleStatsResponse
 */
export interface ConsoleStatsResponse {
    trend: TrendChartData;
}

/**
 * 获取首页仪表盘统计数据 (包含折线图数据)
 */
export const getConsoleStats = () => {
    return request.get<ConsoleStatsResponse>('/api/console/stats', {
        timeout: 10000 // 单独将此请求的超时时间延长至 10 秒
    });
};
