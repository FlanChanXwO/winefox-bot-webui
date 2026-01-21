"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
    Card, CardBody, Button, Chip, Switch, Tooltip,
    Table, TableHeader, TableBody, TableColumn, TableRow, TableCell,
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, useDisclosure,
    Select, SelectItem, Spinner, Popover, PopoverTrigger, PopoverContent, Tabs, Tab
} from "@nextui-org/react";
import {
    CalendarClock, Plus, Play, Trash2, Edit,
    MessageCircle, Users, Terminal, RefreshCw, AlertCircle, Check, Clock
} from "lucide-react";
import { toast } from "sonner";
import { useBotStore } from "@/store/useBotStore";
import {
    getScheduleList,
    getTaskTypes,
    saveScheduleTask,
    updateTaskStatus,
    triggerTask,
    removeTask,
    ScheduleTask,
    TaskTypeOption,
    TargetType,
    TaskSaveRequest
} from "@/api/schedule";

// 映射前端 Tab 到后端枚举
const TAB_MAP: Record<string, TargetType> = {
    'group': 'GROUP',
    'private': 'PRIVATE'
};

/**
 * 简单的 Cron 生成器组件
 */
const CronGeneratorPopup = ({ onSelect }: { onSelect: (cron: string) => void }) => {
    const [mode, setMode] = useState<"interval" | "daily" | "weekly">("interval");

    // 状态
    const [intervalMin, setIntervalMin] = useState("30");
    const [dailyTime, setDailyTime] = useState("08:00");
    const [weeklyDay, setWeeklyDay] = useState("2"); // 1=SUN, 2=MON... Java Calendar
    const [weeklyTime, setWeeklyTime] = useState("09:00");

    const handleApply = () => {
        let cron = "";
        switch (mode) {
            case "interval":
                // 每隔 N 分钟 (例如 0 0/30 * * * *)
                cron = `0 0/${intervalMin} * * * *`;
                break;
            case "daily":
                // 每天 HH:mm:00 (例如 0 0 8 * * *)
                const [dHour, dMin] = dailyTime.split(":");
                cron = `0 ${Number(dMin)} ${Number(dHour)} * * *`;
                break;
            case "weekly":
                // 每周 [周几] HH:mm:00 (例如 0 0 9 * * MON)
                const [wHour, wMin] = weeklyTime.split(":");
                const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
                const dayStr = days[Number(weeklyDay) - 1] || "MON";
                // 日(Day of month) 也要用 *，而不是 ?
                cron = `0 ${Number(wMin)} ${Number(wHour)} * * ${dayStr}`;
                break;
        }
        onSelect(cron);
        toast.success("Cron 表达式已生成");
    };

    return (
        <div className="w-[320px] px-1 py-2">
            <Tabs
                size="sm"
                aria-label="Cron Options"
                selectedKey={mode}
                onSelectionChange={(k) => setMode(k as any)}
                className="mb-3"
                fullWidth
            >
                <Tab key="interval" title="间隔执行" />
                <Tab key="daily" title="每天执行" />
                <Tab key="weekly" title="每周执行" />
            </Tabs>

            <div className="flex flex-col gap-4 min-h-[80px] justify-center">
                {mode === "interval" && (
                    <Input
                        label="每隔多少分钟"
                        type="number"
                        size="sm"
                        endContent={<span className="text-small text-default-400">分</span>}
                        value={intervalMin}
                        onValueChange={setIntervalMin}
                    />
                )}

                {mode === "daily" && (
                    <Input
                        label="每天执行时间"
                        type="time"
                        size="sm"
                        value={dailyTime}
                        onValueChange={setDailyTime}
                    />
                )}

                {mode === "weekly" && (
                    <div className="flex gap-2">
                        <Select
                            label="周几"
                            size="sm"
                            className="w-1/2"
                            selectedKeys={[weeklyDay]}
                            onChange={(e) => setWeeklyDay(e.target.value)}
                        >
                            <SelectItem key="2">周一</SelectItem>
                            <SelectItem key="3">周二</SelectItem>
                            <SelectItem key="4">周三</SelectItem>
                            <SelectItem key="5">周四</SelectItem>
                            <SelectItem key="6">周五</SelectItem>
                            <SelectItem key="7">周六</SelectItem>
                            <SelectItem key="1">周日</SelectItem>
                        </Select>
                        <Input
                            label="时间"
                            type="time"
                            size="sm"
                            className="w-1/2"
                            value={weeklyTime}
                            onValueChange={setWeeklyTime}
                        />
                    </div>
                )}
            </div>

            <Button
                size="sm"
                className="w-full mt-4 bg-pink-500 text-white font-bold"
                startContent={<Check size={14}/>}
                onPress={handleApply}
            >
                生成并应用
            </Button>
        </div>
    );
};


export default function ScheduleManager() {
    // --- Store & State ---
    const { currentBotId } = useBotStore();
    const [activeTab, setActiveTab] = useState<string>("group");
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

    // 数据状态
    const [tasks, setTasks] = useState<ScheduleTask[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [taskTypes, setTaskTypes] = useState<TaskTypeOption[]>([]);

    // 表单状态
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState<Partial<TaskSaveRequest>>({
        botId: currentBotId || undefined,
        cronExpression: "",
        parameter: "",
        targetId: undefined,
        targetType: "GROUP",
        taskType: ""
    });

    // --- 数据加载逻辑 ---

    // 1. 初始化加载任务类型 (只加载一次)
    useEffect(() => {
        getTaskTypes().then(res => {
            if (res.success && res.data) {
                setTaskTypes(res.data);
            }
        });
    }, []);

    // 2. 加载任务列表 (当 BotID 变化 或 Tab 变化时)
    const fetchTasks = async () => {
        if (!currentBotId) return;

        setIsLoading(true);
        try {
            const type = TAB_MAP[activeTab];
            const res = await getScheduleList(currentBotId, type);
            if (res.success && res.data) {
                setTasks(res.data);
            } else {
                setTasks([]);
            }
        } catch (error) {
            console.error(error);
            toast.error("加载任务列表失败");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [activeTab, currentBotId]); // 监听 currentBotId 变化

    // --- 交互逻辑 ---

    // 点击新建
    const handleCreateClick = () => {
        if (!currentBotId) {
            toast.error("请先选择一个机器人");
            return;
        }
        setIsEditMode(false);
        setFormData({
            botId: currentBotId,
            targetType: TAB_MAP[activeTab], // 默认选中当前 Tab 的类型
            targetId: undefined,
            taskType: "",
            parameter: "",
            cronExpression: ""
        });
        onOpen();
    };

    // 点击编辑
    const handleEditClick = (task: ScheduleTask) => {
        setIsEditMode(true);
        setFormData({
            botId: task.botId,
            targetType: task.targetType,
            targetId: task.targetId,
            taskType: task.taskType, // Select 组件能自动识别 Key
            parameter: task.parameter || "",
            cronExpression: task.cronExpression
        });
        onOpen();
    };

    // 提交保存
    const handleSubmit = async () => {
        // --- 参数校验 Start ---
        if (!formData.botId || !formData.targetId || !formData.taskType || !formData.cronExpression) {
            toast.warning("请填写必要信息");
            return;
        }

        // 1. 校验 ID 是否为纯数字且大于0
        const idStr = String(formData.targetId);
        const isPureNumber = /^\d+$/.test(idStr);
        if (!isPureNumber || Number(idStr) <= 0) {
            toast.warning(activeTab === 'group' ? "群组ID必须为纯数字ID" : "用户ID必须为纯数字ID");
            return;
        }

        // 2. 校验 Cron 表达式 (简单校验：至少包含5个部分)
        const cronParts = formData.cronExpression.trim().split(/\s+/);
        if (cronParts.length < 5) {
            toast.warning("Cron 表达式格式不正确，至少需要5-6个字段 (秒 分 时 日 月 周)");
            return;
        }
        // --- 参数校验 End ---

        setIsSubmitting(true);
        try {
            const req: TaskSaveRequest = {
                botId: formData.botId,
                targetType: TAB_MAP[activeTab],
                targetId: Number(formData.targetId),
                taskType: formData.taskType,
                parameter: formData.parameter || null,
                cronExpression: formData.cronExpression
            };

            const res = await saveScheduleTask(req);
            if (res.success) {
                toast.success(isEditMode ? "任务已更新" : "任务已创建");
                onClose();
                fetchTasks();
            } else {
                toast.error(res.message || "保存失败");
            }
        } catch (e) {
            toast.error("保存请求异常");
        } finally {
            setIsSubmitting(false);
        }
    };

    // 切换开关状态
    const handleStatusToggle = async (task: ScheduleTask, newStatus: boolean) => {
        // 乐观更新 UI
        const oldTasks = [...tasks];
        setTasks(prev => prev.map(t =>
            (t.taskType === task.taskType && t.targetId === task.targetId) ? { ...t, isEnabled: newStatus } : t
        ));

        try {
            await updateTaskStatus({
                botId: task.botId,
                targetType: task.targetType,
                targetId: task.targetId,
                taskType: task.taskType,
                isEnabled: newStatus
            });
            toast.success(`任务已${newStatus ? '开启' : '关闭'}`);
        } catch (e) {
            // 失败回滚
            setTasks(oldTasks);
            toast.error("状态更新失败");
        }
    };

    // 删除任务
    const handleDelete = async (task: ScheduleTask) => {
        if (!confirm("确定要删除这个调度任务吗？")) return;

        try {
            await removeTask({
                botId: task.botId,
                targetType: task.targetType,
                targetId: task.targetId,
                taskType: task.taskType
            });
            toast.success("任务已删除");
            fetchTasks();
        } catch (e) {
            toast.error("删除失败");
        }
    };

    // 立即触发
    const handleTrigger = async (task: ScheduleTask) => {
        try {
            await triggerTask({
                botId: task.botId,
                targetType: task.targetType,
                targetId: task.targetId,
                taskType: task.taskType
            });
            toast.success("指令已发送");
        } catch (e) {
            toast.error("触发失败");
        }
    };

    // --- 辅助逻辑 ---

    // 任务类型选择变化时，自动填充 Placeholder
    const handleTaskTypeChange = (keys: any) => {
        const selectedKey = Array.from(keys)[0] as string;
        const typeInfo = taskTypes.find(t => t.key === selectedKey);

        setFormData(prev => ({
            ...prev,
            taskType: selectedKey,
            // 只有当参数为空时，才自动填充示例
            parameter: (!prev.parameter && typeInfo?.paramExample) ? typeInfo.paramExample : prev.parameter
        }));
    };

    // 当前选中类型的参数提示
    const currentTypeParamExample = useMemo(() => {
        const type = taskTypes.find(t => t.key === formData.taskType);
        return type?.paramExample || "例如: daily";
    }, [formData.taskType, taskTypes]);

    // 运行中的任务计数
    const activeCount = useMemo(() => tasks.filter(t => t.isEnabled).length, [tasks]);

    // --- 表格渲染定义 ---
    const columns = [
        { name: "任务描述 / ID", uid: "info" },
        { name: "类型 / 参数", uid: "type" },
        { name: "Cron 表达式", uid: "cron" },
        { name: "状态", uid: "status" },
        { name: "操作", uid: "actions" },
    ];

    const renderCell = React.useCallback((task: ScheduleTask, columnKey: React.Key) => {
        switch (columnKey) {
            case "info":
                return (
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${activeTab === 'group' ? 'bg-pink-100 text-pink-500' : 'bg-purple-100 text-purple-500'}`}>
                            {activeTab === 'group' ? <Users size={18} /> : <MessageCircle size={18} />}
                        </div>
                        <div className="flex flex-col">
                            {/* 优先显示中文名 */}
                            <span className="font-bold text-gray-700 text-sm">
                                {taskTypes.find(t => t.key === task.taskType)?.name || task.taskType}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">ID: {task.targetId}</span>
                        </div>
                    </div>
                );
            case "type":
                return (
                    <div className="flex flex-col gap-1">
                        <Chip size="sm" variant="flat" className="bg-blue-50 text-blue-500 font-bold h-6 max-w-fit">
                            {task.taskType}
                        </Chip>
                        {task.parameter && (
                            <span className="text-[10px] text-gray-400 pl-1">
                                参数: <span className="font-mono text-gray-500">{task.parameter}</span>
                            </span>
                        )}
                    </div>
                );
            case "cron":
                return (
                    <div className="flex items-center gap-2">
                        <Tooltip content="点击测试 Cron 下次执行时间" color="foreground">
                            <Chip
                                variant="bordered"
                                className="font-mono border-pink-200 text-pink-500 bg-pink-50 cursor-pointer hover:bg-pink-100"
                                size="sm"
                            >
                                <CalendarClock size={12} className="inline mr-1" />
                                {task.cronExpression}
                            </Chip>
                        </Tooltip>
                    </div>
                );
            case "status":
                return (
                    <Switch
                        size="sm"
                        color="danger"
                        isSelected={task.isEnabled}
                        onValueChange={(isSelected) => handleStatusToggle(task, isSelected)}
                        aria-label="Toggle task"
                        classNames={{
                            wrapper: "group-data-[selected=true]:bg-pink-400",
                        }}
                    />
                );
            case "actions":
                return (
                    <div className="relative flex items-center gap-2">
                        <Tooltip content="立即执行一次" color="foreground" className="text-xs">
                            <span
                                onClick={() => handleTrigger(task)}
                                className="text-lg text-gray-400 cursor-pointer active:opacity-50 hover:text-green-500">
                                <Play size={18} />
                            </span>
                        </Tooltip>
                        <Tooltip content="编辑任务" color="foreground" className="text-xs">
                            <span
                                onClick={() => handleEditClick(task)}
                                className="text-lg text-gray-400 cursor-pointer active:opacity-50 hover:text-blue-500">
                                <Edit size={18} />
                            </span>
                        </Tooltip>
                        <Tooltip color="danger" content="删除任务" className="text-xs">
                            <span
                                onClick={() => handleDelete(task)}
                                className="text-lg text-danger cursor-pointer active:opacity-50">
                                <Trash2 size={18} />
                            </span>
                        </Tooltip>
                    </div>
                );
            default:
                return null;
        }
    }, [activeTab, taskTypes, tasks]);

    // --- 未选择机器人时的渲染 ---
    if (!currentBotId) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 gap-4">
                <AlertCircle size={48} className="text-pink-300" />
                <p>请选择一个在线的机器人</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-4 lg:p-6 gap-6 w-full">

            {/* --- 顶部标题栏 --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                <div className="flex items-center gap-2 text-pink-500 font-bold text-xl">
                    <CalendarClock className="animate-pulse" />
                    <h1>调度任务管理</h1>
                    <Chip size="sm" className="bg-pink-100 text-pink-500 font-bold ml-2">
                        运行中: {activeCount}
                    </Chip>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <Button isIconOnly variant="flat" onPress={fetchTasks} isLoading={isLoading}>
                        <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                    </Button>

                    {/* Tab 切换 */}
                    <div className="flex bg-white p-1 rounded-xl shadow-sm border border-pink-50">
                        <button
                            onClick={() => setActiveTab('group')}
                            className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'group' ? 'bg-pink-400 text-white shadow-md shadow-pink-200' : 'text-gray-400 hover:text-pink-400'}`}
                        >
                            <Users size={14} /> 群组推送
                        </button>
                        <button
                            onClick={() => setActiveTab('private')}
                            className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'private' ? 'bg-pink-400 text-white shadow-md shadow-pink-200' : 'text-gray-400 hover:text-pink-400'}`}
                        >
                            <MessageCircle size={14} /> 私聊推送
                        </button>
                    </div>

                    <Button
                        className="bg-pink-400 text-white font-bold shadow-md shadow-pink-200"
                        endContent={<Plus size={18} />}
                        onPress={handleCreateClick}
                    >
                        新建任务
                    </Button>
                </div>
            </div>

            {/* --- 任务列表 --- */}
            <Card className="shadow-sm border-none bg-white flex-1 overflow-hidden">
                <CardBody className="p-0">
                    <Table
                        aria-label="Schedule tasks table"
                        removeWrapper
                        className="h-full overflow-y-auto custom-scrollbar p-4"
                    >
                        <TableHeader columns={columns}>
                            {(column) => (
                                <TableColumn
                                    key={column.uid}
                                    align={column.uid === "actions" ? "end" : "start"}
                                    className="bg-pink-50/50 text-pink-500 font-bold text-xs uppercase"
                                >
                                    {column.name}
                                </TableColumn>
                            )}
                        </TableHeader>
                        <TableBody
                            items={tasks}
                            emptyContent={isLoading ? <Spinner color="current" /> : "暂无调度任务"}
                            isLoading={isLoading}
                        >
                            {(item) => (
                                <TableRow key={`${item.targetId}-${item.taskType}`} className="hover:bg-pink-50/20 transition-colors border-b border-gray-50 last:border-none">
                                    {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>

            {/* --- 弹窗 --- */}
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                placement="top-center"
                backdrop="blur"
                classNames={{
                    base: "border-none shadow-xl bg-white",
                    header: "border-b border-gray-100",
                    footer: "border-t border-gray-100",
                    closeButton: "hover:bg-pink-100 active:bg-pink-200",
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-pink-500 font-bold text-lg">
                                {activeTab === 'group' ? '群组推送任务' : '私聊推送任务'}
                                <span className="text-xs text-gray-400 font-normal">
                                    {isEditMode ? "编辑任务配置" : "添加一个新的自动化 Cron 调度"}
                                </span>
                            </ModalHeader>
                            <ModalBody className="py-6">
                                <Input
                                    autoFocus={!isEditMode}
                                    isDisabled={isEditMode}
                                    label={activeTab === 'group' ? "群组 ID (Group ID)" : "用户 ID (User ID)"}
                                    placeholder="输入纯数字 ID"
                                    variant="bordered"
                                    // 移除 type="number" 以便手动验证纯数字 (防止 e/./+ 等字符被浏览器自动处理或放行)
                                    // 或者保留 type="number" 但在 onChange 中清洗
                                    value={formData.targetId?.toString() || ''}
                                    onValueChange={(val) => {
                                        // 只能输入数字
                                        if (val === '' || /^\d+$/.test(val)) {
                                            setFormData({ ...formData, targetId: val ? Number(val) : undefined })
                                        }
                                    }}
                                    errorMessage={
                                        formData.targetId && !/^\d+$/.test(formData.targetId.toString())
                                            ? "ID必须为纯数字" : ""
                                    }
                                    startContent={<Terminal className="text-gray-400" size={16} />}
                                />
                                <div className="flex gap-3">
                                    <Select
                                        label="任务类型"
                                        variant="bordered"
                                        className="flex-1"
                                        isDisabled={isEditMode}
                                        selectedKeys={formData.taskType ? [formData.taskType] : []}
                                        onSelectionChange={handleTaskTypeChange}
                                    >
                                        {taskTypes.map((type) => {
                                            if (type.targetType != 'global' && type.targetType !== activeTab) {
                                                return null
                                            }

                                            return (
                                                <SelectItem key={type.key} textValue={type.name}>
                                                    <div className="flex flex-col">
                                                        <span className="text-small">{type.name}</span>
                                                        <span className="text-tiny text-default-400">{type.description}</span>
                                                    </div>
                                                </SelectItem>
                                            )
                                        })}
                                    </Select>
                                    <Input
                                        label="参数 (Param)"
                                        placeholder={currentTypeParamExample}
                                        variant="bordered"
                                        className="flex-1"
                                        value={formData.parameter || ''}
                                        onValueChange={(val) => setFormData({ ...formData, parameter: val })}
                                    />
                                </div>

                                <div className="flex gap-2 items-end">
                                    <Input
                                        label="Cron 表达式"
                                        placeholder="* * * * *"
                                        variant="bordered"
                                        className="flex-1"
                                        description="格式: 秒 分 时 日 月 周 (6位)"
                                        value={formData.cronExpression || ''}
                                        onValueChange={(val) => setFormData({ ...formData, cronExpression: val })}
                                    />

                                    <Popover placement="top" showArrow offset={10}>
                                        <PopoverTrigger>
                                            <Button isIconOnly className="bg-pink-100 text-pink-500 mb-6 h-10 w-10">
                                                <Clock size={20} />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <CronGeneratorPopup
                                                onSelect={(cron) => setFormData(prev => ({ ...prev, cronExpression: cron }))}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="flat" onPress={onClose} className="font-bold">
                                    取消
                                </Button>
                                <Button
                                    className="bg-pink-400 text-white font-bold shadow-lg shadow-pink-200"
                                    onPress={handleSubmit}
                                    isLoading={isSubmitting}
                                >
                                    {isEditMode ? "更新任务" : "保存任务"}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
