"use client";

import React from "react";
import StatCard from "@/components/ui/StatCard";
import ModuleCard from "@/components/ui/ModuleCard";
import {
  Users,
  CalendarDays,
  Clock,
  Contact,
  Calendar,
  FileText,
  BarChart2,
} from "lucide-react";
import EmployeeMaster from "@/components/admin/employee-master/EmployeeMaster";
import RegisterEmployee from "@/components/admin/register-employee/RegisterEmployee";
import OfficeCalendar from "@/components/admin/office-calendar/OfficeCalendar";
import { useAdminNavigation } from "./AdminNavigationContext";

export default function AdminContent() {
  const { activeView } = useAdminNavigation();

  if (activeView === "employeeMaster") {
    return <EmployeeMaster />;
  }

  if (activeView === "registerEmployee") {
    return <RegisterEmployee />;
  }

  if (activeView === "officeCalendar") {  
    return <OfficeCalendar />;
  }

  return (
    <div className="max-w-7xl mx-auto w-full pt-20">
      {/* Page Header */}
      <div className="mb-8 pt-2">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-1">
          Admin Dashboard
        </h1>
        <p className="text-gray-500 text-base">
          Welcome back! Here&apos;s what&apos;s happening in HR MATE today.
        </p>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard
          title="Total Employees"
          value="1,248"
          subtext={
            <span className="text-green-600">↗ +12% from last month</span>
          }
          icon={<Users className="w-7 h-7 text-amber-800" />}
          iconBgColor="bg-orange-50"
        />
        <StatCard
          title="Documents Uploaded This Month"
          value="24"
          subtext={<span className="text-amber-600">5 in This week</span>}
          icon={<CalendarDays className="w-7 h-7 text-yellow-600" />}
          iconBgColor="bg-yellow-50"
        />
        <StatCard
          title="Today's Shifts"
          value="456"
          subtext={<span className="text-blue-600">ℹ 98% staffing capacity</span>}
          icon={<Clock className="w-7 h-7 text-blue-600" />}
          iconBgColor="bg-blue-50"
        />
      </div>

      {/* Management Modules Section */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Management Modules
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-7">
        <ModuleCard
          title="Employee Master"
          description="Centralized database for all personnel information, documents, and career history."
          icon={<Contact className="w-7 h-7" />}
          href="/admin/employees"
          className="lg:col-span-2"
        />
        <ModuleCard
          title="Office Calendar"
          description="Global view of holidays, events, and company-wide deadlines for efficient planning."
          icon={<Calendar className="w-7 h-7" />}
          href="/admin/calendar"
          className="lg:col-span-2"
        />
        <ModuleCard
          title="Shift Management"
          description="Optimize workforce allocation across multiple shifts with automated scheduling tools."
          icon={<Clock className="w-7 h-7" />}
          href="/admin/shifts"
          className="lg:col-span-2"
        />
        <ModuleCard
          title="Document Management"
          description="Securely store and track employee contracts, policies, and certifications in one place."
          icon={<FileText className="w-6 h-6" />}
          href="/admin/documents"
          className="lg:col-span-3"
        />
        <ModuleCard
          title="Reports & Analytics"
          description="Generate detailed insights on payroll, turnover, and performance metrics instantly."
          icon={<BarChart2 className="w-6 h-6" />}
          href="/admin/reports"
          className="lg:col-span-3"
        />
      </div>
    </div>
  );
}
