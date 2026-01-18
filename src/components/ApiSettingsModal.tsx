'use client';

import React, { useEffect, useState } from 'react';
import { Modal, ModalContent, Button, Input, Spinner } from '@nextui-org/react';
import { CheckCircle2, AlertCircle, Edit, ArrowLeft, XCircle, Globe, Server } from 'lucide-react';
import { getApiConfig, saveApiConfig } from "@/utils/config";
import { useSWRConfig } from "swr";
import {Result} from "@/utils/request";
import {useLogStore} from "@/store/useLogStore";

interface ApiSettingsModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

interface HealthStatus {
    appName: string;
    version: string;
}

type CheckStatus = 'idle' | 'checking' | 'success' | 'error';

export default function ApiSettingsModal({ isOpen, onOpenChange }: ApiSettingsModalProps) {
    const [host, setHost] = useState('');
    const [port, setPort] = useState('');

    // 状态管理
    const [checkStatus, setCheckStatus] = useState<CheckStatus>('idle');
    const [serverInfo, setServerInfo] = useState<HealthStatus | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const reconnectWebSocket = useLogStore(state => state.reconnectWebSocket);

    const { mutate } = useSWRConfig();

    // 1. 初始化读取配置
    useEffect(() => {
        if (isOpen) {
            const config = getApiConfig();
            setHost(config.host);
            setPort(config.port);
            // 打开时立即触发一次检查（不需要防抖，直接查当前状态）
            checkConnection(config.host, config.port);
        }
    }, [isOpen]);

    // 2. 核心：防抖监听输入变化
    useEffect(() => {
        // 如果模态框没打开，或者 host/port 为空，不处理
        if (!isOpen || !host || !port) return;

        // 每次输入变动，先重置为 "等待中/无效" 状态，给用户反馈我们在等他输完
        setCheckStatus('idle');
        setErrorMsg('');

        // 设置定时器：800ms 后执行检测
        const timer = setTimeout(() => {
            checkConnection(host, port);
        }, 800);

        // 清理函数：如果 800ms 内用户又输入了，清除上一次定时器，重新计时
        return () => clearTimeout(timer);
    }, [host, port, isOpen]);

    // 3. 抽离出的检测函数
    const checkConnection = async (targetHost: string, targetPort: string) => {
        if (!targetHost || !targetPort) return;

        setCheckStatus('checking');
        setServerInfo(null);

        try {
            const cleanHost = targetHost.replace(/\/$/, '');
            const targetUrl = `${cleanHost}:${targetPort}/api/check/ping`;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3秒超时

            const res = await fetch(targetUrl, {
                method: 'GET',
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data: Result<HealthStatus> = await res.json();

            if (!data.success) {
                throw new Error("请求失败")
            }
            console.log(data)
            if (data && data?.data?.appName) {
                setServerInfo(data.data);
                setCheckStatus('success');
            } else {
                throw new Error("格式错误");
            }
        } catch (error: any) {
            setCheckStatus('error');
            if (error.name === 'AbortError') {
                setErrorMsg("连接超时");
            } else {
                setErrorMsg("连接失败");
            }
        }
    };

    const handleSave = () => {
        saveApiConfig(host, port);
        console.log('API配置已保存:', `${host}:${port}`);
        mutate(() => true, undefined, { revalidate: true });
        onOpenChange(false);
        reconnectWebSocket();
    };

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            placement="center"
            backdrop="blur"
            size="lg"
            scrollBehavior="inside"
            classNames={{
                base: "bg-white/95 backdrop-blur-md border border-pink-100 shadow-2xl rounded-3xl overflow-hidden !p-0 mx-4",
                closeButton: "top-3 right-3 z-50 hover:bg-white/20 active:bg-white/40 text-white data-[hover=true]:text-white"
            }}
        >
            <ModalContent className="!p-0 gap-0">
                {(onClose) => (
                    <>
                        <div className="h-5 w-full bg-[#ff7eb3] flex-shrink-0 relative" />
                        <div className="p-6 pt-4">
                            {/* 标题 */}
                            <div className="flex justify-center mb-8 relative">
                                <h2 className="text-3xl font-black text-gray-700 relative z-10">
                                    <span className="text-pink-400">API 地址设置</span>
                                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1.5 bg-pink-300 rounded-full opacity-60"></div>
                                </h2>
                            </div>

                            {/* 状态提示栏 (根据检测结果动态显示) */}
                            <div className="mb-2 h-6 flex justify-between items-end">
                                <span className="text-pink-400 font-bold border-b-2 border-pink-100 pb-1 text-sm tracking-wider">
                                    IP:PORT
                                </span>
                                <div className="text-xs font-bold transition-all duration-300">
                                    {checkStatus === 'success' && serverInfo && (
                                        <span className="text-green-500 animate-pulse flex items-center gap-1">
                                            <Globe size={12} /> {serverInfo.appName} (v{serverInfo.version}) 可用
                                        </span>
                                    )}
                                    {checkStatus === 'error' && (
                                        <span className="text-red-400 flex items-center gap-1">
                                            <AlertCircle size={12} /> {errorMsg}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* 输入区域 */}
                            <div className="flex gap-4 items-center mb-6">
                                <Input
                                    value={host}
                                    onValueChange={setHost}
                                    size="lg"
                                    variant="bordered"
                                    // 根据状态改变边框颜色
                                    color={checkStatus === 'error' ? 'danger' : checkStatus === 'success' ? 'success' : 'default'}
                                    classNames={{
                                        inputWrapper: "bg-white shadow-sm rounded-xl h-14 border-2",
                                        input: "text-gray-600 font-medium"
                                    }}
                                />
                                <div className="w-32 flex-shrink-0">
                                    <Input
                                        value={port}
                                        onValueChange={setPort}
                                        size="lg"
                                        variant="bordered"
                                        color={checkStatus === 'error' ? 'danger' : checkStatus === 'success' ? 'success' : 'default'}
                                        classNames={{
                                            inputWrapper: "bg-white shadow-sm rounded-xl h-14 border-2",
                                            input: "text-gray-600 font-medium"
                                        }}
                                    />
                                </div>

                                {/* 动态图标指示器 */}
                                <div className="flex-shrink-0 w-10 flex justify-center">
                                    {checkStatus === 'idle' && <Server className="text-gray-300" size={28} />}
                                    {checkStatus === 'checking' && <Spinner color="default" size="md" />}
                                    {checkStatus === 'success' && <CheckCircle2 className="text-green-500 scale-110 transition-transform" size={32} />}
                                    {checkStatus === 'error' && <XCircle className="text-red-400 scale-110 transition-transform" size={32} />}
                                </div>
                            </div>

                            {/* 注意事项面板 */}
                            <div className="bg-[#fff0f5] rounded-xl p-4 mb-8 border border-pink-100">
                                <div className="flex items-center gap-2 mb-2 text-pink-500 font-bold">
                                    <AlertCircle size={18}/>
                                    <span>注意事项:</span>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600 pl-1">
                                    <div className="flex gap-2">
                                        <span className="text-pink-400 font-bold">①</span>
                                        <p>地址变动后会自动探测，<span className="font-bold text-pink-500">停止输入 0.8秒</span> 后生效。</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-pink-400 font-bold">②</span>
                                        <p>如果生产环境部署的资源和酒狐本体不在同一个机器上，请检查跨域配置。</p>
                                    </div>
                                </div>
                            </div>

                            {/* 底部按钮 */}
                            <div className="flex justify-between items-center gap-4">
                                <Button
                                    variant="light"
                                    onPress={onClose}
                                    className="bg-pink-50 text-gray-600 font-bold px-8 h-12 rounded-xl hover:bg-pink-100"
                                >
                                    <ArrowLeft size={18} className="mr-1"/> 返回
                                </Button>
                                <Button
                                    onPress={handleSave}
                                    // 可选：如果不通，禁止保存？或者给个警告样式？
                                    // isDisabled={checkStatus !== 'success'}
                                    className={`flex-1 font-bold h-12 rounded-xl shadow-lg transition-all ${
                                        checkStatus === 'success'
                                            ? 'bg-green-500 hover:bg-green-600 shadow-green-200 text-white'
                                            : 'bg-pink-400 hover:bg-pink-500 shadow-pink-200 text-white'
                                    }`}
                                >
                                    <Edit size={18} className="mr-2"/>
                                    {checkStatus === 'success' ? '确认并保存' : '保存配置'}
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
