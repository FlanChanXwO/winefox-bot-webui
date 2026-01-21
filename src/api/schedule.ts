import request from "@/utils/request";

// --- 类型定义 (对应后端的 VO) ---

// 任务类型 (PushTargetType)
export type TargetType = 'GROUP' | 'PRIVATE';

// 任务配置实体 (ShiroScheduleTask)
export interface ScheduleTask {
    botId: number;
    targetType: TargetType;
    targetId: number; // 后端是用 Long，前端用 number (如果ID过大可能需要 string)
    taskType: string;
    parameter: string | null;
    cronExpression: string;
    taskName: string; // 对应后端的 name 或 description
    isEnabled: boolean;
    jobId?: string; // JobRunr 的 ID
}

// 任务类型定义 (TaskTypeResponse)
export interface TaskTypeOption {
    key: string;
    name: string;
    targetType: string;
    description: string;
    paramExample: string;
}

// 保存请求参数 (TaskSaveRequest)
export interface TaskSaveRequest {
    botId: number;
    targetType: TargetType;
    targetId: number;
    cronExpression: string;
    taskType: string;
    parameter: string | null;
}

// 标识符参数 (TaskIdentifier)
export interface TaskIdentifier {
    botId: number;
    targetType: TargetType;
    targetId: number;
    taskType: string;
}

// 状态更新参数 (TaskStatusUpdate)
export interface TaskStatusUpdate extends TaskIdentifier {
    isEnabled: boolean;
}


/**
 * 获取任务列表
 * 注意：后端返回的是混合列表，我们需要在前端或者传递参数时进行筛选
 * @param botId 机器人ID (目前假设是单机器人，你可以写死或者从全局状态取)
 * @param targetType (可选) 筛选类型 GROUP / PRIVATE
 */
export const getScheduleList = (botId: number, targetType?: TargetType, targetId?: number) => {
    return request.get<ScheduleTask[]>('/api/schedule/list', {
        params: { botId, targetType, targetId }
    });
};

/**
 * 获取所有支持的任务类型 (用于下拉框)
 */
export const getTaskTypes = () => {
    return request.get<TaskTypeOption[]>('/api/schedule/types');
};

/**
 * 保存或更新任务
 */
export const saveScheduleTask = (data: TaskSaveRequest) => {
    return request.post<void>('/api/schedule/save', data);
};

/**
 * 切换任务状态 (开启/关闭)
 */
export const updateTaskStatus = (data: TaskStatusUpdate) => {
    return request.put<void>('/api/schedule/status', data);
};

/**
 * 立即触发一次任务
 */
export const triggerTask = (data: TaskIdentifier) => {
    return request.post<void>('/api/schedule/trigger', data);
};

/**
 * 删除任务
 */
export const removeTask = (data: TaskIdentifier) => {
    return request.delete<void>('/api/schedule/remove', { data }); // Axios delete 的 body 需要放在 data 字段里
};
