"use client";

import React, { useEffect, useState } from "react";
import DashboardCards from "@/components/DashboardCards";
import RecentRequestsTable, { RecentRequestItem } from "@/components/RecentRequestsTable";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axiosInstance";
import { Clock } from "lucide-react";

interface DashboardData {
  attendanceStatus: string;
  attendanceTime: string | null;
  leaveBalance: number;
  activeTrainingPrograms: number;
  pendingRequestsCount: number;
  recentRequests: RecentRequestItem[];
  shiftName?: string | null;
  shiftStartTime?: string | null;
  shiftEndTime?: string | null;
}

interface FallbackShift {
  name: string;
  startTime: string;
  endTime: string;
}

const formatShiftTime = (timeStr?: string | null) => {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  const hr = parseInt(parts[0], 10);
  const min = parts[1];
  if (isNaN(hr)) return timeStr;
  const ampm = hr >= 12 ? "PM" : "AM";
  const hr12 = hr % 12 || 12;
  return `${hr12.toString().padStart(2, "0")}:${min} ${ampm}`;
};

const EmployeeDashboardPage = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [fallbackShift, setFallbackShift] = useState<FallbackShift | null>(null);

  // derive loading instead of storing it in state
  const loading = user?.id ? data === null : false;

  useEffect(() => {
    const employeeId = user?.employeeId || user?.id;
    if (!employeeId) return;

    api.get(`/api/v1/dashboard/employee/${employeeId}`)
      .then((res) => {
        setData(res.data);
        if (!res.data.shiftName) {
          // Fetch employee to retrieve designation shift as fallback
          api.get(`/api/employees/${employeeId}`)
            .then((empRes) => {
              const shift = empRes.data?.designation?.shift;
              if (shift && shift.name) {
                setFallbackShift({
                  name: shift.name,
                  startTime: shift.startTime,
                  endTime: shift.endTime,
                });
              }
            })
            .catch(() => {});
        }
      })
      .catch((err) => {
        console.error("Failed to fetch dashboard data", err);
      });
  }, [user?.id, user?.employeeId]);

  if (loading) {
    return <div className="text-center py-10 text-slate-500">Loading dashboard data...</div>;
  }

  const shiftName = data?.shiftName || fallbackShift?.name;
  const shiftStartTime = data?.shiftStartTime || fallbackShift?.startTime;
  const shiftEndTime = data?.shiftEndTime || fallbackShift?.endTime;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1 border-b border-slate-100 dark:border-slate-800/60">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
            Hi {user?.name || 'Employee'}!
          </h2>
          <p className="text-base text-[#64748B] dark:text-slate-400 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
            Here is what is happening with your requests today.
          </p>
        </div>

        {shiftName && shiftStartTime && shiftEndTime ? (
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 shadow-2xs self-start sm:self-auto sm:ml-auto">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold">{shiftName}</span>
              <span className="text-amber-400 dark:text-amber-600 font-bold">•</span>
              <span className="font-medium text-amber-800 dark:text-amber-200">
                {formatShiftTime(shiftStartTime)} – {formatShiftTime(shiftEndTime)}
              </span>
            </div>
          </div>
        ) : shiftName ? (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 shadow-2xs self-start sm:self-auto sm:ml-auto">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-semibold">{shiftName}</span>
          </div>
        ) : null}
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

