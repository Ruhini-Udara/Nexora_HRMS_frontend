"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    LayoutDashboard,
    FolderOpen,
    ArrowRightLeft,
    LogOut,
    Heart,
    GraduationCap,
    Calendar,
} from 'lucide-react';

const EmployeeSidebar = () => {
    const pathname = usePathname();
    const [isDark, setIsDark] = React.useState(false);

    // Toggle theme handler
    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark');
    };

    const navLinks = [
        { label: "Dashboard", href: "/employee", icon: LayoutDashboard },
        { label: "My Documents", href: "/employee/documents", icon: FolderOpen },
        { label: "Transfer Requests", href: "/employee/transfer-request", icon: ArrowRightLeft },
        { label: "Resignation Requests", href: "/employee/resignation", icon: LogOut },
        { label: "Welfare Requests", href: "/employee/welfare-request", icon: Heart },
        { label: "Training Requests", href: "/employee/training-request", icon: GraduationCap },
        { label: "Leave Requests", href: "/employee/leave-requests", icon: Calendar },
    ];

    // Helper to check if link is active
    const isActiveLink = (href: string) => {
        if (href === "/employee/dashboard" && pathname === "/employee") return true; // Default match
        if (href === "/employee") return pathname === "/employee";

        // Check if the current pathname starts with the href (useful for nested routes like /employee/leave-requests/overseas-leave)
        return pathname.startsWith(href);
    };

    return (
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full">
            <div className="p-6 flex items-center gap-2">
                <div className="w-10 h-10 bg-[#8B3A00] rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    HM
                </div>
                <span className="text-xl font-bold tracking-tight text-[#8B3A00] dark:text-white">HR MATE</span>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navLinks.map(({ label, href, icon: Icon }) => {
                    const isActive = isActiveLink(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                ? "bg-primary-light text-primary border-r-4 border-primary dark:bg-primary/10 dark:text-primary dark:border-primary"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            {label}
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
