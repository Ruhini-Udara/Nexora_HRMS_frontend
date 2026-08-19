"use client";
import { Search, Bell } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from "@/store/useAuthStore";

const DirectorHeader = () => {
    const { user } = useAuthStore();

    return (
        <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between sticky top-0 z-40">
            <div className="relative w-full max-w-lg">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </span>
                <input
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-slate-700 rounded-custom bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-900 dark:text-white"
                    placeholder="Search for team members, requests..."
                    type="text"
                />
            </div>
            <div className="flex items-center gap-6">
                <button className="relative p-1 text-gray-400 hover:text-gray-600">
                    <Bell className="h-6 w-6" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                </button>
                <div className="h-8 border-l border-gray-200 dark:border-slate-800"></div>
                <Link href="/director/profile" className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 p-2 rounded-lg transition-colors">
                    <div className="text-right">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{user?.name || "Director"}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                            {user?.role === 'ROLE_ADMIN' ? 'Admin Account' : 
                             user?.role === 'ROLE_DIRECTOR' ? 'Director Account' : 'User Account'}
                        </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs border border-gray-200 overflow-hidden">
                        {user?.name?.substring(0, 2).toUpperCase() || "DR"}
                    </div>
                </Link>
            </div>
        </header>
    );
};

export default DirectorHeader;
