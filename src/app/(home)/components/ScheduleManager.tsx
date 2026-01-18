"use client";

import React, { useState, useMemo } from "react";
import {
    Card, CardBody, Button, Chip, Switch, Tooltip,
    Table, TableHeader, TableBody, TableColumn, TableRow, TableCell,
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, useDisclosure,
    Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Select, SelectItem
} from "@nextui-org/react";
import {
    CalendarClock, Plus, MoreVertical, Play, Trash2, Edit,
    MessageCircle, Users, Terminal
} from "lucide-react";

// --- 类型定义 ---
type ScheduleType = "group" | "private";

interface ScheduleTask {
    id: number;
    targetId: string; // group_id or user_id
    taskType: string;
    taskParam: string | null;
    cron: string;
    description: string;
    isEnabled: boolean;
    createdAt: string;
}

// --- 模拟数据 (基于你的截图) ---
const mockGroupTasks: ScheduleTask[] = [
    { id: 6, targetId: "1027839334", taskType: "PIXIV_RANK_PUSH", taskParam: "daily", cron: "30 15 * * *", description: "P站每日排行榜", isEnabled: true, createdAt: "2026-01-10" },
    { id: 8, targetId: "1027839334", taskType: "WATER_GROUP_STAT", taskParam: null, cron: "0 22 * * *", description: "每日发言统计推送", isEnabled: true, createdAt: "2026-01-12" },
    { id: 10, targetId: "1027839334", taskType: "DAILY_REPORT", taskParam: null, cron: "0 0 9 * * *", description: "酒狐日报每日推送", isEnabled: true, createdAt: "2026-01-12" },
    { id: 13, targetId: "787828189", taskType: "DAILY_REPORT", taskParam: null, cron: "0 0 9 * * *", description: "酒狐日报每日推送", isEnabled: false, createdAt: "2026-01-16" },
];

const mockPrivateTasks: ScheduleTask[] = [
    { id: 101, targetId: "3238573864", taskType: "MORNING_GREETING", taskParam: "full", cron: "0 7 * * *", description: "早安问候", isEnabled: true, createdAt: "2026-01-15" },
];

export default function ScheduleManager() {
    const [activeTab, setActiveTab] = useState<ScheduleType>("group");
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [tasks, setTasks] = useState(mockGroupTasks); // 简单演示，实际应根据 Tab 切换数据

    // 切换 Tab 时切换数据 (演示用)
    React.useEffect(() => {
        if (activeTab === 'group') setTasks(mockGroupTasks);
        else setTasks(mockPrivateTasks);
    }, [activeTab]);

    // 计算启用的任务数
    const activeCount = useMemo(() => tasks.filter(t => t.isEnabled).length, [tasks]);

    // 定义列
    const columns = [
        { name: "任务描述 / ID", uid: "info" },
        { name: "类型 / 参数", uid: "type" },
        { name: "Cron 表达式", uid: "cron" },
        { name: "状态", uid: "status" },
        { name: "操作", uid: "actions" },
    ];

    // 渲染单元格
    const renderCell = React.useCallback((task: ScheduleTask, columnKey: React.Key) => {
        const cellValue = task[columnKey as keyof ScheduleTask];

        switch (columnKey) {
            case "info":
                return (
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${activeTab === 'group' ? 'bg-pink-100 text-pink-500' : 'bg-purple-100 text-purple-500'}`}>
                            {activeTab === 'group' ? <Users size={18} /> : <MessageCircle size={18} />}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-700 text-sm">{task.description}</span>
                            <span className="text-[10px] text-gray-400 font-mono">ID: {task.targetId}</span>
                        </div>
                    </div>
                );
            case "type":
                return (
                    <div className="flex flex-col gap-1">
                        <Chip size="sm" variant="flat" className="bg-blue-50 text-blue-500 font-bold h-6">
                            {task.taskType}
                        </Chip>
                        {task.taskParam && (
                            <span className="text-[10px] text-gray-400 pl-1">
                                参数: <span className="font-mono text-gray-500">{task.taskParam}</span>
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
                                <CalendarClock size={12} className="inline mr-1"/>
                                {task.cron}
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
                            <span className="text-lg text-gray-400 cursor-pointer active:opacity-50 hover:text-green-500">
                                <Play size={18} />
                            </span>
                        </Tooltip>
                        <Tooltip content="编辑任务" color="foreground" className="text-xs">
                            <span className="text-lg text-gray-400 cursor-pointer active:opacity-50 hover:text-blue-500">
                                <Edit size={18} />
                            </span>
                        </Tooltip>
                        <Tooltip color="danger" content="删除任务" className="text-xs">
                            <span className="text-lg text-danger cursor-pointer active:opacity-50">
                                <Trash2 size={18} />
                            </span>
                        </Tooltip>
                    </div>
                );
            default:
                return cellValue;
        }
    }, [activeTab]);

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
                    {/* 自定义 Tab 切换 */}
                    <div className="flex bg-white p-1 rounded-xl shadow-sm border border-pink-50">
                        <button
                            onClick={() => setActiveTab('group')}
                            className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'group' ? 'bg-pink-400 text-white shadow-md shadow-pink-200' : 'text-gray-400 hover:text-pink-400'}`}
                        >
                            <Users size={14}/> 群组推送
                        </button>
                        <button
                            onClick={() => setActiveTab('private')}
                            className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'private' ? 'bg-pink-400 text-white shadow-md shadow-pink-200' : 'text-gray-400 hover:text-pink-400'}`}
                        >
                            <MessageCircle size={14}/> 私聊推送
                        </button>
                    </div>

                    <Button
                        className="bg-pink-400 text-white font-bold shadow-md shadow-pink-200"
                        endContent={<Plus size={18}/>}
                        onPress={onOpen}
                    >
                        新建任务
                    </Button>
                </div>
            </div>

            {/* --- 任务列表表格 --- */}
            <Card className="shadow-sm border-none bg-white flex-1 overflow-hidden">
                <CardBody className="p-0">
                    <Table
                        aria-label="Example table with custom cells"
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
                        <TableBody items={tasks} emptyContent={"暂无调度任务"}>
                            {(item) => (
                                <TableRow key={item.id} className="hover:bg-pink-50/20 transition-colors border-b border-gray-50 last:border-none">
                                    {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>

            {/* --- 新建/编辑任务 弹窗 --- */}
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
                                {activeTab === 'group' ? '新建群组推送任务' : '新建私聊推送任务'}
                                <span className="text-xs text-gray-400 font-normal">添加一个新的自动化 Cron 调度</span>
                            </ModalHeader>
                            <ModalBody className="py-6">
                                <Input
                                    autoFocus
                                    label={activeTab === 'group' ? "群组 ID (Group ID)" : "用户 ID (User ID)"}
                                    placeholder="输入 ID"
                                    variant="bordered"
                                    startContent={<Terminal className="text-gray-400" size={16} />}
                                />
                                <div className="flex gap-3">
                                    <Select
                                        label="任务类型"
                                        variant="bordered"
                                        className="flex-1"
                                    >
                                        <SelectItem key="PIXIV">P站排行榜</SelectItem>
                                        <SelectItem key="REPORT">日报推送</SelectItem>
                                        <SelectItem key="STAT">发言统计</SelectItem>
                                    </Select>
                                    <Input
                                        label="参数 (Param)"
                                        placeholder="如: daily"
                                        variant="bordered"
                                        className="flex-1"
                                    />
                                </div>
                                <Input
                                    label="Cron 表达式"
                                    placeholder="* * * * *"
                                    variant="bordered"
                                    description="格式: 秒 分 时 日 月 周"
                                    endContent={
                                        <Tooltip content="Cron生成器">
                                            <CalendarClock className="text-pink-300 cursor-pointer" size={18} />
                                        </Tooltip>
                                    }
                                />
                                <Input
                                    label="任务描述"
                                    placeholder="给这个任务起个名字"
                                    variant="bordered"
                                />
                                <div className="flex justify-between items-center px-2 py-2 border border-gray-200 rounded-xl">
                                    <span className="text-sm text-gray-600">立即启用</span>
                                    <Switch size="sm" color="danger" defaultSelected />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="flat" onPress={onClose} className="font-bold">
                                    取消
                                </Button>
                                <Button className="bg-pink-400 text-white font-bold shadow-lg shadow-pink-200" onPress={onClose}>
                                    保存任务
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
