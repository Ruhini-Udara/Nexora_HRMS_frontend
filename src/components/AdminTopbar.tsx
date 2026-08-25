"use client";
import React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { NotificationBell } from "@/components/NotificationBell";
import UserAvatar from "@/components/common/UserAvatar";

import { useAdminNavigation } from "./admin/AdminNavigationContext";

export default function AdminTopbar() {
  const { user } = useAuthStore();
  const { searchQuery, setSearchQuery, activeView, setActiveView } = useAdminNavigation();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim() !== "" && activeView !== "employeeMaster") {
      setActiveView("employeeMaster");
    }
  };

  return (
    <header className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 py-4 z-40">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for employees..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <NotificationBell />
        <div className="h-8 border-l border-gray-200 dark:border-slate-800"></div>
        <Link href="/admin/profile" className="flex items-center gap-2 bg-orange-50 dark:bg-orange-950/20 px-3 py-1 rounded-full border border-orange-100/50 dark:border-orange-900/20 hover:opacity-80 transition-opacity">
          <div className="text-right">
            <div className="font-semibold text-sm text-slate-800 dark:text-white">{user?.name || "User"}</div>
            <div className="text-xs text-gray-500 dark:text-slate-400">Admin Account</div>
          </div>
          <UserAvatar user={user} size="sm" />
        </Link>
      </div>
    </header>
  );
}
