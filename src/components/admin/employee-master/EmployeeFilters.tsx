"use client";

import React, { useState } from "react";
import { FilterX } from "lucide-react";

export default function EmployeeFilters() {
  const [department, setDepartment] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [status, setStatus] = useState("");

  const selectBase = "w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 focus:ring-amber-400 focus:border-amber-400";
  const placeholderClass = "text-slate-400";
  const selectedClass = "text-[#111827]";

  const reset = () => {
    setDepartment("");
    setJobTitle("");
    setStatus("");
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
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
            <option value="Engineering">Engineering</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Sales &amp; Marketing">Sales &amp; Marketing</option>
            <option value="Product Development">Product Development</option>
            <option value="Operations">Operations</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Job Title
          </label>
          <select
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className={`${selectBase} ${jobTitle === "" ? placeholderClass : selectedClass}`}>
            <option value="">All Roles</option>
            <option value="Senior Engineer">Senior Engineer</option>
            <option value="HR Manager">HR Manager</option>
            <option value="Backend Lead">Backend Lead</option>
            <option value="Marketing Head">Marketing Head</option>
            <option value="Operations Lead">Operations Lead</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Employment Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`${selectBase} ${status === "" ? placeholderClass : selectedClass}`}>
            <option value="">All Status</option>
            <option value="Full-time">Full-time</option>
            <option value="Contract">Contract</option>
            <option value="Part-time">Part-time</option>
          </select>
        </div>

        <div>
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 py-2 border border-amber-900 text-amber-900 rounded-lg font-medium hover:bg-amber-50 transition-colors">
            <FilterX size={16} />
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}
