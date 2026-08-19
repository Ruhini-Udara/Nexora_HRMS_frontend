import React from "react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminTopbar from "@/components/AdminTopbar";
import { AdminNavigationProvider } from "@/components/admin/AdminNavigationContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminNavigationProvider>
      <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <AdminSidebar />
        <div className="flex-1 flex flex-col ml-64 -ml-px">
          <AdminTopbar />
          <main className="flex-1 p-8">{children}</main>
          <footer className="mt-auto px-8 py-6 border-t border-border-light dark:border-border-dark text-center text-sm text-gray-500 dark:text-gray-400">
            Copyright 2026 - 2030 HR MATE All right reserved
          </footer>
        </div>
      </div>
    </AdminNavigationProvider>
  );
}
