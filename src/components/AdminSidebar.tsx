"use client";

import { BarChart2, Calendar, Clock, FileText, Users, GraduationCap, CalendarDays } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminNavigation } from "./admin/AdminNavigationContext";

const menuItems = [
  { label: "Dashboard", icon: <BarChart2 size={18} />, view: "dashboard" as const },
  { label: "Employee Master", icon: <Users size={18} />, view: "employeeMaster" as const },
  { label: "Office Calendar", icon: <Calendar size={18} />, view: "officeCalendar" as const },
  { label: "Shift Management", icon: <Clock size={18} />, view: "shifts" as const },
  { label: "Document Management", icon: <FileText size={18} />, view: "documents" as const },
  { label: "Reports", icon: <BarChart2 size={18} />, view: "reports" as const },
  { label: "Employees", icon: <Users size={18} />, view: "employees" as const },
  { label: "Training & Development", icon: <GraduationCap size={18} />, view: "training" as const },
  { label: "Leave Management", icon: <CalendarDays size={18} />, view: "leaveManagement" as const },
];

export default function AdminSidebar() {
  const { activeView, setActiveView } = useAdminNavigation();
  const pathname = usePathname();
  const router = useRouter();

  const handleMenuClick = (view: any) => {
    setActiveView(view);
    if (pathname !== "/admin") {
      router.push("/admin");
    }
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col justify-between z-30">
      <div>
        <div className="flex items-center gap-2 px-6 py-6">
          <div className="bg-orange-900 text-white rounded-md w-10 h-10 flex items-center justify-center font-bold text-lg">HM</div>
          <span className="font-bold text-xl text-orange-900">HR MATE</span>
        </div>
        <nav className="mt-4">
          {menuItems.map((item) => {
            const isActive =
              item.view === "leaveManagement"
                ? pathname.startsWith("/admin/leave-requests")
                : activeView === item.view && pathname === "/admin";

            return item.view === "leaveManagement" ? (
              <Link
                key={item.label}
                href="/admin/leave-requests"
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-custom transition-colors cursor-pointer ${isActive
                  ? "bg-primary-light text-primary border-r-4 border-primary"
                  : "text-sidebar-text hover:bg-gray-50"
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
                  ? "bg-primary-light text-primary border-r-4 border-primary"
                  : "text-sidebar-text hover:bg-gray-50"
                  }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>
      </div>
      <div className="px-6 py-4 border-t border-gray-200">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-custom hover:bg-gray-50">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
          Toggle Theme
        </button>
      </div>
    </aside>
  );
}
