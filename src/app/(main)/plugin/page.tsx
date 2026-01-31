"use client";

import React, {useEffect, useState} from "react";
import {Button, Card, CardBody, Chip, Spinner, useDisclosure} from "@nextui-org/react";
import {Power, Settings, Trash2} from "lucide-react";
import pluginApi, {PluginListItem} from "@/api/plugin";
import {toast} from "sonner";
import PluginConfigModal from "./components/PluginConfigModal";

export default function Page() {
    const [plugins, setPlugins] = useState<PluginListItem[]>([]);
    const [listLoading, setListLoading] = useState(false);

    // 弹窗控制
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedPluginId, setSelectedPluginId] = useState<string | null>(null);

    const loadPlugins = async () => {
        setListLoading(true);
        try {
            const res = await pluginApi.getList();
            if (res.success && res.data) setPlugins(res.data);
        } catch (error) {
            console.error("加载插件列表失败", error);
        } finally {
            setListLoading(false);
        }
    };

    useEffect(() => {
        loadPlugins();
    }, []);

    const handleToggle = async (plugin: PluginListItem) => {
        try {
            const newStatus = !plugin.enabled;
            const res = await pluginApi.toggle(plugin.id, newStatus);
            if (res.success) {
                toast.success(`${newStatus ? '开启' : '关闭'}成功`);
                setPlugins(prev => prev.map(p => p.id === plugin.id ? { ...p, enabled: newStatus } : p));
            } else {
                toast.error(res.message || "操作失败");
            }
        } catch (error) {
            toast.error("网络请求失败");
        }
    };

    const handleOpenConfig = (id: string) => {
        setSelectedPluginId(id);
        onOpen();
    };

    const handleCloseConfig = () => {
        onClose();
        setSelectedPluginId(null);
    };

    if (listLoading && plugins.length === 0) {
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }

    return (
        <div className="flex flex-col h-full gap-4 px-6 pb-4 overflow-y-auto">
            <Card className="bg-white/80 border-none shadow-sm flex-none">
                <CardBody className="flex flex-row justify-between items-center py-3">
                    <div className="flex gap-2 items-center">
                        <span className="text-lg font-bold text-gray-700">插件列表</span>
                        <Chip size="sm" variant="flat" color="primary">{plugins.length} 个已加载</Chip>
                    </div>
                    <Button size="sm" variant="light" onPress={loadPlugins}>刷新</Button>
                </CardBody>
            </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4  pr-2 scrollbar-hide">
                {plugins.map((plugin) => (
                    <Card key={plugin.id} className="border border-pink-100 shadow-sm hover:shadow-md transition-shadow">
                        <CardBody className="p-4 flex flex-col justify-between h-[180px]">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-bold text-pink-500 truncate" title={plugin.name}>{plugin.name}</h3>
                                    <Chip size="sm" className="bg-pink-100 text-pink-500 text-[10px] h-5 px-1 min-w-fit">{plugin.version}</Chip>
                                </div>
                                <p className="text-xs text-gray-500 font-mono mb-1 line-clamp-2" title={plugin.description}>
                                    {plugin.description || "暂无描述"}
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                    <span className="text-xs text-pink-300">@{plugin.author}</span>
                                    {plugin.builtIn && <Chip size="sm" variant="flat" color="warning" className="text-[10px] h-5">内置</Chip>}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-4">
                                <Button
                                    size="sm"
                                    className={`${plugin.enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'} font-bold flex-1`}
                                    startContent={<Power size={14}/>}
                                    onPress={() => handleToggle(plugin)}
                                    isDisabled={!plugin.canDisable}
                                >
                                    {plugin.enabled ? '已开启' : '已关闭'}
                                </Button>
                                {plugin.hasConfig && (
                                    <Button
                                        size="sm"
                                        className="bg-blue-100 text-blue-500 font-bold flex-1"
                                        startContent={<Settings size={14}/>}
                                        onPress={() => handleOpenConfig(plugin.id)}
                                    >
                                        配置
                                    </Button>
                                )}
                                <Button size="sm" isIconOnly className="bg-gray-100 text-gray-500" isDisabled={plugin.builtIn}><Trash2 size={16}/></Button>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>

            {/* 配置弹窗独立组件 */}
            <PluginConfigModal
                isOpen={isOpen}
                onClose={handleCloseConfig}
                pluginId={selectedPluginId}
            />
        </div>
    );
}
