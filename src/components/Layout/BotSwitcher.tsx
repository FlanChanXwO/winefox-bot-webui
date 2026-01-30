"use client";
import React from "react";
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Avatar,
    Button
} from "@nextui-org/react";
import { useBotStore } from "@/store/useBotStore";

export default function BotSwitcher() {
    const {
        currentBotInfo,
        availableBots,
        switchBot,
        currentBotId
    } = useBotStore(state => state);

    return (
        <Dropdown placement="bottom-end">
            <DropdownTrigger>
                <div className="flex items-center gap-2 cursor-pointer p-1 rounded-xl hover:bg-gray-100 transition-colors">
                    <span className="text-sm font-bold text-gray-600 hidden sm:block ml-1">切换账号</span>

                    <Avatar
                        src={currentBotInfo?.avatarUrl}
                        classNames={{ img: "opacity-100" }}
                        imgProps={{ referrerPolicy: "no-referrer" }}
                        size="sm"
                        className="border border-pink-200"
                    />

                    <Button size="sm" variant="light"
                            className="text-gray-600 font-bold bg-transparent min-w-0 px-1 md:px-2 data-[hover=true]:bg-transparent">
                        <span className="hidden sm:inline">{currentBotInfo?.nickname || `Bot ${currentBotId || ''}`}</span>
                        <span className="text-xs">▼</span>
                    </Button>
                </div>
            </DropdownTrigger>

            <DropdownMenu
                aria-label="Bot Actions"
                variant="flat"
                disallowEmptySelection
                selectionMode="single"
                selectedKeys={currentBotId ? new Set([String(currentBotId)]) : new Set()}
                onAction={(key) => switchBot(Number(key))}
            >
                {availableBots.length > 0 ? (
                    availableBots.map((botId) => (
                        <DropdownItem key={botId} textValue={`Bot ${botId}`}>
                            <div className="flex flex-col">
                                <span className="text-small font-bold">机器人 ID: {botId}</span>
                                {String(botId) === String(currentBotId) && (
                                    <span className="text-tiny text-pink-500">当前在线</span>
                                )}
                            </div>
                        </DropdownItem>
                    ))
                ) : (
                    <DropdownItem key="no-bots" isReadOnly>
                        暂无在线机器人
                    </DropdownItem>
                )}
            </DropdownMenu>
        </Dropdown>
    );
}
