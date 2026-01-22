import request from "@/utils/request";

// --- 类型定义 ---

/**
 * 1. 配置项实体
 */
export interface ConfigItem {
    label: string;
    value: string;
    description: string;
    order: number;
}

/**
 * 2. 连接日志实体
 */
export type ConnectionEventType = 'CONNECT' | 'DISCONNECT' | 'RECONNECT' | 'ERROR';

export interface ConnectionLog {
    id: number;
    botId: number;
    eventType: ConnectionEventType;
    eventDetail?: string;
    createdAt: string;
}

/**
 * 3. 分页通用结构
 */
export interface PageResult<T> {
    records: T[];
    total: number;
    size: number;
    current: number;
    pages: number;
}

/**
 * 4. 连接概览响应 (对应 ConnectionSummaryResponse)
 */
export interface ConnectionSummaryResponse {
    totalLoginCount: number;      // 累计登录次数
    connectionDuration: string;     // 连接时长字符串
    connectionDate: string | null; // 连接日期
}


export interface RankingItem {
    id: string;
    name: string;
    value: number;
}

// --- API 函数 ---

/**
 * 获取系统配置
 * GET /api/system/config
 */
export const getSystemConfigs = () => {
    return request.get<ConfigItem[]>('/api/system/config');
};

/**
 * 获取连接日志（分页）
 * GET /api/logs/connection
 */
export const getConnectionLogs = (botId: number, page: number = 1, size: number = 5) => {
    return request.get<PageResult<ConnectionLog>>('/api/logs/connection', {
        params: { botId, page, size }
    });
};

/**
 * 获取连接统计概览
 * GET /api/logs/summary
 */
export const getConnectionSummary = (botId: number) => {
    return request.get<ConnectionSummaryResponse>('/api/logs/summary', {
        params: { botId }
    });
};
