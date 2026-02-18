"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function HRLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isDark, setIsDark] = useState(false);

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle("dark");
    };

    const sidebarLinks = [
        { label: "Dashboard", href: "/hr", icon: "dashboard" },
        { label: "Employees", href: "/hr/employees", icon: "people" },
        { label: "Documents", href: "/hr/documents", icon: "folder" },
        { label: "Training & Development", href: "/hr/training", icon: "school" },
        { label: "Attendance", href: "/hr/attendance", icon: "how_to_reg" },
        { label: "Leave Management", href: "/hr/leave", icon: "event_note" },
        { label: "Welfare", href: "/hr/welfare", icon: "volunteer_activism" },
        { label: "Reports & Analytics", href: "/hr/reports", icon: "insights" },
    ];

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark flex flex-col">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">HM</div>
                    <h1 className="text-2xl font-bold text-primary tracking-tight">HR MATE</h1>
                </div>

                <nav className="mt-6 flex-1 px-3 space-y-1 overflow-y-auto">
                    {sidebarLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${isActive
                                    ? "sidebar-active"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    }`}
                            >
                                <span className="material-icons-round mr-3">{link.icon}</span>
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-border-light dark:border-border-dark">
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border-light dark:border-border-dark rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <span className="material-icons-round text-lg">dark_mode</span>
                        Toggle Theme
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-y-auto">
                <header className="bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark px-8 py-4 flex items-center justify-between sticky top-0 z-50">
                    <div className="relative w-96">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="material-icons-round text-gray-400">search</span>
                        </span>
                        <input
                            className="block w-full pl-10 pr-3 py-2 border border-border-light dark:border-border-dark rounded-md leading-5 bg-white dark:bg-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                            placeholder="Search resources..."
                            type="text"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <button className="p-2 text-gray-500 hover:text-primary transition-colors relative focus:outline-none">
                                <span className="material-icons-round">notifications</span>
                                <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full border-2 border-white dark:border-gray-800"></span>
                            </button>
                            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl dropdown-shadow overflow-hidden opacity-0 invisible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 z-50">
                                <div className="p-4 border-b border-border-light dark:border-border-dark flex items-center justify-between bg-white dark:bg-surface-dark">
                                    <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                                    <button className="text-xs font-semibold text-primary hover:underline">Mark all as read</button>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    <div className="p-4 border-b border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors relative">
                                        <div className="flex gap-3">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary text-lg">calendar_today</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">New Leave Request</p>
                                                    <span className="w-2 h-2 bg-secondary rounded-full"></span>
                                                </div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">John Doe submitted a request for 3 days starting Oct 15.</p>
                                                <button className="bg-secondary text-white text-[10px] font-bold px-3 py-1 rounded hover:opacity-90 transition-opacity">VIEW</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 border-b border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors relative">
                                        <div className="flex gap-3">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary text-lg">schedule</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Shift Updated</p>
                                                    <span className="w-2 h-2 bg-secondary rounded-full"></span>
                                                </div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">Engineering department schedule for next week has been revised.</p>
                                                <p className="text-[10px] text-gray-400 mt-1">10 minutes ago</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <div className="flex gap-3">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary text-lg">description</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Document Expiring</p>
                                                </div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">Sarah Smith&apos;s ISO certification expires in 30 days.</p>
                                                <p className="text-[10px] text-gray-400 mt-1">5 hours ago</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 text-center border-t border-border-light dark:border-border-dark">
                                    <button className="text-xs font-medium text-gray-500 hover:text-primary transition-colors">See all notifications</button>
                                </div>
                            </div>
                        </div>

                        <div className="h-8 w-px bg-border-light dark:bg-border-dark mx-2"></div>

                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">HR User</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">HR Generalist</p>
                            </div>
                            <img
                                alt="HR User Profile Picture"
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-primary"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoGBsuvObewjRG1Qml5k0ewxjI1vvQDzr7Z0tJhvq3gywv-IXDW9qdBtydjTptpZKrCwdwDIv-fMIw-T3sdHev3SCGvbGU0HeUB1j1effmFIIL-m-JRBW79EpCn8FT62x7m9U7_RXLBCUO1i282aJpcDsYusohXxUa99lwFjAlb7WZ20AmYwsUfd_6P-hEMTyNGBJtJLYgCGmhHFW59lUNx0G7YCOmS0Xc0QRh0bVZs68e0igyeVx9x64zOrXdbb8sXhlWPPlslNc"
                            />
                        </div>
                    </div>
                </header>

                {children}

                <footer className="mt-auto px-8 py-6 border-t border-border-light dark:border-border-dark text-center text-sm text-gray-500 dark:text-gray-400">
                    Copyright 2026 - 2030 HR MATE All right reserved
                </footer>
            </main>
        </div>
    );
}
