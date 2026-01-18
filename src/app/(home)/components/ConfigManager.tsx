"use client";

import React, { useState, useMemo } from "react";
import {
    Card, CardBody, Button, Chip, Input,
    Table, TableHeader, TableBody, TableColumn, TableRow, TableCell,
    Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,
    Pagination, Tooltip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Select, SelectItem
} from "@nextui-org/react";
import {
    Settings2, Search, Plus, Filter, User, Users,
    Database, Hash, FileCode, Save, RotateCcw
} from "lucide-react";

// --- 类型定义 ---
interface AppConfig {
    id: number;
    configGroup: string; // e.g., "福利内容"
    configKey: string;   // e.g., "setu.content.mode"
    configValue: string; // e.g., "sfw", "r18"
    scope: "user" | "group" | "global";
    scopeId: string;
    description: string;
    updatedAt: string;
}

// --- 模拟数据 (基于截图) ---
const mockConfigs: AppConfig[] = [
    { id: 4, configGroup: "福利内容", configKey: "setu.content.mode", configValue: "\"sfw\"", scope: "user", scopeId: "3085974224", description: "[福利内容] 设置图片内容模式", updatedAt: "2026-01-07 07:08:22" },
    { id: 5, configGroup: "福利内容", configKey: "setu.content.mode", configValue: "\"r18\"", scope: "group", scopeId: "1073693361", description: "[福利内容] 设置图片内容模式", updatedAt: "2026-01-09 00:29:53" },
    { id: 6, configGroup: "福利内容", configKey: "setu.content.mode", configValue: "\"sfw\"", scope: "group", scopeId: "787828189", description: "[福利内容] 设置图片内容模式", updatedAt: "2026-01-11 05:45:56" },
    { id: 7, configGroup: "福利内容", configKey: "setu.content.mode", configValue: "\"sfw\"", scope: "group", scopeId: "1007417650", description: "[福利内容] 设置图片内容模式", updatedAt: "2026-01-13 16:51:22" },
    { id: 8, configGroup: "福利内容", configKey: "setu.content.mode", configValue: "\"mix\"", scope: "group", scopeId: "1027839334", description: "[福利内容] 设置图片内容模式", updatedAt: "2026-01-17 19:53:03" },
    { id: 9, configGroup: "系统设置", configKey: "bot.response.delay", configValue: "2000", scope: "global", scopeId: "0", description: "全局回复延迟(ms)", updatedAt: "2026-01-18 10:00:00" },
];

export default function ConfigManager() {
    const [filterValue, setFilterValue] = useState("");
    const [selectedScope, setSelectedScope] = useState<string>("all");
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [currentConfig, setCurrentConfig] = useState<AppConfig | null>(null);

    // 过滤逻辑
    const filteredItems = useMemo(() => {
        let items = [...mockConfigs];
        if (selectedScope !== "all") {
            items = items.filter(i => i.scope === selectedScope);
        }
        if (filterValue) {
            items = items.filter(i =>
                i.configKey.toLowerCase().includes(filterValue.toLowerCase()) ||
                i.scopeId.includes(filterValue)
            );
        }
        return items;
    }, [filterValue, selectedScope]);

    // 列定义
    const columns = [
        { name: "配置键 / 描述", uid: "key" },
        { name: "生效范围 (Scope)", uid: "scope" },
        { name: "当前值 (Value)", uid: "value" },
        { name: "分组", uid: "group" },
        { name: "操作", uid: "actions" },
    ];

    // 渲染单元格
    const renderCell = React.useCallback((item: AppConfig, columnKey: React.Key) => {
        switch (columnKey) {
            case "key":
                return (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <FileCode size={14} className="text-gray-400"/>
                            <span className="font-bold text-gray-700 text-sm">{item.configKey}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 pl-6 truncate max-w-[200px]">{item.description}</span>
                    </div>
                );
            case "scope":
                return (
                    <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${
                            item.scope === 'group' ? 'bg-blue-50 text-blue-500' :
                                item.scope === 'user' ? 'bg-purple-50 text-purple-500' : 'bg-orange-50 text-orange-500'
                        }`}>
                            {item.scope === 'group' ? <Users size={16} /> : item.scope === 'user' ? <User size={16} /> : <Database size={16}/>}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold capitalize text-gray-600">{item.scope}</span>
                            {item.scope !== 'global' && (
                                <span className="text-[10px] font-mono text-gray-400">{item.scopeId}</span>
                            )}
                        </div>
                    </div>
                );
            case "value":
                return (
                    <Chip
                        variant="flat"
                        size="sm"
                        className={`font-mono h-7 px-2 cursor-pointer border ${
                            item.configValue.includes("r18") ? "bg-red-50 text-red-500 border-red-100" :
                                item.configValue.includes("sfw") ? "bg-green-50 text-green-600 border-green-100" :
                                    "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                        onClick={() => { setCurrentConfig(item); setIsEditOpen(true); }}
                    >
                        {item.configValue}
                    </Chip>
                );
            case "group":
                return (
                    <Chip size="sm" variant="dot" color="primary" className="border-none bg-transparent">
                        {item.configGroup}
                    </Chip>
                );
            case "actions":
                return (
                    <div className="flex items-center gap-2">
                        <Button isIconOnly size="sm" variant="light" onPress={() => { setCurrentConfig(item); setIsEditOpen(true); }}>
                            <Settings2 size={16} className="text-gray-400 hover:text-pink-500"/>
                        </Button>
                    </div>
                );
            default:
                return null;
        }
    }, []);

    return (
        <div className="h-full flex flex-col p-4 lg:p-6 gap-6 w-full">

            {/* --- 顶部操作栏 --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                <div className="flex items-center gap-2 text-pink-500 font-bold text-xl">
                    <Settings2 className="animate-spin-slow" /> {/* 慢速旋转效果，营造机械感 */}
                    <h1>应用配置管理</h1>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    {/* 搜索框 */}
                    <Input
                        classNames={{
                            base: "max-w-xs h-10",
                            mainWrapper: "h-full",
                            input: "text-small",
                            inputWrapper: "h-full font-normal text-default-500 bg-white border border-pink-100 hover:border-pink-300 focus-within:border-pink-400",
                        }}
                        placeholder="搜索 Key 或 ID..."
                        size="sm"
                        startContent={<Search size={18} />}
                        value={filterValue}
                        onValueChange={setFilterValue}
                        variant="bordered"
                    />

                    {/* 作用域筛选 */}
                    <Dropdown>
                        <DropdownTrigger>
                            <Button
                                variant="bordered"
                                className="border-pink-200 text-gray-600 bg-white"
                                startContent={<Filter size={16} className={selectedScope !== 'all' ? "text-pink-500" : "text-gray-400"}/>}
                            >
                                {selectedScope === 'all' ? '全部范围' : selectedScope === 'group' ? '仅群组' : '仅用户'}
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label="Scope Filter"
                            selectionMode="single"
                            selectedKeys={new Set([selectedScope])}
                            onSelectionChange={(keys) => setSelectedScope(Array.from(keys)[0] as string)}
                        >
                            <DropdownItem key="all">全部范围</DropdownItem>
                            <DropdownItem key="group" startContent={<Users size={16}/>}>仅群组配置</DropdownItem>
                            <DropdownItem key="user" startContent={<User size={16}/>}>仅用户配置</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>

                    <Button
                        className="bg-pink-400 text-white font-bold shadow-md shadow-pink-200"
                        endContent={<Plus size={18}/>}
                    >
                        新增配置
                    </Button>
                </div>
            </div>

            {/* --- 表格区域 --- */}
            <Card className="shadow-sm border-none bg-white flex-1 overflow-hidden">
                <CardBody className="p-0">
                    <Table
                        aria-label="Config Table"
                        removeWrapper
                        className="h-full overflow-y-auto custom-scrollbar p-4"
                        bottomContent={
                            <div className="flex w-full justify-center pb-4">
                                <Pagination isCompact showControls showShadow color="danger" page={1} total={5} />
                            </div>
                        }
                    >
                        <TableHeader columns={columns}>
                            {(column) => (
                                <TableColumn
                                    key={column.uid}
                                    align={column.uid === "actions" ? "end" : "start"}
                                    className="bg-gray-50 text-gray-500 font-bold text-xs uppercase"
                                >
                                    {column.name}
                                </TableColumn>
                            )}
                        </TableHeader>
                        <TableBody items={filteredItems} emptyContent={"未找到配置项"}>
                            {(item) => (
                                <TableRow key={item.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-none">
                                    {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>

            {/* --- 编辑配置弹窗 --- */}
            <Modal
                isOpen={isEditOpen}
                onOpenChange={setIsEditOpen}
                backdrop="blur"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-gray-700">
                                修改配置项
                                <span className="text-xs text-gray-400 font-normal font-mono">{currentConfig?.configKey}</span>
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100 mb-2">
                                    <div className={`p-2 rounded-full bg-white border ${currentConfig?.scope === 'group' ? 'border-blue-200 text-blue-500' : 'border-purple-200 text-purple-500'}`}>
                                        {currentConfig?.scope === 'group' ? <Users size={20} /> : <User size={20} />}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-600">作用对象: {currentConfig?.scopeId}</div>
                                        <div className="text-xs text-gray-400">Scope: {currentConfig?.scope}</div>
                                    </div>
                                </div>

                                <Input
                                    label="配置值 (Value)"
                                    placeholder="输入新的值"
                                    defaultValue={currentConfig?.configValue}
                                    variant="bordered"
                                    description="请确保输入的格式符合程序要求 (如 JSON 字符串)"
                                />

                                <Input
                                    label="备注"
                                    defaultValue={currentConfig?.description}
                                    variant="bordered"
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" color="danger" onPress={onClose}>
                                    重置默认
                                </Button>
                                <Button className="bg-pink-400 text-white font-bold" onPress={onClose} startContent={<Save size={16}/>}>
                                    保存修改
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
