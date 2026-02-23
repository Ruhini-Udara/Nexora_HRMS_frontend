import React from "react";
import EmployeeTopbar from "@/components/EmployeeTopbar";
import EmployeeSidebar from "@/components/EmployeeSidebar";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <EmployeeSidebar />
      <main className="flex-1 flex flex-col overflow-y-auto">
        <EmployeeTopbar />

        <div className="flex-1 p-8">
          {children}
        </div>

        <footer className="mt-auto px-8 py-6 border-t border-border-light dark:border-border-dark text-center text-sm text-gray-500 dark:text-gray-400">
          Copyright 2026 - 2030 HR MATE All right reserved
        </footer>
      </main>
    </div>
  );
}
