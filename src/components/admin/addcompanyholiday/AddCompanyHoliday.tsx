"use client";

import React, { useState, useRef, useEffect } from "react";
import { Save, X, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

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
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [startCurrentMonth, setStartCurrentMonth] = useState(new Date());
  const [endCurrentMonth, setEndCurrentMonth] = useState(new Date());
  const startCalendarRef = useRef<HTMLDivElement>(null);
  const endCalendarRef = useRef<HTMLDivElement>(null);
  
  // Validation errors
  const [errors, setErrors] = useState({
    holidayName: false,
    startDate: false,
    endDate: false,
  });

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (startCalendarRef.current && !startCalendarRef.current.contains(event.target as Node)) {
        setShowStartCalendar(false);
      }
      if (endCalendarRef.current && !endCalendarRef.current.contains(event.target as Node)) {
        setShowEndCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const availableDepartments = [
    { id: "1", name: "Engineering" },
    { id: "2", name: "Marketing" },
    { id: "3", name: "HR" },
    { id: "4", name: "Finance" },
    { id: "5", name: "Operations" },
    { id: "6", name: "Sales" },
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - i),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }

    return days;
  };

  const formatDate = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const handleStartDateSelect = (date: Date) => {
    setStartDate(formatDate(date));
    setShowStartCalendar(false);
    if (errors.startDate) {
      setErrors({ ...errors, startDate: false });
    }
  };

  const handleEndDateSelect = (date: Date) => {
    setEndDate(formatDate(date));
    setShowEndCalendar(false);
    if (errors.endDate) {
      setErrors({ ...errors, endDate: false });
    }
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelectedStartDate = (date: Date) => {
    if (!startDate) return false;
    return formatDate(date) === startDate;
  };

  const isSelectedEndDate = (date: Date) => {
    if (!endDate) return false;
    return formatDate(date) === endDate;
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const handleRemoveDepartment = (id: string) => {
    setSelectedDepartments(selectedDepartments.filter((dept) => dept.id !== id));
  };

  const handleSave = () => {
    // Validate required fields
    const newErrors = {
      holidayName: holidayName.trim() === "",
      startDate: startDate.trim() === "",
      endDate: endDate.trim() === "",
    };

    setErrors(newErrors);

    // Check if there are any errors
    if (newErrors.holidayName || newErrors.startDate || newErrors.endDate) {
      // Find the first error field and scroll to it
      const firstErrorField = document.querySelector('.border-red-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

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
              Holiday Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={holidayName}
              onChange={(e) => {
                setHolidayName(e.target.value);
                if (errors.holidayName) {
                  setErrors({ ...errors, holidayName: false });
                }
              }}
              placeholder="e.g., Annual Foundation Day"
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all ${
                errors.holidayName ? "border-red-500" : "border-slate-300"
              }`}
            />
            {errors.holidayName && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span>⚠</span> Holiday name is required
              </p>
            )}
          </div>

          {/* Start Date and End Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <div className="relative" ref={startCalendarRef}>
                <Calendar
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
                />
                <input
                  type="text"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (errors.startDate) {
                      setErrors({ ...errors, startDate: false });
                    }
                  }}
                  onFocus={() => setShowStartCalendar(true)}
                  placeholder="mm/dd/yyyy"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all ${
                    errors.startDate ? "border-red-500" : "border-slate-300"
                  }`}
                />
                
                {/* Calendar Dropdown */}
                {showStartCalendar && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-4 w-80">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        type="button"
                        onClick={() => setStartCurrentMonth(new Date(startCurrentMonth.getFullYear(), startCurrentMonth.getMonth() - 1, 1))}
                        className="p-1 hover:bg-slate-100 rounded transition-colors"
                      >
                        <ChevronLeft size={20} className="text-slate-600" />
                      </button>
                      <span className="font-semibold text-slate-800">
                        {getMonthName(startCurrentMonth)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setStartCurrentMonth(new Date(startCurrentMonth.getFullYear(), startCurrentMonth.getMonth() + 1, 1))}
                        className="p-1 hover:bg-slate-100 rounded transition-colors"
                      >
                        <ChevronRight size={20} className="text-slate-600" />
                      </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {/* Weekday Headers */}
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                        <div
                          key={day}
                          className="text-center text-xs font-medium text-slate-500 py-2"
                        >
                          {day}
                        </div>
                      ))}
                      
                      {/* Calendar Days */}
                      {getDaysInMonth(startCurrentMonth).map((dayObj, idx) => {
                        const isPast = isPastDate(dayObj.date);
                        const isDisabled = isPast || !dayObj.isCurrentMonth;
                        
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => !isDisabled && handleStartDateSelect(dayObj.date)}
                            disabled={isDisabled}
                            className={`
                              p-2 text-sm rounded-lg transition-colors
                              ${!dayObj.isCurrentMonth ? "text-slate-300 cursor-not-allowed" : ""}
                              ${isPast && dayObj.isCurrentMonth ? "text-slate-400 cursor-not-allowed line-through" : ""}
                              ${isToday(dayObj.date) && !isPast ? "bg-blue-50 text-blue-600 font-semibold" : ""}
                              ${isSelectedStartDate(dayObj.date) ? "bg-amber-400 text-white font-semibold" : ""}
                              ${dayObj.isCurrentMonth && !isPast && !isToday(dayObj.date) && !isSelectedStartDate(dayObj.date) ? "hover:bg-slate-100 cursor-pointer" : ""}
                            `}
                          >
                            {dayObj.day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              {errors.startDate && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> Start date is required
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <div className="relative" ref={endCalendarRef}>
                <Calendar
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
                />
                <input
                  type="text"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    if (errors.endDate) {
                      setErrors({ ...errors, endDate: false });
                    }
                  }}
                  onFocus={() => setShowEndCalendar(true)}
                  placeholder="mm/dd/yyyy"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all ${
                    errors.endDate ? "border-red-500" : "border-slate-300"
                  }`}
                />
                
                {/* Calendar Dropdown */}
                {showEndCalendar && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-4 w-80">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        type="button"
                        onClick={() => setEndCurrentMonth(new Date(endCurrentMonth.getFullYear(), endCurrentMonth.getMonth() - 1, 1))}
                        className="p-1 hover:bg-slate-100 rounded transition-colors"
                      >
                        <ChevronLeft size={20} className="text-slate-600" />
                      </button>
                      <span className="font-semibold text-slate-800">
                        {getMonthName(endCurrentMonth)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEndCurrentMonth(new Date(endCurrentMonth.getFullYear(), endCurrentMonth.getMonth() + 1, 1))}
                        className="p-1 hover:bg-slate-100 rounded transition-colors"
                      >
                        <ChevronRight size={20} className="text-slate-600" />
                      </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {/* Weekday Headers */}
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                        <div
                          key={day}
                          className="text-center text-xs font-medium text-slate-500 py-2"
                        >
                          {day}
                        </div>
                      ))}
                      
                      {/* Calendar Days */}
                      {getDaysInMonth(endCurrentMonth).map((dayObj, idx) => {
                        const isPast = isPastDate(dayObj.date);
                        const isDisabled = isPast || !dayObj.isCurrentMonth;
                        
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => !isDisabled && handleEndDateSelect(dayObj.date)}
                            disabled={isDisabled}
                            className={`
                              p-2 text-sm rounded-lg transition-colors
                              ${!dayObj.isCurrentMonth ? "text-slate-300 cursor-not-allowed" : ""}
                              ${isPast && dayObj.isCurrentMonth ? "text-slate-400 cursor-not-allowed line-through" : ""}
                              ${isToday(dayObj.date) && !isPast ? "bg-blue-50 text-blue-600 font-semibold" : ""}
                              ${isSelectedEndDate(dayObj.date) ? "bg-amber-400 text-white font-semibold" : ""}
                              ${dayObj.isCurrentMonth && !isPast && !isToday(dayObj.date) && !isSelectedEndDate(dayObj.date) ? "hover:bg-slate-100 cursor-pointer" : ""}
                            `}
                          >
                            {dayObj.day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              {errors.endDate && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> End date is required
                </p>
              )}
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
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  repeatYearly ? "bg-blue-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    repeatYearly ? "translate-x-6" : "translate-x-1"
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
