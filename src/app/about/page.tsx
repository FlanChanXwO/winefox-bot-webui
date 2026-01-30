"use client";

import React from "react";
import {Card, CardBody, Chip, Divider, Image, Link} from "@nextui-org/react";
import {LayoutTemplate, Server} from "lucide-react";

export default function AboutPage() {
    const qqgroupLink = "https://qm.qq.com/q/ogWOL9TaBE";

    return (
        <div className="h-full bg-white w-full overflow-y-auto px-4 pb-8 scrollbar-hide rounded-2xl shadow-sm">
            <div className="max-w-3xl mx-auto flex flex-col gap-6">

                {/* 顶部 Logo 区域 */}
                <div className="flex flex-col items-center justify-center pt-8 pb-4">
                    {/* Logo */}
                    <div
                        className={`mb-6 px-4 relative transition-all duration-300 flex items-center justify-center gap-2`}>

                        {/* 左侧：图片容器 */}
                        <div className="relative w-16 h-16 flex-shrink-0">
                            <Image
                                src="/logo_2.png"
                                alt="WineFox Bot Logo"
                                className="object-contain -rotate-4"
                            />
                        </div>

                        {/* 右侧：文字容器 - 作为一个整体列 */}
                        <div className="relative flex flex-col justify-center">
                            <h1 className="text-xl font-black text-pink-300 transform -rotate-6 select-none leading-none"
                                style={{textShadow: "1px 1px 0px #fff"}}>WineFox</h1>
                            <h1 className="text-2xl font-black text-pink-400 transform rotate-3 mt-1 ml-5 select-none leading-none"
                                style={{textShadow: "1px 1px 0px #fff"}}>Bot</h1>
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-slate-700 mb-6">关于我们</h1>
                    <Divider className="bg-pink-100 h-[2px] w-full" />
                </div>

                {/* 项目介绍卡片 */}
                <Card className="bg-pink-50/50 border border-pink-100 shadow-sm">
                    <CardBody className="p-6">
                        <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                            项目介绍 🌸
                        </h2>
                        <div className="border-l-3 border-pink-300 pl-4 py-1">
                            <p className="text-slate-600 leading-relaxed text-sm">
                                本项目是一个对于 <span className="text-pink-400 font-bold mx-1">酒狐</span> 的API前端实现，通过WebUi实现对酒狐的可视化操作。
                            </p>
                        </div>
                    </CardBody>
                </Card>

                {/* --- 项目源码卡片 (新增部分) --- */}
                <Card className="bg-pink-50/50 border border-pink-100 shadow-sm">
                    <CardBody className="p-6">
                        <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                            项目源码 🐙
                        </h2>

                        <div className="border-l-4 border-pink-300 pl-4 py-1 mb-6">
                            <p className="text-slate-600 text-sm">
                                本项目前后端分离，均已开源。欢迎 Star 和 PR！
                            </p>
                        </div>

                        {/* 两个项目地址卡片：在大屏并排，小屏堆叠 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* 1. 前端项目卡片 */}
                            <Card
                                isPressable
                                as={Link}
                                href="https://github.com/FlanChanXwO/winefox-bot-webui" // 替换你的真实地址
                                target="_blank"
                                className="bg-white border border-pink-100 shadow-sm hover:shadow-md hover:border-pink-300 transition-all"
                            >
                                <CardBody className="flex flex-col items-start p-4 h-full">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                                            <LayoutTemplate size={20} />
                                        </div>
                                        <span className="font-bold text-slate-700">前端 WebUI</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-3 flex-grow">
                                        基于 React + NextUI 构建的可视化控制台，提供优雅的交互体验。
                                    </p>
                                    <div className="flex gap-1">
                                        <Chip size="sm" variant="flat" className="bg-blue-50 text-blue-400 text-[10px] h-5">TypeScript</Chip>
                                        <Chip size="sm" variant="flat" className="bg-cyan-50 text-cyan-500 text-[10px] h-5">React</Chip>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* 2. 后端项目卡片 */}
                            <Card
                                isPressable
                                as={Link}
                                href="https://github.com/FlanChanXwO/winefox-bot" // 替换你的真实地址
                                target="_blank"
                                className="bg-white border border-pink-100 shadow-sm hover:shadow-md hover:border-pink-300 transition-all"
                            >
                                <CardBody className="flex flex-col items-start p-4 h-full">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                                            <Server size={20} />
                                        </div>
                                        <span className="font-bold text-slate-700">后端 Core</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-3 flex-grow">
                                        基于 SpringBoot + Shiro 的机器人核心逻辑，处理消息事件与插件管理。
                                    </p>
                                    <div className="flex gap-1">
                                        <Chip size="sm" variant="flat" className="bg-yellow-50 text-yellow-600 text-[10px] h-5">Java</Chip>
                                        <Chip size="sm" variant="flat" className="bg-green-50 text-green-500 text-[10px] h-5">Shiro</Chip>
                                        <Chip size="sm" variant="flat" className="bg-green-50 text-green-500 text-[10px] h-5">SpringBoot</Chip>
                                    </div>
                                </CardBody>
                            </Card>

                        </div>
                    </CardBody>
                </Card>

                {/* 联系我们卡片 */}
                <Card className="bg-pink-50/50 border border-pink-100 shadow-sm">
                    <CardBody className="p-6">
                        <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                            联系我们 📩
                        </h2>

                        <div className="border-l-3 border-pink-300 pl-4 py-1 mb-6">
                            <p className="text-slate-600 text-sm">
                                如果您有任何问题或建议，欢迎加入我们的 QQ 群
                            </p>
                        </div>

                        {/* QQ群子卡片区域 */}
                        <div className="flex flex-col gap-3">
                            <Card isPressable className="bg-white border border-pink-100 shadow-sm hover:shadow-md hover:border-pink-300 transition-all" onClick={() => {
                                window.open(qqgroupLink, '_blank');
                            }}>
                                <CardBody className="flex flex-col items-start p-4">
                                    <span className="font-bold text-slate-700 mb-1">技术与聊天吹水群</span>
                                    <span className="text-xs text-gray-400">部署问题，技术问题或功能建议，以及水</span>
                                </CardBody>
                            </Card>
                        </div>
                    </CardBody>
                </Card>

                {/* 开源协议卡片 */}
                <Card className="bg-pink-50/50 border border-pink-100 shadow-sm">
                    <CardBody className="p-6">
                        <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                            开源协议 ⚖️
                        </h2>
                        <div className="border-l-3 border-pink-300 pl-4 py-1">
                            <p className="text-slate-600 text-sm">
                                本项目使用 <Link href="#" className="text-green-500 font-medium">AGPL-3.0 License</Link> 作为开源协议。
                            </p>
                        </div>
                    </CardBody>
                </Card>

                {/* 底部留白，防止紧贴边缘 */}
                <div className="h-4"></div>
            </div>
        </div>
    );
}
