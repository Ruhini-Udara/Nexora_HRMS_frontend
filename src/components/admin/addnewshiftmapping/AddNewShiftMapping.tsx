"use client";

import React, { useState, useRef, useEffect } from "react";
import { Save, X, Calendar, Clock, Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/axiosInstance";

interface ShiftType {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  duration: string;
}

interface Designation {
  id: string;
  name: string;
}

export default function AddNewShiftMapping({ onClose, onSuccess }: { onClose?: () => void; onSuccess?: () => void }) {
  const [selectedDesignation, setSelectedDesignation] = useState("");
  const [selectedShiftType, setSelectedShiftType] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [notes, setNotes] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  const [designations, setDesignations] = useState<Designation[]>([]);
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [designationsRes, shiftsRes] = await Promise.all([
          api.get("/api/designations"),
          api.get("/api/shifts")
        ]);

        const fetchedDesignations = designationsRes.data.map((d: any) => ({
          id: d.designationId.toString(),
          name: d.designationName
        }));

        const fetchedShifts = shiftsRes.data.map((s: any) => {
          const formatTime = (timeStr: string) => {
            const [hour, min] = timeStr.split(":");
            const hr = parseInt(hour);
            const ampm = hr >= 12 ? "PM" : "AM";
            const hr12 = hr % 12 || 12;
            return `${hr12.toString().padStart(2, '0')}:${min} ${ampm}`;
          };
          
          const getDuration = (startTime: string, endTime: string) => {
            const [startHour, startMin] = startTime.split(':').map(Number);
            const [endHour, endMin] = endTime.split(':').map(Number);
            let diffMin = (endHour * 60 + endMin) - (startHour * 60 + startMin);
            if (diffMin < 0) diffMin += 24 * 60;
            const hours = Math.floor(diffMin / 60);
            const minutes = diffMin % 60;
            return minutes === 0 ? `${hours} Hours` : `${hours}h ${minutes}m`;
          };

          return {
            id: s.id.toString(),
            name: s.name,
            startTime: formatTime(s.startTime),
            endTime: formatTime(s.endTime),
            duration: getDuration(s.startTime, s.endTime)
          };
        });

        setDesignations(fetchedDesignations);
        setShiftTypes(fetchedShifts);
      } catch (err) {
        console.error("Error loading dropdown data:", err);
        setError("Failed to load options.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getSelectedShiftDetails = () => {
    const shift = shiftTypes.find((s) => s.id === selectedShiftType);
    return shift;
  };

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

  const handleDateSelect = (date: Date) => {
    setEffectiveDate(formatDate(date));
    setShowCalendar(false);
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
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

  const isSelectedDate = (date: Date) => {
    if (!effectiveDate) return false;
    return formatDate(date) === effectiveDate;
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const handleSave = async () => {
    if (!selectedDesignation || !selectedShiftType) {
      alert("Please select both a designation and a shift type.");
      return;
    }
    try {
      await api.put(`/api/designations/${selectedDesignation}/shift/${selectedShiftType}`);
      if (onSuccess) {
        onSuccess();
      } else if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error("Error saving shift mapping:", err);
      alert("Failed to save shift mapping. Please try again.");
    }
  };

  const shiftDetails = getSelectedShiftDetails();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-background-dark">Add New Shift Mapping</h2>
            <p className="text-sm text-slate-500 mt-1">Assign shifts to designations or roles</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* Designation */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Designation <span className="text-orange-500">*</span>
            </label>
            <div className="relative">
              <Briefcase
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={selectedDesignation}
                onChange={(e) => setSelectedDesignation(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all appearance-none bg-slate-50 text-slate-700"
              >
                <option value="">Select Designation</option>
                {designations.map((designation) => (
                  <option key={designation.id} value={designation.id}>
                    {designation.name}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Shift Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Shift Type <span className="text-orange-500">*</span>
            </label>
            <div className="relative">
              <Clock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={selectedShiftType}
                onChange={(e) => setSelectedShiftType(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all appearance-none bg-slate-50 text-slate-700"
              >
                <option value="">Select Shift Type</option>
                {shiftTypes.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Shift Timing Info Box */}
          {shiftDetails && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-2 mt-0.5">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="text-blue-600"
                >
                  <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
                  <path
                    d="M10 6V10L13 13"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
                  SHIFT TIMING
                </p>
                <p className="text-sm font-medium text-blue-900">
                  {shiftDetails.startTime} - {shiftDetails.endTime} ({shiftDetails.duration})
                </p>
              </div>
            </div>
          )}

          {/* Effective Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Effective Date <span className="text-orange-500">*</span>
            </label>
            <div className="relative" ref={calendarRef}>
              <Calendar
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
              />
              <input
                type="text"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                onFocus={() => setShowCalendar(true)}
                placeholder="mm/dd/yyyy"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all"
              />
              
              {/* Calendar Dropdown */}
              {showCalendar && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-4 w-80">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={previousMonth}
                      className="p-1 hover:bg-slate-100 rounded transition-colors"
                    >
                      <ChevronLeft size={20} className="text-slate-600" />
                    </button>
                    <span className="font-semibold text-slate-800">
                      {getMonthName(currentMonth)}
                    </span>
                    <button
                      type="button"
                      onClick={nextMonth}
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
                    {getDaysInMonth(currentMonth).map((dayObj, idx) => {
                      const isPast = isPastDate(dayObj.date);
                      const isDisabled = isPast || !dayObj.isCurrentMonth;
                      
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => !isDisabled && handleDateSelect(dayObj.date)}
                          disabled={isDisabled}
                          className={`
                            p-2 text-sm rounded-lg transition-colors
                            ${!dayObj.isCurrentMonth ? "text-slate-300 cursor-not-allowed" : ""}
                            ${isPast && dayObj.isCurrentMonth ? "text-slate-400 cursor-not-allowed line-through" : ""}
                            ${isToday(dayObj.date) && !isPast ? "bg-blue-50 text-blue-600 font-semibold" : ""}
                            ${isSelectedDate(dayObj.date) ? "bg-amber-400 text-white font-semibold" : ""}
                            ${dayObj.isCurrentMonth && !isPast && !isToday(dayObj.date) && !isSelectedDate(dayObj.date) ? "hover:bg-slate-100 cursor-pointer" : ""}
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
          </div>

          {/* Notes / Remarks */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Notes / Remarks
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional context for this mapping..."
              rows={4}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all resize-none bg-slate-50"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center gap-2"
          >
            <Save size={18} />
            Save Mapping
          </button>
        </div>
      </div>
    </div>
  );
}

