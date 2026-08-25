"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import {
    LayoutDashboard,
    ClipboardList, 
    Calendar,
    Users,
    BarChart2,
    LogOut,
    Sun,
    Moon,
} from "lucide-react";

const navLinks = [
    { label: "Dashboard", href: "/supervisor", icon: LayoutDashboard },
    { label: "Manual Attendance", href: "/supervisor/manual-attendance", icon: ClipboardList },
    { label: "Leave Management", href: "/supervisor/leave-management", icon: Calendar },
    { label: "Team Attendance", href: "/supervisor/team-attendance", icon: Users },
    { label: "Reports", href: "/supervisor/reports", icon: BarChart2 },
    { label: "Calendar", href: "/supervisor/calendar", icon: Calendar },
];

const SupervisorSidebar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const logout = useAuthStore((state) => state.logout);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
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

    return (
        <aside className="w-[260px] bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col fixed inset-y-0 left-0 z-50">
            {/* Logo */}
            <div className="p-6 flex items-center gap-2">
                <div className="w-10 h-10 bg-primary rounded-custom flex items-center justify-center text-white font-bold text-xl">
                    HM
                </div>
                <span className="text-xl font-bold tracking-tight text-gray-800 dark:text-white">HR MATE</span>
            </div>
 
            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                {navLinks.map(({ label, href, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-custom transition-colors ${isActive
                                    ? "bg-primary-light text-primary border-r-4 border-primary dark:bg-primary/10 dark:text-primary dark:border-primary"
                                    : "text-sidebar-text dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* Toggle Theme & Logout */}
            <div className="p-4 border-t border-gray-200 dark:border-zinc-800 space-y-2">
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-custom hover:bg-gray-50 dark:hover:bg-zinc-750"
                >
                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    Toggle Theme
                </button>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-custom hover:bg-red-100 transition-colors"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default SupervisorSidebar;