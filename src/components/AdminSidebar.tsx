"use client";

import { LayoutDashboard, Calendar, Clock, FileText, Users, GraduationCap, CalendarDays, ClipboardCheck, LogOut, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminNavigation } from "./admin/AdminNavigationContext";
import { useAuthStore } from "@/store/useAuthStore";
import { useState, useEffect } from "react";

const menuItems = [
  { label: "Dashboard", icon: <LayoutDashboard size={18} />, view: "dashboard" as const, href: "/admin" },
  { label: "Employee Master", icon: <Users size={18} />, view: "employeeMaster" as const, href: "/admin" },
  { label: "Office Calendar", icon: <Calendar size={18} />, view: "officeCalendar" as const, href: "/admin" },
  { label: "Shift Management", icon: <Clock size={18} />, view: "shifts" as const, href: "/admin" },
  { label: "Document Management", icon: <FileText size={18} />, view: "documents" as const, href: "/admin" },
  { label: "Other Approvals", icon: <ClipboardCheck size={18} />, view: "otherApprovals" as const, href: "/admin/other-approvals" },
  { label: "Training & Development", icon: <GraduationCap size={18} />, view: "training" as const, href: "/admin/training" },
  { label: "Leave Management", icon: <CalendarDays size={18} />, view: "leaveManagement" as const, href: "/admin/leave-requests" },
];

export default function AdminSidebar() {
  const { activeView, setActiveView } = useAdminNavigation();
  const logout = useAuthStore((state) => state.logout);
  const pathname = usePathname();
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleMenuClick = (view: typeof menuItems[number]["view"]) => {
    setActiveView(view);
    if (pathname !== "/admin") {
      router.push("/admin");
    }
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col justify-between z-30">
      <div>
        <div className="flex items-center gap-2 px-6 py-6">
          <div className="bg-orange-900 text-white rounded-md w-10 h-10 flex items-center justify-center font-bold text-lg">HM</div>
          <span className="font-bold text-xl text-orange-900 dark:text-white">HR MATE</span>
        </div>
        <nav className="mt-4">
          {menuItems.map((item) => {
            const isActive =
              item.view === "leaveManagement"
                ? pathname.startsWith("/admin/leave-requests")
                : item.view === "otherApprovals"
                  ? pathname.startsWith("/admin/other-approvals")
                  : item.view === "training"
                    ? pathname.startsWith("/admin/training")
                    : activeView === item.view && pathname === "/admin";

            return item.view === "leaveManagement" || item.view === "otherApprovals" || item.view === "training" ? (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-custom transition-colors cursor-pointer ${isActive
                  ? "bg-primary-light text-primary border-r-4 border-primary dark:bg-primary/10 dark:text-primary dark:border-primary"
                  : "text-sidebar-text dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                  }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ) : (
              <div
                key={item.label}
                onClick={() => handleMenuClick(item.view)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-custom transition-colors cursor-pointer ${isActive
                  ? "bg-primary-light text-primary border-r-4 border-primary dark:bg-primary/10 dark:text-primary dark:border-primary"
                  : "text-sidebar-text dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                  }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>
      </div>
      <div className="px-6 py-4 border-t border-gray-200 dark:border-zinc-800 space-y-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-custom hover:bg-gray-50 dark:hover:bg-zinc-750"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          Toggle Theme
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-custom hover:bg-red-100 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
