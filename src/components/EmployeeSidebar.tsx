"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const EmployeeSidebar = () => {
    const pathname = usePathname();
    const [isDark, setIsDark] = React.useState(false);

    // Toggle theme handler
    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark');
    };

    const menuItems = [
        { name: "Dashboard", href: "/employee", icon: "dashboard" },
        { name: "My Documents", href: "/employee/documents", icon: "description" },
        { name: "Transfer Requests", href: "/employee/transfer-request", icon: "swap_horiz" },
        { name: "Resignation Requests", href: "/employee/resignation", icon: "exit_to_app" },
        { name: "Welfare Requests", href: "/employee/welfare-request", icon: "volunteer_activism" },
        { name: "Training Requests", href: "/employee/training-request", icon: "school" },
        { name: "Leave Requests", href: "/employee/leave", icon: "calendar_today" },
    ];

    // Helper to check if link is active
    const isActive = (href: string) => {
        if (href === "/employee/dashboard" && pathname === "/employee") return true; // Default match
        return pathname === href;
    };

    return (
        <aside
            className="fixed left-0 top-0 bottom-0 w-[260px] bg-white border-r border-[#E2E8F0] flex flex-col z-10"
            style={{ minHeight: '100vh' }}
        >
            <div className="px-6 pt-6 pb-2">
                <div className="flex items-center gap-2 mb-8">
                    <div className="bg-[#8B4513] rounded-lg flex items-center justify-center w-[42px] h-[30px]">
                        <span className="text-white font-bold text-lg leading-[18px]">HM</span>
                    </div>
                    <span className="font-bold text-2xl text-[#8B4513] tracking-tight">HR MATE</span>
                </div>
            </div>
            <nav className="flex flex-col gap-1 px-4 flex-1">
                {menuItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center px-4 py-3 text-base transition-all ${active
                                ? "bg-[#FFF3E6] border-r-4 border-[#8B3A00] rounded-none font-medium text-[#8B3A00]"
                                : "rounded-xl font-medium text-[#64748B] hover:bg-slate-50"
                                }`}
                        >
                            <span className={`material-symbols-outlined text-[22px] mr-3 ${active ? "text-[#8B3A00]" : "text-[#64748B]"}`}>
                                {item.icon}
                            </span>
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="mt-auto px-4 pb-6 pt-4 border-t border-[#F1F5F9]">
                <button
                    onClick={toggleTheme}
                    className="w-full border border-[#E2E8F0] rounded-xl py-2 text-[#475569] font-medium flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px]">
                        {isDark ? 'light_mode' : 'dark_mode'}
                    </span>
                    Toggle Theme
                </button>
            </div>
        </aside >
    );
};

export default EmployeeSidebar;
