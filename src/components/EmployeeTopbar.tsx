"use client";
import React from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";

const EmployeeTopbar = () => {
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
        <div className="relative group">
          <button className="p-2 text-gray-500 hover:text-primary transition-colors relative focus:outline-none">
            <span className="material-icons-round">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full border-2 border-white dark:border-gray-800"></span>
          </button>
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl dropdown-shadow overflow-hidden opacity-0 invisible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 z-50">
            <div className="p-4 border-b border-border-light dark:border-border-dark flex items-center justify-between bg-white dark:bg-surface-dark">
              <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
              <button className="text-xs font-semibold text-primary hover:underline">Mark all as read</button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <div className="p-4 border-b border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors relative">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-amber-600 text-lg">school</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">New Training Event</p>
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">A new training course has been added.</p>
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

        <Link href="/employee/settings" className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 rounded-lg transition-colors group cursor-pointer">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none group-hover:text-primary transition-colors">
                {user?.name || "Employee"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {user?.role === 'ROLE_ADMIN' ? 'Admin Account' : 
                 user?.role === 'ROLE_HR' ? 'HR Account' : 
                 user?.role === 'ROLE_DIRECTOR' ? 'Director Account' : 'Employee Account'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900 bg-slate-200">
             {user?.name?.substring(0, 2).toUpperCase() || "EM"}
          </div>
        </Link>
      </div>
    </header>
  );
};

export default EmployeeTopbar;
