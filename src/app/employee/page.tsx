"use client";

import React, { useEffect, useState } from "react";
import DashboardCards from "@/components/DashboardCards";
import RecentRequestsTable, { RecentRequestItem } from "@/components/RecentRequestsTable";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axiosInstance";

interface DashboardData {
  attendanceStatus: string;
  attendanceTime: string | null;
  leaveBalance: number;
  activeTrainingPrograms: number;
  pendingRequestsCount: number;
  recentRequests: RecentRequestItem[];
}

const EmployeeDashboardPage = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);

  // derive loading instead of storing it in state
  const loading = user?.id ? data === null : false;

  useEffect(() => {
    if (!user?.id) return;

    api.get(`/api/v1/dashboard/employee/${user.id}`)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch dashboard data", err);
      });
  }, [user?.id]);

  if (loading) {
    return <div className="text-center py-10 text-slate-500">Loading dashboard data...</div>;
  }
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Hi {user?.name || 'Employee'}!</h2>
        <p className="text-base text-[#64748B] dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>Here is what is happening with your requests today.</p>
      </div>
      <DashboardCards 
        attendanceStatus={data?.attendanceStatus || "Not Checked In"}
        attendanceTime={data?.attendanceTime || null}
        leaveBalance={data?.leaveBalance || 0}
        activeTrainingPrograms={data?.activeTrainingPrograms || 0}
        pendingRequestsCount={data?.pendingRequestsCount || 0}
      />
      <RecentRequestsTable requests={data?.recentRequests || []} />
    </div>
  );
};

export default EmployeeDashboardPage;
