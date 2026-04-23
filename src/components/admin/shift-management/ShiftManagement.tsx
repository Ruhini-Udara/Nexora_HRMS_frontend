"use client";

import React, { useState } from "react";
import { Plus, Eye, Pencil, Clock, Sun, Truck, X, Briefcase, Building2, Timer, BadgeCheck } from "lucide-react";
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
  const [selectedDesignation, setSelectedDesignation] = useState("");
  const [selectedShift, setSelectedShift] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showAddMapping, setShowAddMapping] = useState(false);
  const [viewingMapping, setViewingMapping] = useState<ShiftMapping | null>(null);
  const [editingMapping, setEditingMapping] = useState<ShiftMapping | null>(null);
  const [editForm, setEditForm] = useState<ShiftMapping | null>(null);
  const [editingShiftId, setEditingShiftId] = useState<number | null>(null);
  const [editingShiftData, setEditingShiftData] = useState<Shift | null>(null);

  const [shifts, setShifts] = useState<Shift[]>([
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
      description: "Transport & Logistics ",
      startTime: "08:00",
      endTime: "17:00",
      duration: "9h Work Duration",
      status: "Active",
      icon: "truck",
      color: "purple",
    },
  ]);

  const [shiftMappings, setShiftMappings] = useState<ShiftMapping[]>([
    {
      id: 1,
      role: "HR Executive",
      department: "Human Resources",
      assignedShift: "Normal Shift",
      timeRange: "08:30 - 16:30",
      gracePeriod: "15 mins",
      status: "Active",
      avatar: "MA",
    },
    {
      id: 2,
      role: "Sales Executive",
      department: "Sales & Marketing",
      assignedShift: "Normal Shift",
      timeRange: "08:30 - 16:30",
      gracePeriod: "10 mins",
      status: "Active",
      avatar: "EX",
    },
    {
      id: 3,
      role: "Support Staff",
      department: "Operations",
      assignedShift: "Temporary Shift",
      timeRange: "08:15 - 16:45",
      gracePeriod: "0 mins",
      status: "Active",
      avatar: "SA",
    },
  ]);

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

  const handleEdit = (mapping: ShiftMapping) => {
    setEditingMapping(mapping);
    setEditForm({ ...mapping });
  };

  const handleSave = () => {
    if (editForm) {
      setShiftMappings(shiftMappings.map((mapping) => 
        mapping.id === editForm.id ? editForm : mapping
      ));
      setEditingMapping(null);
      setEditForm(null);
    }
  };

  const handleCancel = () => {
    setEditingMapping(null);
    setEditForm(null);
  };

  const handleEditShift = (shift: Shift) => {
    setEditingShiftId(shift.id);
    setEditingShiftData({ ...shift });
  };

  const calculateDuration = (startTime: string, endTime: string): string => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    
    // Handle overnight shifts
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60;
    }
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (minutes === 0) {
      return `${hours}h Work Duration`;
    } else {
      return `${hours}h ${minutes}m Work Duration`;
    }
  };

  const handleSaveShift = () => {
    if (editingShiftData) {
      const updatedShift = {
        ...editingShiftData,
        duration: calculateDuration(editingShiftData.startTime, editingShiftData.endTime)
      };
      setShifts(shifts.map((shift) => 
        shift.id === updatedShift.id ? updatedShift : shift
      ));
      setEditingShiftId(null);
      setEditingShiftData(null);
    }
  };

  const handleCancelShift = () => {
    setEditingShiftId(null);
    setEditingShiftData(null);
  };

  // Filter shift mappings based on selected filters
  const filteredShiftMappings = shiftMappings.filter((mapping) => {
    const matchesDesignation = !selectedDesignation || mapping.role === selectedDesignation;
    const matchesShift = !selectedShift || mapping.assignedShift === selectedShift;
    const matchesStatus = !selectedStatus || mapping.status === selectedStatus;
    
    return matchesDesignation && matchesShift && matchesStatus;
  });

  const handleResetFilters = () => {
    setSelectedDesignation("");
    setSelectedShift("");
    setSelectedStatus("");
  };

  return (
    <div className="p-8">
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
          {shifts.map((shift) => {
            const isEditing = editingShiftId === shift.id;
            const displayShift = isEditing && editingShiftData ? editingShiftData : shift;
            
            return (
            <div
              key={shift.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${getShiftColor(displayShift.color)}`}>
                  {getShiftIcon(displayShift.icon)}
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  {displayShift.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#111827] mb-1">{displayShift.name}</h3>
              <p className="text-sm text-slate-600 mb-4">{displayShift.description}</p>
              
              {isEditing ? (
                <div className="space-y-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={displayShift.startTime}
                      onChange={(e) => {
                        const newShift = { ...displayShift, startTime: e.target.value };
                        newShift.duration = calculateDuration(newShift.startTime, newShift.endTime);
                        setEditingShiftData(newShift);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">End Time</label>
                    <input
                      type="time"
                      value={displayShift.endTime}
                      onChange={(e) => {
                        const newShift = { ...displayShift, endTime: e.target.value };
                        newShift.duration = calculateDuration(newShift.startTime, newShift.endTime);
                        setEditingShiftData(newShift);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-[#111827]">
                    {displayShift.startTime} - {displayShift.endTime}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">{displayShift.duration}</span>
                {isEditing ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSaveShift}
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      Save
                    </button>
                    <button 
                      onClick={handleCancelShift}
                      className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleEditShift(shift)}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                  >
                    Edit Details
                  </button>
                )}
              </div>
            </div>
            );
          })}
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
              <option value="">All Designations</option>
              <option value="Senior Engineer">Senior Engineer</option>
              <option value="Engineer">Engineer</option>
              <option value="HR Manager">HR Manager</option>
              <option value="HR Executive">HR Executive</option>
              <option value="Sales Executive">Sales Executive</option>
              <option value="Product Manager">Product Manager</option>
              <option value="Driver">Driver</option>
              <option value="Support Staff">Support Staff</option>
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
              <option value="">All Shifts</option>
              <option value="Normal Shift">Normal Shift</option>
              <option value="Temporary Shift">Temporary Shift</option>
              <option value="Drivers Shift">Drivers Shift</option>
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
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleResetFilters}
              className="w-full px-6 py-2.5 border border-amber-900 text-amber-900 hover:bg-amber-50 font-medium rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Designation to Shift Mapping Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#111827]">Designation to Shift Mapping</h2>
          <span className="text-sm text-slate-600">Total {filteredShiftMappings.length} Mappings</span>
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
              {filteredShiftMappings.map((mapping) => (
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
                      <button 
                        onClick={() => setViewingMapping(mapping)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Eye size={18} className="text-slate-600" />
                      </button>
                      <button 
                        onClick={() => handleEdit(mapping)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
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

      {/* View Shift Mapping Modal */}
      {viewingMapping && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Shift Mapping Details</h2>
                <p className="text-sm text-slate-500 mt-1">View designation to shift mapping information</p>
              </div>
              <button
                onClick={() => setViewingMapping(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
                <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-2xl">
                  {viewingMapping.avatar}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{viewingMapping.role}</h3>
                  <p className="text-amber-800 font-semibold">{viewingMapping.department}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="text-blue-600" size={18} />
                    <label className="block text-sm font-medium text-blue-900">
                      Assigned Shift
                    </label>
                  </div>
                  <p className="text-base text-gray-900 font-semibold">{viewingMapping.assignedShift}</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Timer className="text-purple-600" size={18} />
                    <label className="block text-sm font-medium text-purple-900">
                      Time Range
                    </label>
                  </div>
                  <p className="text-base text-gray-900 font-semibold">{viewingMapping.timeRange}</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="text-green-600" size={18} />
                    <label className="block text-sm font-medium text-green-900">
                      Grace Period
                    </label>
                  </div>
                  <p className="text-base text-gray-900 font-semibold">{viewingMapping.gracePeriod}</p>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BadgeCheck className="text-amber-600" size={18} />
                    <label className="block text-sm font-medium text-amber-900">
                      Status
                    </label>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    viewingMapping.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {viewingMapping.status}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-6 border-t border-slate-200">
              <button
                onClick={() => setViewingMapping(null)}
                className="w-full bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Shift Mapping Modal */}
      {editingMapping && editForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Edit Shift Mapping</h2>
                <p className="text-sm text-slate-500 mt-1">Update designation to shift mapping</p>
              </div>
              <button
                onClick={handleCancel}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Form Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designation / Role
                </label>
                <input
                  type="text"
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Shift
                </label>
                <select
                  value={editForm.assignedShift}
                  onChange={(e) => setEditForm({ ...editForm, assignedShift: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Select Shift</option>
                  <option value="Normal Shift">Normal Shift</option>
                  <option value="Temporary Shift">Temporary Shift</option>
                  <option value="Drivers Shift">Drivers Shift</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Range
                </label>
                <input
                  type="text"
                  value={editForm.timeRange}
                  onChange={(e) => setEditForm({ ...editForm, timeRange: e.target.value })}
                  placeholder="08:30 - 16:30"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grace Period
                </label>
                <input
                  type="text"
                  value={editForm.gracePeriod}
                  onChange={(e) => setEditForm({ ...editForm, gracePeriod: e.target.value })}
                  placeholder="15 mins"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as "Active" | "Inactive" })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            {/* Footer with Buttons */}
            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 bg-amber-900 text-white py-2.5 px-4 rounded-lg hover:bg-amber-800 transition-colors font-medium"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Shift Mapping Modal */}
      {showAddMapping && <AddNewShiftMapping onClose={() => setShowAddMapping(false)} />}
    </div>
  );
}
