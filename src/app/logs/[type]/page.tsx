import React from "react";
import LogsClient from "./LogsClient";

export async function generateStaticParams() {
    return [
        { type: 'live' },
        { type: 'history' }, // 如果你有其他类型，都列在这里
        { type: 'error' },
    ];
}

export default function LogsPage() {
    return <LogsClient />;
}
