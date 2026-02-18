"use client";

import React from "react";
import { BarChart2, Calendar, Clock, Contact, FileText, Users } from "lucide-react";
import { useAdminNavigation } from "./admin/AdminNavigationContext";

const menuItems = [
  { label: "Dashboard", icon: <BarChart2 size={18} />, view: "dashboard" as const },
  { label: "Employee Master", icon: <Users size={18} />, view: "employeeMaster" as const },
  { label: "Office Calendar", icon: <Calendar size={18} />, view: "officeCalendar" as const },
  { label: "Shift Management", icon: <Clock size={18} />, view: "shifts" as const },
  { label: "Document Management", icon: <FileText size={18} />, view: "documents" as const },
  { label: "Reports", icon: <BarChart2 size={18} />, view: "reports" as const },
];

export default function AdminSidebar() {
  const { activeView, setActiveView } = useAdminNavigation();

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r flex flex-col justify-between z-30">
      <div>
        <div className="flex items-center gap-2 px-6 py-6 border-b">
          <div className="bg-orange-900 text-white rounded-md w-10 h-10 flex items-center justify-center font-bold text-lg">HM</div>
          <span className="font-bold text-xl text-orange-900">HR MATE</span>
        </div>
        <nav className="mt-4">
          {menuItems.map((item) => (
            <div
              key={item.label}
              onClick={() => setActiveView(item.view)}
              className={`flex items-center gap-3 px-6 py-3 cursor-pointer text-gray-700 hover:bg-orange-50 transition ${
                activeView === item.view
                  ? "bg-orange-50 border-l-4 border-orange-700 font-semibold"
                  : ""
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
      </div>
      <div className="px-6 py-4 border-t">
        <button className="w-full flex items-center gap-2 justify-center py-2 rounded-md border text-gray-700 hover:bg-gray-100 transition">
          Toggle Theme
        </button>
      </div>
    </aside>
  );
}
