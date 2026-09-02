"use client";

import React, { useState, useRef, useEffect } from "react";
import { Save, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/axiosInstance";
import axios from "axios";

export default function AddCompanyHoliday({ onClose }: { onClose?: () => void }) {
  const [holidayName, setHolidayName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [holidayType, setHolidayType] = useState("Public Holiday");
  const [description, setDescription] = useState("");
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [startCurrentMonth, setStartCurrentMonth] = useState(new Date());
  const [endCurrentMonth, setEndCurrentMonth] = useState(new Date());
  const startCalendarRef = useRef<HTMLDivElement>(null);
  const endCalendarRef = useRef<HTMLDivElement>(null);
  
  // Validation errors
  const [errors, setErrors] = useState({
    holidayName: false,
    startDate: false,
    startDateOutOfRange: false,
    endDate: false,
    endDateOutOfRange: false,
    endDateBeforeStart: false,
  });

  // Date boundary: 2 years in past and 2 years in future
  const today = new Date();
  const minAllowedDate = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());
  minAllowedDate.setHours(0, 0, 0, 0);

  const maxAllowedDate = new Date(today.getFullYear() + 2, today.getMonth(), today.getDate());
  maxAllowedDate.setHours(23, 59, 59, 999);

  const minMonthDate = new Date(today.getFullYear() - 2, today.getMonth(), 1);
  const maxMonthDate = new Date(today.getFullYear() + 2, today.getMonth(), 1);

  const isStartPrevMonthDisabled =
    startCurrentMonth.getFullYear() < minMonthDate.getFullYear() ||
    (startCurrentMonth.getFullYear() === minMonthDate.getFullYear() &&
      startCurrentMonth.getMonth() <= minMonthDate.getMonth());

  const isStartNextMonthDisabled =
    startCurrentMonth.getFullYear() > maxMonthDate.getFullYear() ||
    (startCurrentMonth.getFullYear() === maxMonthDate.getFullYear() &&
      startCurrentMonth.getMonth() >= maxMonthDate.getMonth());

  const isEndPrevMonthDisabled =
    endCurrentMonth.getFullYear() < minMonthDate.getFullYear() ||
    (endCurrentMonth.getFullYear() === minMonthDate.getFullYear() &&
      endCurrentMonth.getMonth() <= minMonthDate.getMonth());

  const isEndNextMonthDisabled =
    endCurrentMonth.getFullYear() > maxMonthDate.getFullYear() ||
    (endCurrentMonth.getFullYear() === maxMonthDate.getFullYear() &&
      endCurrentMonth.getMonth() >= maxMonthDate.getMonth());

  const parseDateString = (dateStr: string): Date | null => {
    if (!dateStr || !dateStr.trim()) return null;
    const parts = dateStr.trim().split(/[-/]/);
    if (parts.length !== 3) return null;

    let year: number, month: number, day: number;
    if (parts[0].length === 4) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
    } else {
      month = parseInt(parts[0], 10) - 1;
      day = parseInt(parts[1], 10);
      year = parseInt(parts[2], 10);
    }

    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    const d = new Date(year, month, day);
    if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) return null;
    return d;
  };

  const isDateOutOfRange = (date: Date) => {
    const check = new Date(date);
    check.setHours(0, 0, 0, 0);
    return check < minAllowedDate || check > maxAllowedDate;
  };

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
    if (errors.startDate || errors.startDateOutOfRange || errors.endDateBeforeStart) {
      setErrors({ ...errors, startDate: false, startDateOutOfRange: false, endDateBeforeStart: false });
    }
  };

  const handleEndDateSelect = (date: Date) => {
    setEndDate(formatDate(date));
    setShowEndCalendar(false);
    if (errors.endDate || errors.endDateOutOfRange || errors.endDateBeforeStart) {
      setErrors({ ...errors, endDate: false, endDateOutOfRange: false, endDateBeforeStart: false });
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

  const handleSave = async () => {
    // Validate required fields and date range
    const parsedStart = parseDateString(startDate);
    const parsedEnd = parseDateString(endDate);

    const startEmpty = startDate.trim() === "";
    const endEmpty = endDate.trim() === "";

    const startOutOfRange = !startEmpty && (!parsedStart || isDateOutOfRange(parsedStart));
    const endOutOfRange = !endEmpty && (!parsedEnd || isDateOutOfRange(parsedEnd));
    const endBeforeStart = !startEmpty && !endEmpty && parsedStart && parsedEnd && parsedEnd < parsedStart;

    const newErrors = {
      holidayName: holidayName.trim() === "",
      startDate: startEmpty,
      startDateOutOfRange: startOutOfRange,
      endDate: endEmpty,
      endDateOutOfRange: endOutOfRange,
      endDateBeforeStart: !!endBeforeStart,
    };

    setErrors(newErrors);
    setSaveError(null);

    // Check if there are any errors
    if (
      newErrors.holidayName ||
      newErrors.startDate ||
      newErrors.startDateOutOfRange ||
      newErrors.endDate ||
      newErrors.endDateOutOfRange ||
      newErrors.endDateBeforeStart
    ) {
      const firstErrorField = document.querySelector('.border-red-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSaving(true);
    try {
      await api.post("/api/calendar/holiday", {
        holidayName,
        startDate,
        endDate,
        holidayType,
        repeatYearly: false,
        description,
      });
      onClose?.();
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        setSaveError(
          err.response?.data?.message ||
          err.response?.data ||
          err.message ||
          "Failed to save holiday to Google Calendar."
        );
      } else if (err instanceof Error) {
        setSaveError(err.message);
      } else {
        setSaveError("Failed to save holiday to Google Calendar.");
      }
    } finally {
      setIsSaving(false);
    }
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
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#8B3A00] focus:border-[#8B3A00] outline-none transition-all ${
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
                    if (errors.startDate || errors.startDateOutOfRange || errors.endDateBeforeStart) {
                      setErrors({ ...errors, startDate: false, startDateOutOfRange: false, endDateBeforeStart: false });
                    }
                  }}
                  onFocus={() => setShowStartCalendar(true)}
                  placeholder="mm/dd/yyyy"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#8B3A00] focus:border-[#8B3A00] outline-none transition-all ${
                    errors.startDate || errors.startDateOutOfRange ? "border-red-500" : "border-slate-300"
                  }`}
                />
                
                {/* Calendar Dropdown */}
                {showStartCalendar && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-4 w-80">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        type="button"
                        disabled={isStartPrevMonthDisabled}
                        title={isStartPrevMonthDisabled ? "Reached minimum viewing limit (2 years in past)" : "Previous month"}
                        onClick={() => {
                          if (!isStartPrevMonthDisabled) {
                            setStartCurrentMonth(new Date(startCurrentMonth.getFullYear(), startCurrentMonth.getMonth() - 1, 1));
                          }
                        }}
                        className={`p-1 rounded transition-colors ${
                          isStartPrevMonthDisabled
                            ? "opacity-30 cursor-not-allowed text-slate-400"
                            : "hover:bg-slate-100 text-slate-600 cursor-pointer"
                        }`}
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <span className="font-semibold text-slate-800">
                        {getMonthName(startCurrentMonth)}
                      </span>
                      <button
                        type="button"
                        disabled={isStartNextMonthDisabled}
                        title={isStartNextMonthDisabled ? "Reached maximum viewing limit (2 years in future)" : "Next month"}
                        onClick={() => {
                          if (!isStartNextMonthDisabled) {
                            setStartCurrentMonth(new Date(startCurrentMonth.getFullYear(), startCurrentMonth.getMonth() + 1, 1));
                          }
                        }}
                        className={`p-1 rounded transition-colors ${
                          isStartNextMonthDisabled
                            ? "opacity-30 cursor-not-allowed text-slate-400"
                            : "hover:bg-slate-100 text-slate-600 cursor-pointer"
                        }`}
                      >
                        <ChevronRight size={20} />
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
                        const outOfRange = isDateOutOfRange(dayObj.date);
                        const isDisabled = outOfRange || !dayObj.isCurrentMonth;
                        
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => !isDisabled && handleStartDateSelect(dayObj.date)}
                            disabled={isDisabled}
                            className={`
                              p-2 text-sm rounded-lg transition-colors
                              ${!dayObj.isCurrentMonth ? "text-slate-300 cursor-not-allowed" : ""}
                              ${outOfRange && dayObj.isCurrentMonth ? "text-slate-400 cursor-not-allowed line-through" : ""}
                              ${isToday(dayObj.date) && !outOfRange ? "bg-blue-50 text-blue-600 font-semibold" : ""}
                              ${isSelectedStartDate(dayObj.date) ? "bg-[#8B3A00] text-white font-semibold" : ""}
                              ${dayObj.isCurrentMonth && !outOfRange && !isToday(dayObj.date) && !isSelectedStartDate(dayObj.date) ? "hover:bg-slate-100 cursor-pointer" : ""}
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
              {errors.startDateOutOfRange && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> Date must be within 2 years in the past and 2 years in the future
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
                    if (errors.endDate || errors.endDateOutOfRange || errors.endDateBeforeStart) {
                      setErrors({ ...errors, endDate: false, endDateOutOfRange: false, endDateBeforeStart: false });
                    }
                  }}
                  onFocus={() => setShowEndCalendar(true)}
                  placeholder="mm/dd/yyyy"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#8B3A00] focus:border-[#8B3A00] outline-none transition-all ${
                    errors.endDate || errors.endDateOutOfRange || errors.endDateBeforeStart ? "border-red-500" : "border-slate-300"
                  }`}
                />
                
                {/* Calendar Dropdown */}
                {showEndCalendar && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-4 w-80">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        type="button"
                        disabled={isEndPrevMonthDisabled}
                        title={isEndPrevMonthDisabled ? "Reached minimum viewing limit (2 years in past)" : "Previous month"}
                        onClick={() => {
                          if (!isEndPrevMonthDisabled) {
                            setEndCurrentMonth(new Date(endCurrentMonth.getFullYear(), endCurrentMonth.getMonth() - 1, 1));
                          }
                        }}
                        className={`p-1 rounded transition-colors ${
                          isEndPrevMonthDisabled
                            ? "opacity-30 cursor-not-allowed text-slate-400"
                            : "hover:bg-slate-100 text-slate-600 cursor-pointer"
                        }`}
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <span className="font-semibold text-slate-800">
                        {getMonthName(endCurrentMonth)}
                      </span>
                      <button
                        type="button"
                        disabled={isEndNextMonthDisabled}
                        title={isEndNextMonthDisabled ? "Reached maximum viewing limit (2 years in future)" : "Next month"}
                        onClick={() => {
                          if (!isEndNextMonthDisabled) {
                            setEndCurrentMonth(new Date(endCurrentMonth.getFullYear(), endCurrentMonth.getMonth() + 1, 1));
                          }
                        }}
                        className={`p-1 rounded transition-colors ${
                          isEndNextMonthDisabled
                            ? "opacity-30 cursor-not-allowed text-slate-400"
                            : "hover:bg-slate-100 text-slate-600 cursor-pointer"
                        }`}
                      >
                        <ChevronRight size={20} />
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
                        const outOfRange = isDateOutOfRange(dayObj.date);
                        const isDisabled = outOfRange || !dayObj.isCurrentMonth;
                        
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => !isDisabled && handleEndDateSelect(dayObj.date)}
                            disabled={isDisabled}
                            className={`
                              p-2 text-sm rounded-lg transition-colors
                              ${!dayObj.isCurrentMonth ? "text-slate-300 cursor-not-allowed" : ""}
                              ${outOfRange && dayObj.isCurrentMonth ? "text-slate-400 cursor-not-allowed line-through" : ""}
                              ${isToday(dayObj.date) && !outOfRange ? "bg-blue-50 text-blue-600 font-semibold" : ""}
                              ${isSelectedEndDate(dayObj.date) ? "bg-[#8B3A00] text-white font-semibold" : ""}
                              ${dayObj.isCurrentMonth && !outOfRange && !isToday(dayObj.date) && !isSelectedEndDate(dayObj.date) ? "hover:bg-slate-100 cursor-pointer" : ""}
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
              {errors.endDateOutOfRange && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> Date must be within 2 years in the past and 2 years in the future
                </p>
              )}
              {errors.endDateBeforeStart && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> End date cannot be before start date
                </p>
              )}
            </div>
          </div>

          {/* Holiday Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Holiday Type
            </label>
            <select
              value={holidayType}
              onChange={(e) => setHolidayType(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#8B3A00] focus:border-[#8B3A00] outline-none transition-all bg-white"
            >
              <option value="Public Holiday">Public Holiday</option>
              <option value="Company Holiday">Company Holiday</option>
              <option value="Optional Holiday">Optional Holiday</option>
            </select>
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
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#8B3A00] focus:border-[#8B3A00] outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex flex-col gap-4">
          {saveError && (
            <div className="text-red-500 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">
              {saveError}
            </div>
          )}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#8B3A00] hover:bg-[#722F00] disabled:bg-[#8B3A00]/50 text-white font-medium rounded-lg transition-colors cursor-pointer"
              >
                <Save size={18} />
                {isSaving ? "Saving..." : "Save Holiday"}
              </button>
              <button
                onClick={onClose}
                disabled={isSaving}
                className="px-6 py-2.5 text-slate-600 hover:text-slate-900 font-medium rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                Cancel and Return
              </button>
            </div>
            <p className="text-sm text-slate-500">
              <span className="text-[#8B3A00]">●</span> Required fields are marked automatically
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
