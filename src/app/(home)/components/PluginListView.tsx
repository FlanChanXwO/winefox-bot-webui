"use client";

import React from "react";
import { Card, CardBody, Chip, Button } from "@nextui-org/react";
import { FilePlus, Settings, Power, Trash2 } from "lucide-react";

// 模拟插件数据
const plugins = [
    { id: 1, name: "消息统计", version: "v0.1", author: "@FlanChanXwo", desc: "chat_message_handle", type: "数据统计", active: true },
    { id: 2, name: "关于", version: "v0.1", author: "@FlanChanXwo", desc: "about", type: "其他", active: true },
    { id: 3, name: "消息撤回", version: "v0.1", author: "@FlanChanXwo", desc: "withdraw", type: "其他", active: true },
    { id: 4, name: "来份色图", version: "v0.1", author: "@FlanChanXwo", desc: "nickname", type: "其他", active: true },
];

export default function PluginListView() {
    return (
        <div className="flex flex-col h-full gap-4 px-6 pb-4">
            {/* 顶部筛选栏 */}
            <Card className="bg-white/80 border-none shadow-sm flex-none">
                <CardBody className="flex flex-row gap-2 py-3">
                    <Chip className="bg-pink-400 text-white font-bold cursor-pointer">普通插件(9)</Chip>
                    <Chip variant="flat" className="text-gray-500 bg-transparent hover:bg-pink-50 cursor-pointer">管理员插件(6)</Chip>
                    <Chip variant="flat" className="text-gray-500 bg-transparent hover:bg-pink-50 cursor-pointer">超级用户插件(20)</Chip>
                    <Chip variant="flat" className="text-gray-500 bg-transparent hover:bg-pink-50 cursor-pointer">其他插件(15)</Chip>
                </CardBody>
            </Card>

            {/* 次级筛选栏 + 按钮 */}
            <Card className="bg-white/80 border-none shadow-sm flex-none">
                <CardBody className="flex flex-row justify-between items-center py-3">
                    <div className="flex gap-2">
                        <Chip size="sm" className="bg-pink-100 text-pink-500 font-bold">功能</Chip>
                        <Chip size="sm" className="bg-pink-50 text-gray-500">其他</Chip>
                        <Chip size="sm" className="bg-pink-50 text-gray-500">商店</Chip>
                        <Chip size="sm" className="bg-pink-50 text-gray-500">数据统计</Chip>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" className="bg-pink-400 text-white font-bold" startContent={<FilePlus size={16}/>}>新增类型</Button>
                        <Button size="sm" className="bg-pink-400 text-white font-bold" startContent={<Settings size={16}/>}>管理类型</Button>
                    </div>
                </CardBody>
            </Card>

            {/* 插件卡片网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 scrollbar-hide">
                {plugins.map((plugin) => (
                    <Card key={plugin.id} className="border border-pink-100 shadow-sm hover:shadow-md transition-shadow">
                        <CardBody className="p-4 flex flex-col justify-between h-[180px]">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-bold text-pink-500">{plugin.name}</h3>
                                    <Chip size="sm" className="bg-pink-100 text-pink-500 text-[10px] h-5 px-1">{plugin.version}</Chip>
                                </div>
                                <p className="text-xs text-gray-500 font-mono mb-1">{plugin.desc} <span className="text-pink-300">{plugin.author}</span></p>
                                <Chip size="sm" className="bg-pink-50 text-pink-400 mt-2">{plugin.type}</Chip>
                            </div>

                            <div className="flex items-center gap-2 mt-4">
                                <Button size="sm" className="bg-green-100 text-green-600 font-bold flex-1" startContent={<Power size={14}/>}>开启</Button>
                                <Button size="sm" className="bg-blue-100 text-blue-500 font-bold flex-1" startContent={<Settings size={14}/>}>配置</Button>
                                <Button size="sm" isIconOnly className="bg-gray-100 text-gray-500"><Trash2 size={16}/></Button>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    );
}
