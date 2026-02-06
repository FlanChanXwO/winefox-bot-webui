import request from '@/utils/request';
import {RankingItem} from "@/api/stats";

export type PluginType = 'ACTIVE' | 'PASSIVE'

// 对应后端的 PluginListItemResponse
export interface PluginListItem {
    id: string;
    name: string;
    description: string;
    version: string;
    author: string;
    type: PluginType;
    enabled: boolean;
    builtIn: boolean;
    hasConfig: boolean;
    canDisable: boolean;
}

// 对应后端的 PluginConfigSchemaResponse及其内部类
export interface PluginConfigField {
    key: string;
    label: string;
    description: string;
    type: string; // string, number, bool, select, array, map
    itemType?: string;
    value: any;
    defaultValue: any;
    options?: Array<{ [key: string]: string }>;
}

export interface PluginConfigSchema {
    pluginName: string;
    description: string;
    allowedScopes: string[];
    fields: PluginConfigField[];
}

// 对应后端的 UpdateConfigRequest
export interface UpdateConfigReq {
    scope?: string;
    scopeId?: string;
    key: string;
    value: any;
    description?: string;
    group?: string;
}

export interface ConfigItem {
    key: string;
    value: any;
    description: string;
    group: string;
    scope: string;   // "global", "group", "user"
    scopeId: string; // "default", "123456", etc.
    updatedAt: string;
}


export interface InvokeSummaryResponse {
    total: number;
    day: number;
    week: number;
    month: number;
    year: number;
}


const pluginApi = {
    /**
     * 获取插件列表
     * @param keyword 搜索关键词 (可选)
     */
    getList: (keyword?: string) => {
        return request.get<PluginListItem[]>('/api/plugins/list', {
            params: { keyword }
        });
    },

    /**
     * 切换插件状态 (开启/关闭)
     */
    toggle: (pluginId: string, enable: boolean) => {
        return request.post<void>(`/api/plugins/${pluginId}/toggle`, null, {
            params: { enable }
        });
    },

    /**
     * 获取插件配置 Schema
     */
    getConfigSchema: (pluginId: string) => {
        return request.get<PluginConfigSchema>(`/api/plugins/${pluginId}/config-schema`);
    },

    /**
     * 保存插件配置
     */
    saveConfig: (data: UpdateConfigReq) => {
        return request.post<void>('/api/plugins/config/save', data);
    },
    /**
     * 获取指定作用域下的配置列表
     */
    getConfigList: (scope: string, scopeId: string) => {
        return request.get<ConfigItem[]>('/api/plugins/config/list', {
            params: { scope, scopeId }
        });
    },

    /**
     * 删除/重置指定配置
     */
    deleteConfig: (key: string, scope: string, scopeId: string) => {
        return request.delete<void>('/api/plugins/config/delete', {
            params: { key, scope, scopeId }
        });
    },
    /**
     * 重置插件在指定作用域下的所有配置 (整组删除)
     */
    resetPluginScope: (pluginId: string, scope: string, scopeId: string) => {
        return request.delete<void>('/api/plugins/config/reset-scope', {
            params: { pluginId, scope, scopeId }
        });
    },
    // 获取热门插件趋势
    getHotPluginRanking: (range: string = 'WEEK') => {
        return request.get<RankingItem[]>('/api/plugins/hot-trends', { params: { range } });
    },


    getInvokeSummary: () => {
        return request.get<InvokeSummaryResponse>('/api/plugins/summary');
    },
};

export default pluginApi;
