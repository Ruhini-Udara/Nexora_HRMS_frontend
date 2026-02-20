"use client";

import React from "react";
import DashboardCards from "@/components/DashboardCards";
import RecentRequestsTable from "@/components/RecentRequestsTable";

const EmployeeDashboardPage = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#0F172A] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Hi Employee!</h2>
        <p className="text-base text-[#64748B]" style={{ fontFamily: 'Inter, sans-serif' }}>Here is what is happening with your requests today.</p>
      </div>
      <DashboardCards />
      <RecentRequestsTable />
    </div>
  );
};

export default EmployeeDashboardPage;
