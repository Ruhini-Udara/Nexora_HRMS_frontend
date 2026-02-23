"use client";

import React from "react";
import HrSidebar from "@/components/HrSidebar";
import HrTopbar from "@/components/HrTopbar";

export default function HRLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <HrSidebar />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-y-auto">
                <HrTopbar />

                {children}

                <footer className="mt-auto px-8 py-6 border-t border-border-light dark:border-border-dark text-center text-sm text-gray-500 dark:text-gray-400">
                    Copyright 2026 - 2030 HR MATE All right reserved
                </footer>
            </main>
        </div>
    );
}
