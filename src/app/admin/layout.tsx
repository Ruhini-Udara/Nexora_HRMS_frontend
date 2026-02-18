import React from "react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminTopbar from "@/components/AdminTopbar";
import { AdminNavigationProvider } from "@/components/admin/AdminNavigationContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminNavigationProvider>
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex flex-col ml-64 -ml-px">
          <AdminTopbar />
          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </AdminNavigationProvider>
  );
}
