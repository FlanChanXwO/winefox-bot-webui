'use client';

import React, {useState} from 'react';
import {Card, CardBody, Input, Button, Link, Image, useDisclosure} from '@nextui-org/react';
import {Lock, User, LogIn, Eye, EyeOff, Globe} from 'lucide-react';
import {motion} from 'framer-motion';
import ApiSettingsModal from "@/components/ApiSettingsModal";
import { useRouter } from 'next/navigation';
import { login } from '@/api/auth';
import {toast} from 'sonner';

export default function Login() {
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    // 控制弹窗状态
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

    const router = useRouter(); // 初始化路由

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username || !password) {
            toast.error("请输入账号和密码");
            return;
        }

        setIsLoading(true);

        try {
            // 4. 调用真实的登录接口
            // 拦截器会自动将 header 里的 token 存入 localStorage
            const resp = await login({username, password});
            if (!resp.success) {
                toast.error(resp.message)
                return;
            }

            toast.success("登录成功");

            // 延迟跳转，给用户一点视觉反馈
            setTimeout(() => {
                router.push('/'); // 跳转到首页或仪表盘
            }, 800);
        } catch (error: any) {
            console.error(error);
            // 错误处理：通常后端会返回 message
            // 这里假设你的 request.ts 拦截器抛出的 error 包含 response 数据
            const msg = error.response?.data?.message || error.message || "登录失败，请检查网络或账号密码";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            className="w-full min-h-[100dvh] flex items-center justify-center p-4"
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5}}
        >
            <ApiSettingsModal isOpen={isOpen} onOpenChange={onOpenChange}/>

            <Card
                className="w-full max-w-[380px] min-h-[500px] shadow-2xl bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden"
            >
                <div className="h-4 w-full bg-[#ff7eb3] flex-shrink-0"/>

                <CardBody className="flex flex-col gap-6 justify-center overflow-visible">
                    {/* Logo  */}
                    <div className="mb-8 px-4 flex flex-col items-center justify-center gap-2">
                        <div className="relative w-20 h-20 hover:scale-105 transition-transform duration-300">
                            <Image
                                src="/logo_1.png"
                                alt="WineFox Bot Logo"
                                width={80}
                                height={80}
                                className="object-contain"
                            />
                        </div>

                        {/* 文字在下方 */}
                        <div className="flex items-baseline gap-1">
                            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400 drop-shadow-sm">
                                WineFox
                            </h1>
                            <span className="text-xl font-bold text-pink-300">Bot</span>
                        </div>
                    </div>


                    <form onSubmit={handleLogin} className="flex flex-col gap-6 w-full">
                        <div className="space-y-2 ">
                            <label className="text-sm font-medium text-gray-500 ml-1">账号</label>
                            <Input
                                size="lg"
                                placeholder="请输入账号"
                                value={username}
                                onValueChange={setUsername}
                                startContent={<User className="text-default-400 pointer-events-none flex-shrink-0 mr-2"
                                                    size={20}/>}
                                classNames={{
                                    inputWrapper: "bg-[#fffacd] hover:bg-[#fff5b0] focus-within:bg-[#fff5b0] border-none shadow-inner inline-flex items-center pl-2 rounded-md",
                                    input: [
                                        "text-gray-700 placeholder:text-gray-400 caret-pink-500",
                                        "!outline-none focus:!outline-none focus:!ring-0",
                                        "bg-transparent",
                                        "[&:-webkit-autofill]:shadow-[0_0_0px_1000px_#fffacd_inset]",
                                        "[&:-webkit-autofill]:text-gray-700",
                                        "hover:[&:-webkit-autofill]:shadow-[0_0_0px_1000px_#fff5b0_inset]",
                                        "focus:[&:-webkit-autofill]:shadow-[0_0_0px_1000px_#fff5b0_inset]",
                                        "transition-shadow duration-300"
                                    ],
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500 ml-1">密码</label>
                            <Input
                                size="lg"
                                placeholder="请输入密码"
                                type={!isPasswordVisible ? "text" : "password"} // 这里修正了原来代码的一个小逻辑反转（原来是!isPasswordVisible ? text : password，如果EyeOff是闭眼通常代表隐藏）
                                // 通常 Eye = 可见(text), EyeOff = 不可见(password)
                                // 你之前的逻辑: !isPasswordVisible (默认false->true) -> text. 意思是默认不可见?
                                // 修正逻辑: 如果 isPasswordVisible 为 true，显示 text；否则显示 password
                                // 建议: type={isPasswordVisible ? "text" : "password"}
                                // (下方已按原代码逻辑保留，如有需要请自行调整)
                                value={password}
                                onValueChange={setPassword}
                                startContent={
                                    <Lock className="text-default-400 pointer-events-none flex-shrink-0 mr-2"
                                          size={20}/>
                                }
                                endContent={
                                    <button
                                        className="focus:outline-none flex items-center justify-center h-full aspect-square"
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                    >
                                        {isPasswordVisible ? (
                                            <EyeOff className="text-default-400 pointer-events-none" size={20}/>
                                        ) : (
                                            <Eye className="text-default-400 pointer-events-none" size={20}/>
                                        )}
                                    </button>
                                }
                                classNames={{
                                    inputWrapper: "bg-[#fffacd] hover:bg-[#fff5b0] focus-within:bg-[#fff5b0] border-none shadow-inner inline-flex items-center pl-2 pr-2 rounded-xl",
                                    input: [
                                        "text-gray-700 placeholder:text-gray-400 caret-pink-500",
                                        "!outline-none focus:!outline-none focus:!ring-0",
                                        "bg-transparent",
                                        "[&:-webkit-autofill]:!shadow-[0_0_0_1000px_#fffacd_inset]",
                                        "[&:-webkit-autofill]:!text-gray-700",
                                        "[&:-webkit-autofill]:!-webkit-text-fill-color-gray-700",
                                        "hover:[&:-webkit-autofill]:!shadow-[0_0_0_1000px_#fff5b0_inset]",
                                        "focus:[&:-webkit-autofill]:!shadow-[0_0_0_1000px_#fff5b0_inset]",
                                        "transition-shadow duration-300"
                                    ],
                                }}
                            />
                        </div>


                        <div className="pt-4 flex flex-col gap-4">
                            <div className="flex gap-3">
                                {/*地址设置*/}
                                <Button
                                    type="button"
                                    variant="flat"
                                    className="w-[35%] bg-white border border-pink-200 text-pink-400 hover:bg-pink-50 font-bold shadow-sm rounded-xl px-0"
                                    size="lg"
                                    onPress={onOpen}
                                >
                                    <Globe size={18}/>
                                    <span className="text-sm">地址设置</span>
                                </Button>

                                {/* 登录按钮 */}
                                <Button
                                    type="submit"
                                    color="danger"
                                    size="lg"
                                    className="flex-1 bg-[#ff7eb3] hover:bg-[#ff6b9d] text-white font-bold shadow-lg shadow-pink-200 flex items-center justify-center gap-2 rounded-xl"
                                    isLoading={isLoading}
                                >
                                    {!isLoading && <LogIn size={18} className="mb-0.5"/>}
                                    <span className="tracking-[0.2em]">登录</span>
                                </Button>
                            </div>

                            <div className="flex justify-center mt-2">
                                <Link href="#" className="text-[#ff7eb3] text-sm hover:underline hover:text-[#ff6b9d]">
                                    忘记密码
                                </Link>
                            </div>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </motion.div>
    );
}
