import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "sonner";
const inter = Inter({ subsets: ["latin"] });

// RootLayout 保持为服务端组件
export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="zh-CN">
        <body className={inter.className}>
        <Providers>
            {children}
        </Providers>
        <Toaster position="top-center" richColors />
        </body>
        </html>
    );
}
