import React from "react";
import MainLayoutWrapper from "@/components/Layout/MainLayoutWrapper";

export default function MainLayout({children}: { children: React.ReactNode }) {
    return (
        <MainLayoutWrapper>
            {children}
        </MainLayoutWrapper>
    );
}
