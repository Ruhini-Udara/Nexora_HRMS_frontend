"use client";

import React, { useState, useRef, useEffect } from "react";
import { Save, X, Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import api from "@/lib/axiosInstance";

export default function AddCompanyEvent({ onClose }: { onClose?: () => void }) {
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventType, setEventType] = useState("Internal Event");
  const [description, setDescription] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Validation errors
  const [errors, setErrors] = useState({
    eventName: false,
    eventDate: false,
    eventTime: false,
  });

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
    setEventDate(formatDate(date));
    setShowCalendar(false);
    if (errors.eventDate) {
      setErrors({ ...errors, eventDate: false });
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

  const isSelectedDate = (date: Date) => {
    if (!eventDate) return false;
    return formatDate(date) === eventDate;
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };



  const handleSave = async () => {
    // Validate required fields
    const newErrors = {
      eventName: eventName.trim() === "",
      eventDate: eventDate.trim() === "",
      eventTime: eventTime.trim() === "",
    };

    setErrors(newErrors);
    setSaveError(null);

    // Check if there are any errors
    if (newErrors.eventName || newErrors.eventDate || newErrors.eventTime) {
      // Find the first error field and scroll to it
      const firstErrorField = document.querySelector('.border-red-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSaving(true);
    try {
      await api.post("/api/calendar/event", {
        eventName,
        eventDate,
        eventTime,
        eventType,
        description,
      });
      onClose?.();
    } catch (err: any) {
      console.error(err);
      setSaveError(err.response?.data || err.message || "Failed to save event to Google Calendar.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-[#111827]">Add Company Event</h2>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* Event Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Event Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => {
                setEventName(e.target.value);
                if (errors.eventName) {
                  setErrors({ ...errors, eventName: false });
                }
              }}
              placeholder="e.g., Team Building Workshop"
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all ${
                errors.eventName ? "border-red-500" : "border-slate-300"
              }`}
            />
            {errors.eventName && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span>⚠</span> Event name is required
              </p>
            )}
          </div>

          {/* Event Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Event Date <span className="text-red-500">*</span>
              </label>
              <div className="relative" ref={calendarRef}>
                <Calendar
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
                />
                <input
                  type="text"
                  value={eventDate}
                  onChange={(e) => {
                    setEventDate(e.target.value);
                    if (errors.eventDate) {
                      setErrors({ ...errors, eventDate: false });
                    }
                  }}
                  onFocus={() => setShowCalendar(true)}
                  placeholder="mm/dd/yyyy"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all ${
                    errors.eventDate ? "border-red-500" : "border-slate-300"
                  }`}
                />
                
                {/* Calendar Dropdown */}
                {showCalendar && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-4 w-80">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        type="button"
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                        className="p-1 hover:bg-slate-100 rounded transition-colors"
                      >
                        <ChevronLeft size={20} className="text-slate-600" />
                      </button>
                      <span className="font-semibold text-slate-800">
                        {getMonthName(currentMonth)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
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
              {errors.eventDate && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> Event date is required
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Event Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
                />
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => {
                    setEventTime(e.target.value);
                    if (errors.eventTime) {
                      setErrors({ ...errors, eventTime: false });
                    }
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all ${
                    errors.eventTime ? "border-red-500" : "border-slate-300"
                  }`}
                />
              </div>
              {errors.eventTime && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> Event time is required
                </p>
              )}
            </div>
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Event Type
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all bg-white"
            >
              <option value="Internal Event">Internal Event</option>
              <option value="Admin Deadline">Admin Deadline</option>
              <option value="Training Session">Training Session</option>
              <option value="Meeting">Meeting</option>
              <option value="Workshop">Workshop</option>
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
              placeholder="Provide details about the event, agenda, or specific instructions for attendees..."
              rows={4}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all resize-none"
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
                className="flex items-center gap-2 px-6 py-2.5 bg-amber-400 hover:bg-amber-500 disabled:bg-amber-200 text-slate-900 font-medium rounded-lg transition-colors"
              >
                <Save size={18} />
                {isSaving ? "Saving..." : "Save Event"}
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
              <span className="text-amber-600">●</span> Required fields are marked automatically
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
