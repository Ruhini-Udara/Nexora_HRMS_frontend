"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

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
    const router = useRouter();
    const logout = useAuthStore((state) => state.logout);
    const [isDark, setIsDark] = React.useState(false);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsDark(document.documentElement.classList.contains("dark"));
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    // Toggle theme handler
    const toggleTheme = () => {
        if (document.documentElement.classList.contains("dark")) {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
            setIsDark(false);
        } else {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
            setIsDark(true);
        }
    };

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const navLinks = [
        { label: "Dashboard", href: "/employee", icon: LayoutDashboard },
        { label: "My Documents", href: "/employee/documents", icon: FolderOpen },
        { label: "Transfer Requests", href: "/employee/transfer-request", icon: ArrowRightLeft },
        { label: "Resignation Requests", href: "/employee/resignation", icon: LogOut },
        { label: "Welfare Requests", href: "/employee/welfare-request", icon: Heart },
        { label: "Training Requests", href: "/employee/training-request", icon: GraduationCap },
        { label: "Leave Requests", href: "/employee/leave-requests", icon: Calendar },
        { label: "Calendar", href: "/employee/calendar", icon: Calendar },
    ];

    // Helper to check if link is active
    const isActiveLink = (href: string) => {
        if (href === "/employee/dashboard" && pathname === "/employee") return true; // Default match
        if (href === "/employee") return pathname === "/employee";
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
            <div className="mt-auto px-4 pb-6 pt-4 border-t border-[#F1F5F9] dark:border-gray-800 space-y-2">
                <button
                    onClick={toggleTheme}
                    className="w-full border border-[#E2E8F0] dark:border-gray-700 rounded-xl py-2 text-[#475569] dark:text-gray-300 font-medium flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px]">
                        {isDark ? 'light_mode' : 'dark_mode'}
                    </span>
                    Toggle Theme
                </button>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </aside >
    );
};

export default EmployeeSidebar;
