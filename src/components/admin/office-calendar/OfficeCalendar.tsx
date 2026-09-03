"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import AddCompanyHoliday from "../addcompanyholiday/AddCompanyHoliday";
import AddCompanyEvent from "../addcompanyevent/AddCompanyEvent";
import api from "@/lib/axiosInstance";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  time?: string;
}

export default function OfficeCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("month");
  const [showAddHoliday, setShowAddHoliday] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/calendar/events");
      setEvents(response.data || []);
    } catch (err) {
      console.error("Failed to fetch calendar events:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
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

  const getEventsForDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    return events.filter((event) => {
      const start = event.date;
      const end = event.endDate || event.date;
      return dateStr >= start && dateStr <= end;
    });
  };

  // Date boundary: 2 years in past and 2 years in future
  const today = new Date();
  const minMonthDate = new Date(today.getFullYear() - 2, today.getMonth(), 1);
  const maxMonthDate = new Date(today.getFullYear() + 2, today.getMonth(), 1);

  const isPrevDisabled =
    currentDate.getFullYear() < minMonthDate.getFullYear() ||
    (currentDate.getFullYear() === minMonthDate.getFullYear() &&
      currentDate.getMonth() <= minMonthDate.getMonth());

  const isNextDisabled =
    currentDate.getFullYear() > maxMonthDate.getFullYear() ||
    (currentDate.getFullYear() === maxMonthDate.getFullYear() &&
      currentDate.getMonth() >= maxMonthDate.getMonth());

  const previousMonth = () => {
    if (isPrevDisabled) return;
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    if (isNextDisabled) return;
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#111827] dark:text-white">Office Calendar</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAddEvent(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#8B3A00] hover:bg-[#722F00] text-white font-medium rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <Plus size={18} />
            Add Event
          </button>
          <button 
            onClick={() => setShowAddHoliday(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#8B3A00] hover:bg-[#722F00] text-white font-medium rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <Plus size={18} />
            Add Holiday
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        {/* Calendar Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#111827] dark:text-white">{getMonthName(currentDate)}</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={goToToday}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Today
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={previousMonth}
                disabled={isPrevDisabled}
                title={isPrevDisabled ? "Reached minimum viewing limit (2 years in past)" : "Previous month"}
                className={`p-2 rounded-lg transition-colors ${
                  isPrevDisabled
                    ? "opacity-30 cursor-not-allowed text-slate-400 dark:text-slate-600"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-600 dark:text-slate-400"
                }`}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextMonth}
                disabled={isNextDisabled}
                title={isNextDisabled ? "Reached maximum viewing limit (2 years in future)" : "Next month"}
                className={`p-2 rounded-lg transition-colors ${
                  isNextDisabled
                    ? "opacity-30 cursor-not-allowed text-slate-400 dark:text-slate-600"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-600 dark:text-slate-400"
                }`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-px mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center py-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">{day}</span>
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            {days.map((dayObj, index) => {
              const dayEvents = getEventsForDate(dayObj.date);
              const isToday =
                dayObj.date.toDateString() === new Date().toDateString() && dayObj.isCurrentMonth;

              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 transition-colors ${
                    !dayObj.isCurrentMonth
                      ? "bg-slate-50 dark:bg-slate-900/40"
                      : "bg-white dark:bg-slate-900"
                  } ${isToday ? "bg-amber-50 dark:bg-amber-950/30" : ""}`}
                >
                  <div
                    className={`text-sm font-medium mb-1 ${
                      !dayObj.isCurrentMonth
                        ? "text-slate-400 dark:text-slate-600"
                        : isToday
                        ? "text-amber-600 dark:text-amber-400 font-bold"
                        : "text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {dayObj.day}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map((event) => {
                      const isMultiDay = !!(event.endDate && event.endDate !== event.date);
                      return (
                        <div
                          key={event.id}
                          className="text-xs px-2 py-1 rounded border bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-900/40 truncate cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors"
                          title={isMultiDay ? `${event.title} (${event.date} to ${event.endDate})` : event.title}
                        >
                          <div className="font-medium truncate">{event.title}</div>
                          {event.time && (
                            <div className="text-[10px] opacity-90 mt-0.5">{event.time}</div>
                          )}
                          {isMultiDay && !event.time && (
                            <div className="text-[9px] opacity-75 mt-0.5 truncate">
                              Multi-day (to {event.endDate})
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Holiday Modal */}
      {showAddHoliday && (
        <AddCompanyHoliday
          onClose={() => {
            setShowAddHoliday(false);
            fetchEvents();
          }}
        />
      )}
      
      {/* Add Event Modal */}
      {showAddEvent && (
        <AddCompanyEvent
          onClose={() => {
            setShowAddEvent(false);
            fetchEvents();
          }}
        />
      )}
    </div>
  );
}
