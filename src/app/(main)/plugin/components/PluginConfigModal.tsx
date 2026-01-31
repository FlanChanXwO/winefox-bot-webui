// src/app/(home)/components/PluginList/components/PluginConfigModal.tsx
"use client";

import React, {useCallback, useEffect, useMemo, useState} from "react";
import {
    Autocomplete,
    AutocompleteItem,
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    SelectItem,
    Spinner,
    Tab,
    Tabs
} from "@nextui-org/react";
import {Edit, Globe, List, RefreshCw, Save, Settings, Trash2, User, Users} from "lucide-react";
import pluginApi, {ConfigItem, PluginConfigSchema} from "@/api/plugin";
import {toast} from "sonner";
import ConfigFormRender from "./ConfigFormRender";
import friendGroupApi from "@/api/friendGroup";
import userApi from "@/api/user";

const SCOPE_OPTIONS: Record<string, { label: string, icon: React.ReactNode }> = {
    GLOBAL: {label: "全局配置", icon: <Globe size={16}/>},
    GROUP: {label: "群组专用", icon: <Users size={16}/>},
    USER: {label: "用户专用", icon: <User size={16}/>}
};

interface PluginConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    pluginId: string | null;
}

// 辅助类型：按 ScopeID 分组后的结构
interface GroupedConfig {
    scope: string;
    scopeId: string;
    items: ConfigItem[];
}

export default function PluginConfigModal({isOpen, onClose, pluginId}: PluginConfigModalProps) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [schema, setSchema] = useState<PluginConfigSchema | null>(null);

    // 表单状态 (Tab 1)
    const [targetScope, setTargetScope] = useState<string>("GLOBAL");
    const [targetScopeId, setTargetScopeId] = useState<string>("");
    const [formValues, setFormValues] = useState<Record<string, any>>({});

    // 列表状态 (Tab 2)
    const [activeTab, setActiveTab] = useState<string>("form");
    const [rawConfigList, setRawConfigList] = useState<ConfigItem[]>([]); // 原始列表
    const [listLoading, setListLoading] = useState(false);
    // 列表筛选状态
    const [listFilterScope, setListFilterScope] = useState<string>("GLOBAL");
    // 建议 ID 列表 (用于 Autocomplete)
    const [suggestedIds, setSuggestedIds] = useState<string[]>([]);
    const [idLoading, setIdLoading] = useState(false);

    // 计算属性：将列表按 ID 分组
    const groupedConfigs = useMemo(() => {
        const groups: Record<string, GroupedConfig> = {};

        rawConfigList.forEach(item => {
            // 唯一键: scope + scopeId
            const key = `${item.scope}_${item.scopeId}`;
            if (!groups[key]) {
                groups[key] = {
                    scope: item.scope,
                    scopeId: item.scopeId,
                    items: []
                };
            }
            groups[key].items.push(item);
        });

        // 排序：全局在前，其他按 ID 排序
        return Object.values(groups).sort((a, b) => {
            if (a.scope === 'global') return -1;
            if (b.scope === 'global') return 1;
            return a.scopeId.localeCompare(b.scopeId);
        });
    }, [rawConfigList]);

    // 获取用于“表单保存”的 scopeId
    const getFinalFormScopeId = useCallback(() => {
        return targetScope === "GLOBAL" ? "default" : targetScopeId.trim();
    }, [targetScope, targetScopeId]);

    // 1. 加载 Schema
    const loadSchema = async () => {
        if (!pluginId) return;
        setLoading(true);
        try {
            const res = await pluginApi.getConfigSchema(pluginId);
            if (res.success && res.data) {
                setSchema(res.data);
                const initValues: Record<string, any> = {};
                // 防御性检查：确保 fields 存在
                if (res.data.fields && Array.isArray(res.data.fields)) {
                    res.data.fields.forEach(field => {
                        initValues[field.key] = field.value ?? field.defaultValue;
                    });
                }
                setFormValues(initValues);
            } else {
                toast.error(res.message || "获取配置失败");
                onClose();
            }
        } catch (error) {
            toast.error("获取配置发生错误");
        } finally {
            setLoading(false);
        }
    };

    // 2. 加载列表 (修改逻辑：查询全部)
    const loadConfigList = async () => {
        setListLoading(true);
        try {
            const queryId = listFilterScope === "GLOBAL" ? "default" : undefined;
            const res = await pluginApi.getConfigList(listFilterScope, queryId || "");
            if (res.success && res.data) {
                // 安全获取前缀，防止 schema.fields 为空导致报错
                const prefix = schema?.fields?.[0]?.key?.split('.')[0];
                const filtered = prefix
                    ? res.data.filter(item => item.key.startsWith(prefix))
                    : res.data;
                setRawConfigList(filtered);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setListLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && pluginId) {
            setTargetScope("GLOBAL");
            setTargetScopeId("");
            setListFilterScope("GLOBAL"); // 默认看全局列表
            setActiveTab("form");
            loadSchema();
        }
    }, [isOpen, pluginId]);

    // 切换 tab 或 切换列表筛选时加载
    useEffect(() => {
        if (activeTab === "list") {
            loadConfigList();
        }
    }, [activeTab, listFilterScope]);

    // 保存单项 (表单页)
    const handleSave = async () => {
        if (!schema) return;
        const finalScopeId = getFinalFormScopeId();

        if (targetScope !== "GLOBAL" && !finalScopeId) {
            toast.warning(`请填写${targetScope === 'GROUP' ? '群号' : 'QQ号'}`);
            return;
        }

        setSaving(true);
        try {
            const promises = schema.fields.map(field => {
                const val = formValues[field.key];
                return pluginApi.saveConfig({
                    scope: targetScope,
                    scopeId: finalScopeId,
                    key: field.key,
                    group: schema?.pluginName,
                    value: val,
                    description: field.description
                });
            });
            await Promise.all(promises);
            toast.success("配置已保存");
        } catch (error) {
            toast.error("保存失败");
        } finally {
            setSaving(false);
        }
    };

    // 删除单项 (列表页)
    const handleDeleteItem = async (key: string, scope: string, scopeId: string) => {
        try {
            const res = await pluginApi.deleteConfig(key, scope, scopeId);
            if (res.success) {
                toast.success("配置项已重置");
                loadConfigList();
            }
        } catch (e) {
            toast.error("操作失败");
        }
    };

    // 删除整组 (列表页)
    const handleDeleteGroup = async (group: GroupedConfig) => {
        if (!pluginId) return;
        if (!confirm(`确定要重置 [${group.scope} : ${group.scopeId}] 下的所有配置吗？`)) return;

        try {
            // 调用新的批量删除 API (需要在 api/plugin.ts 补充定义，或循环调用)
            // 这里假设我们在 api/plugin.ts 增加了 resetScope 方法
            // 如果没有，可以用循环调用 deleteItem 模拟
            const res = await pluginApi.resetPluginScope(pluginId, group.scope, group.scopeId);
            if (res.success) {
                toast.success("整组配置已重置");
                loadConfigList();
                // 如果删的是当前正在查看的表单 scope，刷新表单
                if (group.scope === targetScope && group.scopeId === getFinalFormScopeId()) {
                    loadSchema();
                }
            }
        } catch (e) {
            toast.error("操作失败");
        }
    };


    const handleEditGroup = (group: GroupedConfig) => {
        if (!schema) return;

        // 1. 切换 Tab
        setActiveTab("form");

        // 2. 填充作用域
        // 确保 Scope 大写匹配 Select 的 key
        const scopeKey = group.scope.toUpperCase();
        setTargetScope(scopeKey);

        // 如果是全局，ID 留空；否则填入 ID
        const newId = (scopeKey === "GLOBAL" || group.scopeId === "default") ? "" : group.scopeId;
        setTargetScopeId(newId);

        // 3. 填充表单值
        const newValues: Record<string, any> = {};

        if (schema.fields && schema.fields.length > 0) {
            schema.fields.forEach(field => {
                // 默认使用 Schema 定义的默认值
                let val = field.defaultValue;

                // 在当前选中的组中查找是否有已保存的配置项
                const savedItem = group.items.find(item => item.key === field.key);

                // 如果找到了，覆盖默认值
                if (savedItem) {
                    val = savedItem.value;
                }
                newValues[field.key] = val;
            });
        } else {
            console.warn("Schema fields is empty, cannot populate form.");
        }

        setFormValues(newValues);
        toast.info(`已加载 [${scopeKey} : ${group.scopeId}] 的配置，修改后请点击保存`);
    };

    const loadSuggestedIds = async (scope: string) => {
        setSuggestedIds([]); // 清空旧数据
        if (scope === "GLOBAL") return;

        setIdLoading(true);
        try {
            let ids: number[] = [];
            if (scope === "GROUP") {
                // 如果后端返回的是 Result 包装，这里可能需要 res.data。
                // 根据你的 Controller 代码是直接返回 List，request 拦截器通常会处理 data 层
                const res = await friendGroupApi.getGroupIds();
                // 假设 request 工具处理后直接返回数据，或者 res.data 是数据
                // 这里做个简单的兼容处理，具体看你的 request 封装
                ids = Array.isArray(res) ? res : (res as any)?.data || [];
            } else if (scope === "USER") {
                const res = await userApi.getUserIds();
                ids = Array.isArray(res) ? res : (res as any)?.data || [];
            }
            // 转换为字符串供 Autocomplete 使用
            setSuggestedIds(ids.map(String));
        } catch (e) {
            console.error("加载ID建议列表失败", e);
            // 不弹窗报错，以免打扰用户，仅仅是没补全而已
        } finally {
            setIdLoading(false);
        }
    };

    useEffect(() => {
        if (targetScope === "GROUP" || targetScope === "USER") {
            loadSuggestedIds(targetScope);
        }
    }, [targetScope]);

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} scrollBehavior="inside" backdrop="blur" size="2xl">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 border-b border-gray-100 pr-10 pb-3">
                            <div className="flex flex-col items-start gap-1">
                                <span className="text-lg font-bold leading-tight">
                                    {schema?.pluginName || '插件'} 配置
                                </span>
                                {schema?.description && (<span className="text-xs font-normal text-gray-500 leading-normal break-all"> {schema.description}</span>)}
                            </div>
                        </ModalHeader>


                        <ModalBody className="py-4 bg-gray-50/30">
                            {loading ? (
                                <div className="flex justify-center py-10"><Spinner label="加载中..."/></div>
                            ) : (
                                <div className="flex flex-col h-full">
                                    <Tabs
                                        aria-label="Config Mode"
                                        selectedKey={activeTab}
                                        onSelectionChange={(k) => setActiveTab(String(k))}
                                        color="primary"
                                        variant="solid"
                                        className="mb-4"
                                    >
                                        <Tab key="form" title={
                                            <div className="flex items-center space-x-2">
                                                <Settings size={16}/><span>新增/修改配置</span>
                                            </div>
                                        }>
                                            <div className="flex flex-col gap-4">
                                                {/* 表单页的作用域选择 */}
                                                {schema?.allowedScopes && schema.allowedScopes.length > 0 && (
                                                    <div
                                                        className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                                        <div
                                                            className="text-xs font-bold text-gray-500 mb-2 ml-1">配置目标
                                                        </div>
                                                        <div className="flex gap-3 items-end">
                                                            <Select
                                                                label="作用域"
                                                                size="sm"
                                                                className="flex-1"
                                                                selectedKeys={[targetScope]}
                                                                onChange={(e) => {
                                                                    if (e.target.value) setTargetScope(e.target.value);
                                                                }}
                                                                startContent={SCOPE_OPTIONS[targetScope]?.icon}
                                                            >
                                                                {schema.allowedScopes.map(scope => (
                                                                    <SelectItem key={scope}
                                                                                textValue={SCOPE_OPTIONS[scope]?.label}>
                                                                        <div className="flex items-center gap-2">
                                                                            {SCOPE_OPTIONS[scope]?.icon}
                                                                            <span>{SCOPE_OPTIONS[scope]?.label}</span>
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </Select>

                                                            {targetScope !== "GLOBAL" && (
                                                                <Autocomplete
                                                                    label={targetScope === "GROUP" ? "群号" : "QQ号"}
                                                                    placeholder="输入或选择 ID..."
                                                                    size="sm"
                                                                    className="flex-[0.8]"
                                                                    allowsCustomValue // 允许输入列表中没有的 ID
                                                                    inputValue={targetScopeId}
                                                                    onInputChange={(value) => setTargetScopeId(value)}
                                                                    onSelectionChange={(key) => {
                                                                        if (key) setTargetScopeId(String(key));
                                                                    }}
                                                                    isLoading={idLoading}
                                                                >
                                                                    {suggestedIds.map((id) => (
                                                                        <AutocompleteItem key={id} value={id}>
                                                                            {id}
                                                                        </AutocompleteItem>
                                                                    ))}
                                                                </Autocomplete>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex flex-col gap-3 px-1">
                                                    {schema?.fields?.map(field => (
                                                        <ConfigFormRender
                                                            key={field.key}
                                                            field={field}
                                                            value={formValues[field.key]}
                                                            onChange={(val) => setFormValues(prev => ({
                                                                ...prev,
                                                                [field.key]: val
                                                            }))}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </Tab>

                                        <Tab key="list" title={
                                            <div className="flex items-center space-x-2">
                                                <List size={16}/><span>已存配置概览</span>
                                            </div>
                                        }>
                                            <div className="flex flex-col gap-4">
                                                {/* 列表页的筛选器 */}
                                                <div
                                                    className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200">
                                                    <div className="flex gap-2 items-center">
                                                        <span
                                                            className="text-sm font-bold text-gray-600">查看范围:</span>
                                                        <div className="flex gap-1">
                                                            {schema?.allowedScopes.map(scope => (
                                                                <Chip
                                                                    key={scope}
                                                                    size="sm"
                                                                    variant={listFilterScope === scope ? "solid" : "flat"}
                                                                    color={listFilterScope === scope ? "primary" : "default"}
                                                                    className="cursor-pointer"
                                                                    startContent={SCOPE_OPTIONS[scope]?.icon}
                                                                    onClick={() => setListFilterScope(scope)}
                                                                >
                                                                    {SCOPE_OPTIONS[scope]?.label}
                                                                </Chip>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <Button size="sm" isIconOnly variant="light"
                                                            onPress={loadConfigList} isLoading={listLoading}>
                                                        <RefreshCw size={14}/>
                                                    </Button>
                                                </div>

                                                {/* 内容区域：卡片列表 */}
                                                <div
                                                    className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                                                    {listLoading ? (
                                                        <div className="py-8 text-center text-gray-400">加载中...</div>
                                                    ) : groupedConfigs.length === 0 ? (
                                                        <div
                                                            className="py-8 text-center flex flex-col items-center gap-2 text-gray-400">
                                                            <List size={32} className="opacity-20"/>
                                                            <p>该作用域下暂无自定义配置</p>
                                                        </div>
                                                    ) : (
                                                        groupedConfigs.map((group) => (
                                                            <Card key={`${group.scope}_${group.scopeId}`}
                                                                  className="border border-gray-100 shadow-sm">
                                                                <CardHeader
                                                                    className="flex justify-between items-center bg-gray-50/50 px-4 py-2 border-b border-gray-100">
                                                                    <div className="flex items-center gap-2">
                                                                        <div
                                                                            className="bg-white p-1 rounded-full border border-gray-200 text-gray-500">
                                                                            {SCOPE_OPTIONS[group.scope]?.icon ||
                                                                                <Settings size={14}/>}
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span
                                                                                className="text-sm font-bold text-gray-700">
                                                                                {SCOPE_OPTIONS[group.scope]?.label}
                                                                            </span>
                                                                            <span
                                                                                className="text-[10px] font-mono text-gray-400">
                                                                                ID: {group.scopeId}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        size="sm"
                                                                        color="primary"
                                                                        variant="light"
                                                                        startContent={<Edit size={14}/>}
                                                                        onPress={() => handleEditGroup(group)}
                                                                    >
                                                                        编辑
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        color="danger"
                                                                        variant="light"
                                                                        startContent={<Trash2 size={14}/>}
                                                                        onPress={() => handleDeleteGroup(group)}
                                                                    >
                                                                        整组重置
                                                                    </Button>
                                                                </CardHeader>
                                                                <CardBody className="px-4 py-2 gap-2">
                                                                    {group.items.map(item => (
                                                                        <div key={item.key}
                                                                             className="flex justify-between items-center py-2 border-b border-gray-50 last:border-none">
                                                                            <div
                                                                                className="flex flex-col gap-0.5 overflow-hidden">
                                                                                <span
                                                                                    className="text-xs font-medium text-gray-600 truncate"
                                                                                    title={item.key}>
                                                                                    {item.key}
                                                                                </span>
                                                                                <span
                                                                                    className="text-[10px] text-gray-400 truncate">
                                                                                    {item.description || "无描述"}
                                                                                </span>
                                                                            </div>
                                                                            <div
                                                                                className="flex items-center gap-3 pl-2 flex-shrink-0">
                                                                                <div
                                                                                    className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 max-w-[120px] truncate">
                                                                                    {typeof item.value === 'object' ? JSON.stringify(item.value) : String(item.value)}
                                                                                </div>
                                                                                <Button
                                                                                    size="sm"
                                                                                    isIconOnly
                                                                                    variant="light"
                                                                                    className="text-gray-400 hover:text-red-500 min-w-6 w-6 h-6"
                                                                                    onPress={() => handleDeleteItem(item.key, group.scope, group.scopeId)}
                                                                                >
                                                                                    <Trash2 size={12}/>
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </CardBody>
                                                            </Card>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </Tab>
                                    </Tabs>
                                </div>
                            )}
                        </ModalBody>
                        <ModalFooter className="border-t border-gray-100">
                            <Button variant="light" onPress={onClose}>关闭</Button>
                            {activeTab === 'form' && (
                                <Button
                                    color="primary"
                                    onPress={handleSave}
                                    isLoading={saving}
                                    startContent={!saving && <Save size={16}/>}
                                >
                                    保存当前设置
                                </Button>
                            )}
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
