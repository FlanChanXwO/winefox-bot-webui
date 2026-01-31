import React from "react";
import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "酒狐の超-级-面-板",
    description: "酒狐Bot WebUI",
};

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="zh-CN">
        <head>
            <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
            <meta httpEquiv="Pragma" content="no-cache" />
            <meta httpEquiv="Expires" content="0" />
        </head>
        <body className={inter.className} >
        <Providers>
            {children}
        </Providers>
        </body>
        </html>
    );
}
