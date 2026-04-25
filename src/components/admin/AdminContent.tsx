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
  GraduationCap
} from "lucide-react";
import EmployeeMaster from "@/components/admin/employee-master/EmployeeMaster";
import RegisterEmployee from "@/components/admin/register-employee/RegisterEmployee";
import OfficeCalendar from "@/components/admin/office-calendar/OfficeCalendar";
import ShiftManagement from "@/components/admin/shift-management/ShiftManagement";
import DocumentManagement from "@/components/admin/document-management/DocumentManagement";
import { useAdminNavigation } from "./AdminNavigationContext";

export default function AdminContent() {
  const { activeView, setActiveView } = useAdminNavigation();

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

  if (activeView === "documents") {
    return <DocumentManagement />;
  }

  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="mb-8">
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
          value="3"
          subtext={<span className="text-blue-600"> 98% staffing capacity</span>}
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
          title="Document Management"
          description="Securely store and track employee contracts, policies, and certifications in one place."
          icon={<FileText className="w-6 h-6" />}
          onClick={() => setActiveView("documents")}
          className="lg:col-span-3"
        />
        <ModuleCard
          title="Register Employee"
          description="Seamlessly onboard new staff, assign roles, and configure their dual-identity system accounts."
          icon={<Users className="w-6 h-6" />}
          onClick={() => setActiveView("registerEmployee")}
          className="lg:col-span-3"
        />
        <ModuleCard
          title="Training & Development"
          description="Manage and review all pending training applications and monitor employee skill development."
          icon={<GraduationCap className="w-6 h-6" />}
          href="/admin/training"
          className="lg:col-span-3"
        />
      </div>
    </div>
  );
}
