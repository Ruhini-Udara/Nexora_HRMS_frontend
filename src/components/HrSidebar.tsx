"use client";
import React from "react";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from "@/store/useAuthStore";
import {
    LayoutDashboard,
    Users,
    FolderOpen,
    GraduationCap,
    ClipboardCheck,
    Calendar,
    Heart,
    BarChart3,
    LogOut
} from 'lucide-react';

const HrSidebar = () => {
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
        { label: "Dashboard", href: "/hr", icon: LayoutDashboard },
        { label: "Employees", href: "/hr/employees", icon: Users },
        { label: "Training & Development", href: "/hr/training", icon: GraduationCap },
        { label: "Attendance", href: "/hr/attendance", icon: ClipboardCheck },
        { label: "Leave Management", href: "/hr/leave", icon: Calendar },

        { label: "Welfare Management", href: "/hr/welfare", icon: Heart },
        { label: "Analytics", href: "/hr/analytics", icon: BarChart3 },
        { label: "Calendar", href: "/hr/calendar", icon: Calendar },
    ];

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
                    const isActive = href === "/hr" ? pathname === "/hr" : pathname.startsWith(href);
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

            <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                    <span className="material-icons-outlined text-lg">
                        {isDark ? 'light_mode' : 'dark_mode'}
                    </span>
                    Toggle Theme
                </button>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default HrSidebar;
