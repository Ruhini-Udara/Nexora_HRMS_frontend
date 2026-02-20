"use client";

import React, { useState } from "react";
import { Save, X, Calendar } from "lucide-react";

interface Department {
  id: string;
  name: string;
}

export default function AddCompanyHoliday({ onClose }: { onClose?: () => void }) {
  const [holidayName, setHolidayName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [holidayType, setHolidayType] = useState("Public Holiday");
  const [repeatYearly, setRepeatYearly] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState<Department[]>([
    { id: "1", name: "Engineering" },
    { id: "2", name: "Marketing" },
    { id: "3", name: "HR" },
  ]);
  const [description, setDescription] = useState("");



  const handleRemoveDepartment = (id: string) => {
    setSelectedDepartments(selectedDepartments.filter((dept) => dept.id !== id));
  };

  const handleSave = () => {
    // Handle save logic here
    console.log({
      holidayName,
      startDate,
      endDate,
      holidayType,
      repeatYearly,
      selectedDepartments,
      description,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-[#111827]">Add Company Holiday</h2>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* Holiday Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Holiday Name
            </label>
            <input
              type="text"
              value={holidayName}
              onChange={(e) => setHolidayName(e.target.value)}
              placeholder="e.g., Annual Foundation Day"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all"
            />
          </div>

          {/* Start Date and End Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Start Date
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="mm/dd/yyyy"
                  className="w-full px-4 py-2.5 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all"
                />
                <Calendar
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                End Date
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="mm/dd/yyyy"
                  className="w-full px-4 py-2.5 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all"
                />
                <Calendar
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Holiday Type and Repeat Yearly */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Holiday Type
              </label>
              <select
                value={holidayType}
                onChange={(e) => setHolidayType(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all bg-white"
              >
                <option value="Public Holiday">Public Holiday</option>
                <option value="Company Holiday">Company Holiday</option>
                <option value="Optional Holiday">Optional Holiday</option>
              </select>
            </div>
            <div className="flex items-center gap-3 mt-8">
              <button
                type="button"
                onClick={() => setRepeatYearly(!repeatYearly)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${repeatYearly ? "bg-blue-500" : "bg-slate-300"
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${repeatYearly ? "translate-x-6" : "translate-x-1"
                    }`}
                />
              </button>
              <span className="text-sm font-medium text-slate-700">Repeat Yearly</span>
            </div>
          </div>

          {/* Applicable Departments */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Applicable Departments
            </label>
            <div className="flex flex-wrap gap-2 p-3 border border-slate-300 rounded-lg min-h-[48px]">
              {selectedDepartments.map((dept) => (
                <span
                  key={dept.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-md text-sm font-medium"
                >
                  {dept.name}
                  <button
                    onClick={() => handleRemoveDepartment(dept.id)}
                    className="hover:text-amber-900"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
              <button className="text-sm text-slate-500 hover:text-slate-700 px-2">
                Add more...
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about the holiday observances or specific instructions for employees..."
              rows={4}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-medium rounded-lg transition-colors"
            >
              <Save size={18} />
              Save Holiday
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-slate-600 hover:text-slate-900 font-medium rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel and Return
            </button>
          </div>
          <p className="text-sm text-slate-500">
            <span className="text-amber-600">●</span> Required fields are marked automatically
          </p>
        </div>
      </div>
    </div>
  );
}
