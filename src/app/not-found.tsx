'use client';

import React from 'react';
import {Button, Card, CardBody} from '@nextui-org/react';
import {motion} from 'framer-motion';
import {useRouter} from 'next/navigation';
import {ArrowLeft, Home} from 'lucide-react';

export default function NotFoundPage() {
    const router = useRouter();

    return (
        <motion.div
            className="w-full min-h-[100dvh] flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 to-white"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
        >
            <Card
                className="w-full max-w-[380px] shadow-2xl bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden"
            >
                {/* 顶部粉色装饰条 */}
                <div className="h-4 w-full bg-[#ff7eb3] flex-shrink-0" />

                <CardBody className="flex flex-col gap-6 justify-center items-center py-12 overflow-visible text-center">

                    {/* 404 标题区域 */}
                    <div className="relative">
                        <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-pink-300 to-rose-400 opacity-20 select-none">
                            404
                        </h1>
                    </div>

                    {/* 文字提示 */}
                    <div className="space-y-2 px-4">
                        <h2 className="text-2xl font-bold text-gray-800">
                            页面走丢了...
                        </h2>
                        <p className="text-gray-500 text-sm">
                            找不到您想要访问的页面...
                        </p>
                    </div>

                    {/* 按钮组 */}
                    <div className="flex flex-col w-full gap-3 px-6 mt-4">
                        <Button
                            color="danger"
                            size="lg"
                            className="w-full bg-[#ff7eb3] hover:bg-[#ff6b9d] text-white font-bold shadow-lg shadow-pink-200 rounded-xl"
                            onPress={() => router.push('/')}
                            startContent={<Home size={20} />}
                        >
                            返回首页
                        </Button>

                        <Button
                            variant="light"
                            className="w-full text-gray-500 hover:text-[#ff7eb3] font-medium"
                            onPress={() => router.back()}
                            startContent={<ArrowLeft size={18} />}
                        >
                            返回上一页
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </motion.div>
    );
}
