import React from "react";
import Link from "next/link";
import { Search, Bell } from "lucide-react";

const EmployeeTopbar = () => (
  <header className="flex items-center justify-between mb-8 bg-white border-b border-[#E2E8F0] px-8 h-20" style={{ minHeight: 80 }}>
    {/* Search Bar */}
    <div className="flex-1 flex items-center">
      <div className="relative w-full max-w-xl">
        <input
          className="w-full h-12 pl-12 pr-4 bg-[#F8FAFC] rounded-2xl text-[#6B7280] placeholder-[#6B7280] text-base border-none outline-none shadow-none"
          placeholder="Search documents, requests..."
          style={{ fontFamily: 'Inter, sans-serif' }}
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
      </div>
    </div>
    {/* Right Section */}
    <div className="flex items-center gap-6 ml-8">
      {/* Notification */}
      <div className="relative flex items-center justify-center w-10 h-10">
        <Bell className="text-[#94A3B8]" size={24} />
        <span className="absolute top-2 right-2 w-2 h-2 bg-[#EF4444] border-2 border-white rounded-full"></span>
      </div>
      {/* Divider */}
      <div className="h-10 border-l border-[#E2E8F0] mx-2"></div>
      {/* User Info */}
      {/* User Info & Avatar Linked to Profile */}
      <Link href="/employee/settings" className="flex items-center gap-4 ml-4 cursor-pointer hover:opacity-80 transition-opacity">
        <div className="flex flex-col items-end justify-center">
          <span className="font-semibold text-[#0F172A] text-base leading-5">Tharindu Perera</span>
          <span className="text-xs text-[#94A3B8] font-medium tracking-wide uppercase leading-4">Employee</span>
        </div>
        <span className="w-10 h-10 rounded-full border-2 border-[#F1F5F9] overflow-hidden flex items-center justify-center bg-[#F9E7DF]">
          <img src="/avatar-employee.png" alt="Employee Avatar" className="w-full h-full object-cover" />
        </span>
      </Link>
    </div>
  </header>
);

export default EmployeeTopbar;
