"use client";

import React, { useState, useEffect } from "react";
import { FilterX } from "lucide-react";

export enum EmployeeType {
  FULL_TIME = "Full-time",
  PART_TIME = "Part-time",
  CONTRACT = "Contract",
  INTERN = "Intern"
}

export enum Department {
  ENGINEERING = "Engineering",
  HUMAN_RESOURCES = "Human Resources",
  SALES_AND_MARKETING = "Sales & Marketing",
  PRODUCT_DEVELOPMENT = "Product Development",
  OPERATIONS = "Operations"
}

interface EmployeeFiltersProps {
  department: string;
  setDepartment: (value: string) => void;
  jobTitle: string;
  setJobTitle: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  onReset: () => void;
}

export default function EmployeeFilters({
  department,
  setDepartment,
  jobTitle,
  setJobTitle,
  status,
  setStatus,
  onReset,
}: EmployeeFiltersProps) {
  interface Designation {
    designationId: number;
    designationName: string;
  }

  const [designations, setDesignations] = useState<Designation[]>([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/designations")
      .then(res => res.json())
      .then(data => setDesignations(data))
      .catch(err => console.error("Error fetching designations:", err));
  }, []);

  const selectBase = "w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#111827] dark:text-slate-200 rounded-lg py-2 px-3 focus:ring-amber-400 focus:border-amber-400";
  const placeholderClass = "text-slate-400";
  const selectedClass = "text-[#111827] dark:text-slate-200";

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Department
          </label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className={`${selectBase} ${department === "" ? placeholderClass : selectedClass}`}>
            <option value="">All Departments</option>
            {Object.values(Department).map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Designation
          </label>
          <select
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className={`${selectBase} ${jobTitle === "" ? placeholderClass : selectedClass}`}>
            <option value="">All Designations</option>
            {designations.map((d) => (
              <option key={d.designationId} value={d.designationName}>
                {d.designationName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Employee Type
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`${selectBase} ${status === "" ? placeholderClass : selectedClass}`}>
            <option value="">All Types</option>
            {Object.values(EmployeeType).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-2 py-2 border border-amber-900 dark:border-amber-700 text-amber-900 dark:text-amber-500 rounded-lg font-medium hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors">
            <FilterX size={16} />
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}

