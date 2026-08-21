"use client";

import React from "react";
import DashboardCards from "@/components/DashboardCards";
import RecentRequestsTable from "@/components/RecentRequestsTable";

const EmployeeDashboardPage = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Hi Employee!</h2>
        <p className="text-base text-[#64748B] dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>Here is what is happening with your requests today.</p>
      </div>
      <DashboardCards />
      <RecentRequestsTable />
    </div>
  );
};

export default EmployeeDashboardPage;
