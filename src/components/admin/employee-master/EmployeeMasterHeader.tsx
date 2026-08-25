"use client";

import React from "react";
import { UserPlus } from "lucide-react";
import { useAdminNavigation } from "../AdminNavigationContext";

export default function EmployeeMasterHeader() {
  const { setActiveView } = useAdminNavigation();

  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-[#111827]">Employee Master</h1>
        <p className="text-slate-500 mt-1">
          Manage all employee records and organizational information.
        </p>
      </div>
      <button
        onClick={() => setActiveView("registerEmployee")}
        className="bg-primary hover:bg-amber-500 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 shadow-sm transition-all active:scale-95"
      >
        <UserPlus size={20} />
        Add New Employee
      </button>
    </div>
  );
}
