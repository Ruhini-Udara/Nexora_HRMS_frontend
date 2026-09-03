"use client";

import React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { NotificationBell } from "@/components/NotificationBell";
import UserAvatar from "@/components/common/UserAvatar";

export default function SupervisorTopbar() {
    const { user } = useAuthStore();

    return (
        <header className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 py-4 z-40">
            <div className="flex-1 max-w-md">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search for team members, requests..."
                        className="w-full pl-10 pr-4 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-200 text-sm"
                    />
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                </div>
            </div>
            <div className="flex items-center gap-6">
                <NotificationBell />
                <div className="h-8 border-l border-gray-200 dark:border-slate-800"></div>
                <Link
                    href="/supervisor/profile"
                    className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 p-2 rounded-lg transition-colors group cursor-pointer"
                >
                    <div className="text-right">
                        <div className="font-semibold text-sm text-slate-800 dark:text-white leading-none">
                            {user?.name || "Supervisor"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                            {user?.designation || user?.department || "Supervisor Account"}
                        </div>
                    </div>
                    <UserAvatar user={user} size="md" />
                </Link>
            </div>
        </header>
    );
}
