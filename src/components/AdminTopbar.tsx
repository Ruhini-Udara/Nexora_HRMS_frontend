"use client";
import React from "react";
import { Bell, Search } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function AdminTopbar() {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 bg-white border-b border-slate-200 flex items-center justify-between px-8 py-4 z-40">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for employees, documents..."
            className="w-full pl-10 pr-4 py-2 rounded-md border border-slate-200 bg-white text-slate-400 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <Bell className="text-gray-400" size={20} />
        <div className="h-8 border-l border-gray-200"></div>
        <div className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full">
          <div className="text-right">
            <div className="font-semibold text-sm">{user?.name || "User"}</div>
            <div className="text-xs text-gray-500">Admin Account</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-orange-300 flex items-center justify-center text-white font-bold text-xs">
              {user?.name?.substring(0, 2).toUpperCase() || "US"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
