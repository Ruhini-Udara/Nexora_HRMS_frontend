"use client";

import React, { useState } from "react";
import { Plus, Eye, Pencil, Clock, Sun, Truck } from "lucide-react";
import AddNewShiftMapping from "../addnewshiftmapping/AddNewShiftMapping";

interface Shift {
  id: number;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: string;
  status: "Active" | "Inactive";
  icon: "sun" | "clock" | "truck";
  color: string;
}

interface ShiftMapping {
  id: number;
  role: string;
  department: string;
  assignedShift: string;
  timeRange: string;
  gracePeriod: string;
  status: "Active" | "Inactive";
  avatar: string;
}

export default function ShiftManagement() {
  const [selectedDesignation, setSelectedDesignation] = useState("All Designations");
  const [selectedShift, setSelectedShift] = useState("All Shifts");
  const [selectedStatus, setSelectedStatus] = useState("Active");
  const [showAddMapping, setShowAddMapping] = useState(false);

  const shifts: Shift[] = [
    {
      id: 1,
      name: "Normal Shift",
      description: "Standard operational hours",
      startTime: "08:30",
      endTime: "16:30",
      duration: "8h Work Duration",
      status: "Active",
      icon: "sun",
      color: "blue",
    },
    {
      id: 2,
      name: "Temporary Shift",
      description: "Contract staff & interns",
      startTime: "08:15",
      endTime: "16:45",
      duration: "8.5h Work Duration",
      status: "Active",
      icon: "clock",
      color: "orange",
    },
    {
      id: 3,
      name: "Drivers Shift",
      description: "Transport & Logistics",
      startTime: "08:00",
      endTime: "17:00",
      duration: "9h Work Duration",
      status: "Active",
      icon: "truck",
      color: "purple",
    },
  ];

  const shiftMappings: ShiftMapping[] = [
    {
      id: 1,
      role: "Management Assistant",
      department: "Admin Dept",
      assignedShift: "Normal Shift",
      timeRange: "08:30 - 16:30",
      gracePeriod: "15 mins",
      status: "Active",
      avatar: "MA",
    },
    {
      id: 2,
      role: "Executive",
      department: "Multiple Depts",
      assignedShift: "Normal Shift",
      timeRange: "08:30 - 16:30",
      gracePeriod: "10 mins",
      status: "Active",
      avatar: "EX",
    },
    {
      id: 3,
      role: "Staff Assistant",
      department: "Operations",
      assignedShift: "Temporary Shift",
      timeRange: "08:15 - 16:45",
      gracePeriod: "0 mins",
      status: "Active",
      avatar: "SA",
    },
  ];

  const getShiftIcon = (icon: string) => {
    switch (icon) {
      case "sun":
        return <Sun size={24} />;
      case "clock":
        return <Clock size={24} />;
      case "truck":
        return <Truck size={24} />;
      default:
        return <Clock size={24} />;
    }
  };

  const getShiftColor = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-50 text-blue-600";
      case "orange":
        return "bg-orange-50 text-orange-600";
      case "purple":
        return "bg-purple-50 text-purple-600";
      default:
        return "bg-slate-50 text-slate-600";
    }
  };

  const getShiftBadgeColor = (shiftName: string) => {
    if (shiftName === "Normal Shift") return "bg-blue-100 text-blue-700";
    if (shiftName === "Temporary Shift") return "bg-orange-100 text-orange-700";
    return "bg-slate-100 text-slate-700";
  };

  return (
    <div className="pt-20 p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#111827]">Shift & Designation Management</h1>
          <p className="text-slate-600 mt-1">
            Configure shift timings and map designations to specific schedules.
          </p>
        </div>
        <button 
          onClick={() => setShowAddMapping(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-medium rounded-lg transition-colors"
        >
          <Plus size={18} />
          Add New Shift Mapping
        </button>
      </div>

      {/* Defined Shift Types */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={20} className="text-amber-600" />
          <h2 className="text-lg font-bold text-[#111827]">Defined Shift Types</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {shifts.map((shift) => (
            <div
              key={shift.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${getShiftColor(shift.color)}`}>
                  {getShiftIcon(shift.icon)}
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  {shift.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#111827] mb-1">{shift.name}</h3>
              <p className="text-sm text-slate-600 mb-4">{shift.description}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold text-[#111827]">
                  {shift.startTime} - {shift.endTime}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">{shift.duration}</span>
                <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                  Edit Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2 uppercase">
              Designation
            </label>
            <select
              value={selectedDesignation}
              onChange={(e) => setSelectedDesignation(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all bg-white"
            >
              <option>All Designations</option>
              <option>Management Assistant</option>
              <option>Executive</option>
              <option>Staff Assistant</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2 uppercase">
              Assigned Shift
            </label>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all bg-white"
            >
              <option>All Shifts</option>
              <option>Normal Shift</option>
              <option>Temporary Shift</option>
              <option>Drivers Shift</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2 uppercase">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all bg-white"
            >
              <option>Active</option>
              <option>Inactive</option>
              <option>All</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full px-6 py-2.5 bg-amber-900 hover:bg-amber-800 text-white font-medium rounded-lg transition-colors">
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Designation to Shift Mapping Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#111827]">Designation to Shift Mapping</h2>
          <span className="text-sm text-slate-600">Total 4 Mappings</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Designation / Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Assigned Shift
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Time Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Grace Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {shiftMappings.map((mapping) => (
                <tr key={mapping.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
                        {mapping.avatar}
                      </div>
                      <div>
                        <div className="font-medium text-[#111827]">{mapping.role}</div>
                        <div className="text-sm text-slate-500">{mapping.department}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getShiftBadgeColor(
                        mapping.assignedShift
                      )}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {mapping.assignedShift}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                    {mapping.timeRange}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{mapping.gracePeriod}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      {mapping.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <Eye size={18} className="text-slate-600" />
                      </button>
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <Pencil size={18} className="text-slate-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Shift Mapping Modal */}
      {showAddMapping && <AddNewShiftMapping onClose={() => setShowAddMapping(false)} />}
    </div>
  );
}
