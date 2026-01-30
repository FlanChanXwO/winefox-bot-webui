import React from "react";
import LogsClient from "./LogsClient";

export function generateStaticParams() {
    return [
        { type: 'live' },
        { type: 'history' },
        { type: 'error' },
    ];
}

export default function LogsPage() {
    return <LogsClient />;
}
