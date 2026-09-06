"use client";

import React, { useState, useEffect } from "react";
import StatCard from "@/components/ui/StatCard";
import ModuleCard from "@/components/ui/ModuleCard";
import api from "@/lib/axiosInstance";
import {
  Users,
  Clock,
  Contact,
  Calendar,
  BarChart2,
  GraduationCap,
  CheckSquare,
  UserCog,
  CalendarDays,
  UserCheck,
  Palmtree,
  Hourglass
} from "lucide-react";
import EmployeeMaster from "@/components/admin/employee-master/EmployeeMaster";
import RegisterEmployee from "@/components/admin/register-employee/RegisterEmployee";
import OfficeCalendar from "@/components/admin/office-calendar/OfficeCalendar";
import ShiftManagement from "@/components/admin/shift-management/ShiftManagement";
import { useAdminNavigation } from "./AdminNavigationContext";

export default function AdminContent() {
  const { activeView, setActiveView } = useAdminNavigation();

  const [stats, setStats] = useState({
    totalStaff: "..." as number | string,
    attendancePercentage: "..." as string,
    presentToday: "..." as number | string,
    onLeaveToday: "..." as number | string,
    pendingRequests: "..." as number | string,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const res = await api.get("/api/v1/dashboard/analytics");
        const d = res.data;
        if (isMounted) {
          setStats({
            totalStaff: d.totalStaff ?? 0,
            attendancePercentage: d.attendancePercentage ?? "0%",
            presentToday: d.presentToday ?? 0,
            onLeaveToday: d.onLeaveToday ?? 0,
            pendingRequests: d.totalPendingRequests ?? 0,
          });
        }
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      }
    };
    fetchStats();
    return () => { isMounted = false; };
  }, []);

  if (activeView === "employeeMaster") {
    return <EmployeeMaster />;
  }

  if (activeView === "registerEmployee") {
    return <RegisterEmployee />;
  }

  if (activeView === "officeCalendar") {
    return <OfficeCalendar />;
  }

  if (activeView === "shifts") {
    return <ShiftManagement />;
  }



  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Admin Dashboard
        </h1>

        <p className="text-gray-500 dark:text-slate-400 text-base">
          Welcome back! Here&apos;s what&apos;s happening in HR MATE today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Total Employees"
          value={stats.totalStaff}
          icon={<Users className="w-7 h-7 text-primary" />}
          iconBgColor="bg-primary/10"
        />

        <StatCard
          title="Today's Attendance"
          value={stats.attendancePercentage}
          icon={<UserCheck className="w-7 h-7 text-blue-600" />}
          iconBgColor="bg-blue-50 dark:bg-blue-900/20"
        />

        <StatCard
          title="Employees on Leave Today"
          value={stats.onLeaveToday}
          icon={<Palmtree className="w-7 h-7 text-orange-500" />}
          iconBgColor="bg-orange-50 dark:bg-orange-900/20"
        />

        <StatCard
          title="Total Pending Requests"
          value={stats.pendingRequests}
          icon={<Hourglass className="w-7 h-7 text-red-500" />}
          iconBgColor="bg-red-50 dark:bg-red-900/20"
        />
      </div>

      {/* Management Modules Section */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Management Modules
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-7">
        <ModuleCard
          title="Employee Master"
          description="Centralized database for all personnel information, documents, and career history."
          icon={<Contact className="w-7 h-7" />}
          onClick={() => setActiveView("employeeMaster")}
          className="lg:col-span-2"
        />
        <ModuleCard
          title="Office Calendar"
          description="Global view of holidays, events, and company-wide deadlines for efficient planning."
          icon={<Calendar className="w-7 h-7" />}
          onClick={() => setActiveView("officeCalendar")}
          className="lg:col-span-2"
        />
        <ModuleCard
          title="Shift Management"
          description="Optimize workforce allocation across multiple shifts with automated scheduling tools."
          icon={<Clock className="w-7 h-7" />}
          onClick={() => setActiveView("shifts")}
          className="lg:col-span-2"
        />

        <ModuleCard
          title="Register Employee"
          description="Seamlessly onboard new staff, assign roles, and configure their dual-identity system accounts."
          icon={<Users className="w-6 h-6" />}
          onClick={() => setActiveView("registerEmployee")}
          className="lg:col-span-2"
        />
        <ModuleCard
          title="Training & Development"
          description="Manage and review all pending training applications and monitor employee skill development."
          icon={<GraduationCap className="w-6 h-6" />}
          href="/admin/training"
          className="lg:col-span-2"
        />
        <ModuleCard
          title="Other Approvals"
          description="Review and action pending overseas leave, maternity leave, and other special HR approval requests."
          icon={<CheckSquare className="w-6 h-6" />}
          href="/admin/other-approvals"
          className="lg:col-span-2"
        />
        <ModuleCard
          title="Employee Actions"
          description="Process resignations, transfers, terminations, and other official employee status changes."
          icon={<UserCog className="w-6 h-6" />}
          href="/admin/employee-actions"
          className="lg:col-span-2"
        />
        <ModuleCard
          title="Leave Management"
          description="Review, approve, or reject staff leave requests and monitor leave balances across all departments."
          icon={<CalendarDays className="w-6 h-6" />}
          href="/admin/leave-requests"
          className="lg:col-span-2"
        />
      </div>
    </div>
  );
}
