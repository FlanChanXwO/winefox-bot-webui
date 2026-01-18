"use client";

import React, {useState} from "react";
import {
    Card, CardBody, Avatar, Button, Input, Chip, Textarea, Switch, Select, SelectItem, Badge
} from "@nextui-org/react";
import {
    UserPlus, Settings, MoreHorizontal, Send, Trash2, Users, User
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from "recharts";

// --- 模拟数据 ---

const mockGroups = [
    {id: '1001918625', name: 'test', avatar: 'https://api.bgm.tv/subject/328609/cover_l', type: 'group'},
    {id: '123123', name: '123123', avatar: '', type: 'group', icon: 'H'},
];

const mockMessages = [
    {
        id: 1,
        sender: 'hibikier',
        avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
        content: '发点色图吧，求你了',
        time: '2025-05-16 11:59:32',
        isMe: false,
        type: 'text'
    },
    {
        id: 2,
        sender: 'Bot',
        avatar: 'https://api.bgm.tv/subject/328609/cover_l',
        content: 'https://scpic.chinaz.net/files/default/imgs/2023-05-12/575399554e20606f.jpg', // 模拟图片URL
        time: '2025-05-16 11:59:32',
        isMe: false, // 机器人发的算接收方
        type: 'image'
    },
    {
        id: 3,
        sender: 'Me',
        avatar: 'https://i.pravatar.cc/150?u=a04258114e29026302d',
        content: '不可以！',
        time: '2025-05-16 12:05:00',
        isMe: true,
        type: 'text'
    }
];

const chartData = [
    {name: 'A', value: 158},
    {name: 'B', value: 111},
    {name: 'C', value: 110},
    {name: 'D', value: 101},
    {name: 'E', value: 62},
];

export default function FriendsAndGroups() {
    const [activeTab, setActiveTab] = useState<'friends' | 'groups'>('groups');
    const [selectedId, setSelectedId] = useState('1001918625');

    return (
        <div className="h-full flex flex-col p-4 lg:p-6 gap-6 overflow-hidden">

            {/* 顶部标题栏 */}
            <div className="flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2 text-pink-500 font-bold text-xl">
                    <span>✿</span>
                    <h1>好友与群组</h1>
                    <span>✿</span>
                </div>
                <Badge content="1" color="danger" shape="circle">
                    <Button
                        size="sm"
                        variant="flat"
                        className="bg-pink-100 text-pink-500 font-bold"
                        startContent={<UserPlus size={16}/>}
                    >
                        请求管理
                    </Button>
                </Badge>
            </div>

            {/* 主体三栏布局 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full overflow-hidden">

                {/* === 左侧：列表 === */}
                <Card className="lg:col-span-3 shadow-sm border-none bg-white h-full">
                    <CardBody className="p-4 flex flex-col gap-4">
                        {/* 顶部 Tab 切换 */}
                        <div className="grid grid-cols-2 gap-2 bg-pink-50 p-1 rounded-lg">
                            <button
                                onClick={() => setActiveTab('friends')}
                                className={`py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'friends' ? 'bg-white text-pink-500 shadow-sm' : 'text-gray-400 hover:text-pink-400'}`}
                            >
                                好友(0)
                            </button>
                            <button
                                onClick={() => setActiveTab('groups')}
                                className={`py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'groups' ? 'bg-pink-400 text-white shadow-md shadow-pink-200' : 'text-gray-400 hover:text-pink-400'}`}
                            >
                                群组(2)
                            </button>
                        </div>

                        {/* 列表区域 */}
                        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                            {activeTab === 'groups' && mockGroups.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedId(item.id)}
                                    className={`group flex items-center p-3 rounded-xl cursor-pointer transition-all ${
                                        selectedId === item.id
                                            ? 'bg-pink-400 text-white shadow-lg shadow-pink-200'
                                            : 'hover:bg-pink-50 text-gray-700'
                                    }`}
                                >
                                    <Avatar
                                        src={item.avatar}
                                        name={item.icon}
                                        className={`w-10 h-10 mr-3 shrink-0 ${!item.avatar ? 'bg-red-500 text-white' : ''}`}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold truncate text-sm">{item.name}</div>
                                        <div
                                            className={`text-xs truncate ${selectedId === item.id ? 'text-pink-100' : 'text-gray-400'}`}>
                                            ID: {item.id}
                                        </div>
                                    </div>
                                    <MoreHorizontal size={16}
                                                    className={`opacity-0 group-hover:opacity-100 ${selectedId === item.id ? 'text-white' : 'text-gray-400'}`}/>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>

                {/* === 中间：聊天窗口 === */}
                <Card className="lg:col-span-6 shadow-sm border-none bg-white h-full flex flex-col">

                    {/* 聊天头部 */}
                    <div className="flex justify-between items-center p-4 border-b border-pink-50 shrink-0">
                        <div className="flex items-center gap-3">
                            <Avatar src="https://api.bgm.tv/subject/328609/cover_l" size="sm"/>
                            <span className="font-bold text-pink-500 text-lg">test</span>
                        </div>
                        <Button size="sm" className="bg-pink-400 text-white font-bold">清空记录</Button>
                    </div>

                    {/* 消息区域 */}
                    <CardBody className="flex-1 bg-white overflow-y-auto p-4 space-y-6 custom-scrollbar">
                        {mockMessages.map((msg) => (
                            <div key={msg.id} className={`flex gap-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                                <Avatar src={msg.avatar} className="w-10 h-10 shrink-0 mt-1"/>
                                <div
                                    className={`flex flex-col gap-1 max-w-[70%] ${msg.isMe ? 'items-end' : 'items-start'}`}>
                                    {/* 对方显示名字 */}
                                    {!msg.isMe && <span className="text-xs text-gray-400 ml-1">{msg.sender}</span>}

                                    {/* 消息气泡 */}
                                    <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                        msg.isMe
                                            ? 'bg-pink-100 text-gray-700 rounded-tr-none'
                                            : 'bg-pink-50 text-gray-700 rounded-tl-none'
                                    }`}>
                                        {msg.type === 'image' ? (
                                            <img src={msg.content} alt="img"
                                                 className="rounded-lg max-w-full h-auto object-cover max-h-[200px]"/>
                                        ) : (
                                            msg.content
                                        )}
                                    </div>

                                    {/* 时间 */}
                                    <span className="text-[10px] text-gray-300 px-1">
                                        {msg.time}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </CardBody>

                    {/* 底部输入框 */}
                    <div className="p-4 border-t border-pink-50 shrink-0">
                        <div className="relative">
                            <Textarea
                                minRows={3}
                                placeholder="输入消息..."
                                variant="bordered"
                                classNames={{
                                    inputWrapper: "border-gray-200 shadow-none hover:border-pink-300 focus-within:border-pink-400 bg-transparent",
                                    input: "text-sm"
                                }}
                            />
                            <div className="flex justify-end gap-2 mt-2">
                                <Button size="sm" variant="flat" color="danger" className="font-bold">
                                    清空
                                </Button>
                                <Button size="sm"
                                        className="bg-pink-400 text-white font-bold shadow-md shadow-pink-200">
                                    发送
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* === 右侧：详情面板 === */}
                <Card className="lg:col-span-3 shadow-sm border-none bg-white h-full overflow-y-auto custom-scrollbar">
                    <CardBody className="p-6 flex flex-col items-center gap-6">

                        {/* 头部信息 */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative">
                                <div
                                    className="w-24 h-24 rounded-full bg-pink-100 flex items-center justify-center p-1">
                                    <Avatar src="https://api.bgm.tv/subject/328609/cover_l"
                                            className="w-full h-full text-large"/>
                                </div>
                                <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md">
                                    <Users size={16} className="text-pink-500"/>
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-pink-500">test</h2>
                            <Chip className="bg-pink-400 text-white" size="sm">1001918625</Chip>
                        </div>

                        {/* 状态与统计 */}
                        <div className="w-full space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                {/* 现在 flex-shrink-0 会生效了 */}
                                <span className="text-gray-500 text-sm font-bold flex-shrink-0">状态:</span>

                                {/* Switch 现在会正常显示，不会是奇怪的蓝色符号了 */}
                                <Switch defaultSelected size="sm" color="danger" aria-label="状态开关"/>

                                {/* w-[80px] 现在会生效了 */}
                                <div className="w-[80px] flex-shrink-0">
                                    <Select size="sm" defaultSelectedKeys={["5"]} aria-label="群权限"
                                            className="min-w-0">
                                        <SelectItem key="5">5</SelectItem>
                                    </Select>
                                </div>
                            </div>

                            {/* 下方统计数据保持不变 */}
                            <div className="grid grid-cols-2 gap-y-2 text-xs text-gray-500">
                                <div className="flex justify-between pr-2">
                                    <span>当前人数:</span>
                                    <span className="font-bold text-pink-400">0</span>
                                </div>
                                <div className="flex justify-between pl-2">
                                    <span>最大人数:</span>
                                    <span className="font-bold text-green-400">0</span>
                                </div>
                                <div className="flex justify-between pr-2">
                                    <span>聊天记录:</span>
                                    <span className="font-bold text-pink-400">2985</span>
                                </div>
                                <div className="flex justify-between pl-2">
                                    <span>调用次数:</span>
                                    <span className="font-bold text-green-400">843</span>
                                </div>
                            </div>
                        </div>


                        {/* 被动状态 (Tags) */}
                        <div className="w-full space-y-2">
                            <span className="text-gray-500 text-sm font-bold">被动状态:</span>
                            <div
                                className="flex flex-wrap gap-2 p-2 border border-dashed border-pink-200 rounded-lg min-h-[60px]">
                                {["进群欢迎", "退群提醒", "广播", "早晚安", "酒狐日报", "复读", "Test"].map(tag => (
                                    <Chip
                                        key={tag}
                                        onClose={() => console.log('close')}
                                        variant="flat"
                                        className="bg-pink-50 text-pink-500 border-none h-6 text-[10px]"
                                        classNames={{closeButton: "text-pink-400 hover:text-pink-600"}}
                                    >
                                        {tag}
                                    </Chip>
                                ))}
                            </div>
                        </div>

                        {/* 禁用插件 */}
                        <div className="w-full space-y-2">
                            <span className="text-gray-500 text-sm font-bold">禁用插件:</span>
                            <div
                                className="flex flex-wrap gap-2 p-2 border border-dashed border-gray-200 rounded-lg min-h-[40px]">
                                <Chip
                                    onClose={() => {
                                    }}
                                    variant="flat"
                                    className="bg-gray-100 text-gray-500 border-none h-6 text-[10px]"
                                >
                                    send_setu
                                </Chip>
                            </div>
                        </div>

                        <Button className="w-full bg-pink-400 text-white font-bold shadow-lg shadow-pink-200">
                            应用设置
                        </Button>

                        {/* 最喜爱的插件图表 */}
                        <div className="w-full mt-4">
                            <h3 className="text-sm font-bold text-pink-500 mb-2">最喜爱的插件</h3>
                            <div className="h-[150px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} barSize={20}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fce7f3"/>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false}
                                               tick={{fontSize: 10, fill: '#888'}}/>
                                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#888'}}/>
                                        <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{
                                            borderRadius: '8px',
                                            border: 'none',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}/>
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`}
                                                      fill={`rgba(244, 114, 182, ${1 - index * 0.15})`}/>
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </CardBody>
                </Card>

            </div>
        </div>
    );
}
