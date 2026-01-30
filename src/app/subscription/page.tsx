"use client";

import React, { useState } from "react";
import {
    Card, CardBody, Button, Chip, Input, Avatar, AvatarGroup,
    Listbox, ListboxItem, ScrollShadow, Divider, Badge
} from "@nextui-org/react";
import {
    Bell, BellRing, UserPlus, Search, Trash2, Hash, AtSign, Zap
} from "lucide-react";

// --- 模拟数据 ---

// 1. 订阅项（消息类型）
const subscriptionTypes = [
    { id: "pixiv_rank", name: "P站每日排行榜", description: "每日推送Pixiv画师榜单", count: 12 },
    { id: "daily_news", name: "酒狐日报", description: "每天早上的新闻聚合", count: 58 },
    { id: "server_status", name: "服务器状态监控", description: "当服务器负载过高时报警", count: 3 },
    { id: "gacha_reset", name: "原神/崩铁签到提醒", description: "米游社每日签到提醒", count: 120 },
];

// 2. 订阅者（具体的用户/群组）
// 假设这里展示的是选中 "pixiv_rank" 后的订阅者列表
const mockSubscribers = [
    { id: 1, userId: "1001918", nickname: "hibikier", groupName: "开发测试群", groupId: "123123", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d" },
    { id: 2, userId: "2233445", nickname: "小真寻", groupName: "开发测试群", groupId: "123123", avatar: "https://api.bgm.tv/subject/328609/cover_l" },
    { id: 3, userId: "9988776", nickname: "路人A", groupName: "摸鱼群", groupId: "789789", avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d" },
    { id: 4, userId: "5566778", nickname: "管理员", groupName: "摸鱼群", groupId: "789789", avatar: "https://i.pravatar.cc/150?u=a04258114e29026708c" },
];

export default function Page() {
    const [selectedType, setSelectedType] = useState("pixiv_rank");
    const [searchQuery, setSearchQuery] = useState("");

    // 根据选中的 ID 获取详情
    const currentTypeInfo = subscriptionTypes.find(t => t.id === selectedType);

    return (
        <div className="h-full flex flex-col p-4 lg:p-6 gap-6 w-full overflow-hidden">

            {/* 顶部标题 */}
            <div className="flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2 text-pink-500 font-bold text-xl">
                    <BellRing className="animate-bounce-slow" />
                    <h1>订阅与提醒管理</h1>
                </div>
                <div className="flex gap-2">
                    <Input
                        classNames={{
                            base: "max-w-full sm:max-w-[15rem] h-10",
                            mainWrapper: "h-full",
                            input: "text-small",
                            inputWrapper: "h-full font-normal text-default-500 bg-white border border-pink-100 hover:border-pink-300 focus-within:border-pink-400 dark:bg-default-500/20",
                        }}
                        placeholder="搜索订阅者QQ/群号..."
                        size="sm"
                        startContent={<Search size={18} />}
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                        variant="bordered"
                    />
                    <Button
                        className="bg-pink-400 text-white font-bold shadow-md shadow-pink-200"
                        startContent={<UserPlus size={18}/>}
                    >
                        添加订阅者
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full overflow-hidden pb-2">

                {/* === 左侧：订阅项列表 (3/12) === */}
                <Card className="md:col-span-4 lg:col-span-3 shadow-sm border-none bg-white h-full">
                    <CardBody className="p-0">
                        <div className="p-4 bg-pink-50/50 border-b border-pink-50">
                            <h3 className="text-sm font-bold text-gray-600 flex items-center gap-2">
                                <Zap size={16} className="text-yellow-500"/> 消息类型
                            </h3>
                        </div>
                        <ScrollShadow className="h-full">
                            <Listbox
                                aria-label="Subscription Types"
                                onAction={(key) => setSelectedType(key as string)}
                                className="p-2 gap-2"
                                variant="flat"
                            >
                                {subscriptionTypes.map((item) => (
                                    <ListboxItem
                                        key={item.id}
                                        className={selectedType === item.id ? "bg-pink-50" : ""}
                                        startContent={
                                            <div className={`p-2 rounded-lg ${selectedType === item.id ? 'bg-pink-400 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                <Hash size={18} />
                                            </div>
                                        }
                                        endContent={
                                            <Chip size="sm" variant="flat" className="bg-white text-pink-400 font-bold border border-pink-100">
                                                {item.count}
                                            </Chip>
                                        }
                                        textValue={item.name}
                                    >
                                        <div className="flex flex-col gap-1">
                                            <span className={`text-sm font-bold ${selectedType === item.id ? "text-pink-500" : "text-gray-700"}`}>
                                                {item.name}
                                            </span>
                                            <span className="text-xs text-gray-400 truncate w-40 block">
                                                {item.description}
                                            </span>
                                        </div>
                                    </ListboxItem>
                                ))}
                            </Listbox>
                        </ScrollShadow>
                        <div className="p-3 border-t border-gray-100">
                            <Button size="sm" variant="light" className="w-full text-gray-400 font-bold hover:text-pink-500">
                                + 新增消息类型
                            </Button>
                        </div>
                    </CardBody>
                </Card>

                {/* === 右侧：订阅者详情 (9/12) === */}
                <Card className="md:col-span-8 lg:col-span-9 shadow-sm border-none bg-white h-full flex flex-col">
                    {/* 头部信息 */}
                    <div className="p-6 border-b border-gray-50 flex justify-between items-start bg-gradient-to-r from-white to-pink-50/30">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-xl bg-pink-100 text-pink-500 flex items-center justify-center shadow-sm">
                                <Bell size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    {currentTypeInfo?.name}
                                    <Chip size="sm" className="bg-pink-100 text-pink-500 font-mono text-xs">ID: {currentTypeInfo?.id}</Chip>
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">{currentTypeInfo?.description}</p>
                            </div>
                        </div>
                        <AvatarGroup isBordered max={5} size="sm">
                            {mockSubscribers.map(u => <Avatar key={u.id} src={u.avatar} />)}
                        </AvatarGroup>
                    </div>

                    {/* 订阅者列表区域 */}
                    <CardBody className="p-0 overflow-y-auto custom-scrollbar bg-gray-50/30">
                        {mockSubscribers.length > 0 ? (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 p-4">
                                {mockSubscribers.map((sub) => (
                                    <div key={sub.id} className="group relative bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-pink-200 transition-all flex items-center gap-4">
                                        {/* 头像与AT标志 */}
                                        <div className="relative">
                                            <Avatar src={sub.avatar} size="lg" isBordered className="w-14 h-14" />
                                            <div className="absolute -bottom-1 -right-1 bg-pink-500 text-white rounded-full p-0.5 border-2 border-white">
                                                <AtSign size={12} />
                                            </div>
                                        </div>

                                        {/* 用户信息 */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-800 text-base">{sub.nickname}</span>
                                                <span className="text-xs text-gray-400 font-mono">({sub.userId})</span>
                                            </div>

                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-gray-400">所属群组:</span>
                                                <Chip size="sm" variant="flat" className="bg-blue-50 text-blue-500 h-5 px-1 border border-blue-100">
                                                    {sub.groupName}
                                                </Chip>
                                                <span className="text-xs text-gray-300 font-mono">{sub.groupId}</span>
                                            </div>
                                        </div>

                                        {/* 操作按钮 (Hover显示) */}
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button isIconOnly size="sm" color="danger" variant="light" aria-label="Delete subscription">
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {/* 占位添加卡片 */}
                                <button className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-pink-300 hover:bg-pink-50/50 transition-all text-gray-400 hover:text-pink-500 gap-2 h-[88px]">
                                    <UserPlus size={24} />
                                    <span className="text-sm font-bold">手动添加订阅者</span>
                                </button>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                <BellRing size={48} className="text-gray-200" />
                                <p>暂无订阅者</p>
                            </div>
                        )}
                    </CardBody>
                </Card>

            </div>
        </div>
    );
}
