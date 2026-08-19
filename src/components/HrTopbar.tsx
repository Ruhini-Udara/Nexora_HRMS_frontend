"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { NotificationBell } from "@/components/NotificationBell";

const HrTopbar = () => {
    const { user } = useAuthStore();

    return (
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
                <NotificationBell />

                <div className="h-8 w-px bg-border-light dark:bg-border-dark mx-2"></div>

                <Link href="/hr/profile" className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 rounded-lg transition-colors group cursor-pointer">
                    <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none group-hover:text-primary transition-colors">
                            {user?.name || "HR User"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {user?.role === 'ROLE_ADMIN' ? 'Admin Account' : 'HR Account'}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900">
                        {user?.name?.substring(0, 2).toUpperCase() || "HR"}
                    </div>
                </Link>
            </div>
        </header>
    );
};

export default HrTopbar;
