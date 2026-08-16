"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    Home,
    ClipboardList,
    Calendar,
    Users,
    BarChart2,
} from "lucide-react";

const navLinks = [
    { label: "Dashboard", href: "/supervisor", icon: Home },
    { label: "Manual Attendance", href: "/supervisor/manual-attendance", icon: ClipboardList },
    { label: "Leave Management", href: "/supervisor/leave-management", icon: Calendar },
    { label: "Team Attendance", href: "/supervisor/team-attendance", icon: Users },
    { label: "Reports", href: "/supervisor/reports", icon: BarChart2 },
];

const SupervisorSidebar = () => {
    const pathname = usePathname();
    const [isDark, setIsDark] = useState(false);

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle("dark");
    };

    return (
        <aside className="w-[260px] bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 left-0 z-50">
            {/* Logo */}
            <div className="p-6 flex items-center gap-2">
                <div className="w-10 h-10 bg-primary rounded-custom flex items-center justify-center text-white font-bold text-xl">
                    HM
                </div>
                <span className="text-xl font-bold tracking-tight text-gray-800">HR MATE</span>
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
                                    ? "bg-primary-light text-primary border-r-4 border-primary"
                                    : "text-sidebar-text hover:bg-gray-50"
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* Toggle Theme */}
            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-custom hover:bg-gray-50"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                        />
                    </svg>
                    Toggle Theme
                </button>
            </div>
        </aside>
    );
};

export default SupervisorSidebar;