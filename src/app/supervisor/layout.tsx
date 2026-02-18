import React from "react";
import SupervisorSidebar from "@/components/SupervisorSidebar";
import SupervisorHeader from "@/components/SupervisorHeader";

export default function SupervisorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-dashboard-bg">
            <SupervisorSidebar />
            <main className="flex-1 ml-[260px]">
                <SupervisorHeader />
                {children}
            </main>
        </div>
    );
}
