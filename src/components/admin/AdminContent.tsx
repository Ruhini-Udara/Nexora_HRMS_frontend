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
  GraduationCap
} from "lucide-react";
import EmployeeMaster from "@/components/admin/employee-master/EmployeeMaster";
import RegisterEmployee from "@/components/admin/register-employee/RegisterEmployee";
import OfficeCalendar from "@/components/admin/office-calendar/OfficeCalendar";
import ShiftManagement from "@/components/admin/shift-management/ShiftManagement";
import { useAdminNavigation } from "./AdminNavigationContext";

export default function AdminContent() {
  const { activeView, setActiveView } = useAdminNavigation();
  const [employeeCount, setEmployeeCount] = useState<number | string>("...");
  const [shiftCount, setShiftCount] = useState<number | string>("...");

  useEffect(() => {
    let isMounted = true;
    const fetchCounts = async () => {
      try {
        let empCount = 0;
        let sCount = 3;

        try {
          const empRes = await api.get("/api/employees");
          if (Array.isArray(empRes.data)) {
            empCount = empRes.data.length;
          }
        } catch {
          // fallback
        }

        try {
          const shiftRes = await fetch("/api/shifts");
          if (shiftRes.ok) {
            const shiftsData = await shiftRes.json();
            if (Array.isArray(shiftsData)) {
              sCount = shiftsData.length;
            }
          }
        } catch {
          // fallback
        }

        if (isMounted) {
          setEmployeeCount(empCount);
          setShiftCount(sCount);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        if (isMounted) {
          setEmployeeCount("N/A");
          setShiftCount("N/A");
        }
      }
    };

    fetchCounts();
    return () => {
      isMounted = false;
    };
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard
          title="Total Employees"
          value={employeeCount}
          icon={<Users className="w-7 h-7 text-primary" />}
          iconBgColor="bg-primary/10"
        />

        <StatCard
          title="Today's Shifts"
          value={shiftCount}
          icon={<Clock className="w-7 h-7 text-blue-600" />}
          iconBgColor="bg-blue-50"
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
      </div>
    </div>
  );
}
