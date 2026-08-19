"use client";

import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  AlertCircle 
} from "lucide-react";
import api from "@/lib/axiosInstance";

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
}

interface ReadOnlyCalendarProps {
  title?: string;
  subtitle?: string;
  themeColor?: "orange" | "primary";
}

export default function ReadOnlyCalendar({
  title = "Company Calendar",
  subtitle = "View upcoming company events, scheduled trainings, and official holidays.",
  themeColor = "orange",
}: ReadOnlyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // Fetch events from backend
  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/calendar/events");
      setEvents(response.data || []);
    } catch (err) {
      console.error("Failed to fetch calendar events from backend:", err);
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
    
    // Previous month filler days
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

    // Next month filler days
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
    return events.filter((event) => event.date === dateStr);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Determine category color based on words in title
  const getEventCategoryStyles = (eventTitle: string) => {
    const lowerTitle = eventTitle.toLowerCase();
    if (lowerTitle.includes("holiday") || lowerTitle.includes("poya") || lowerTitle.includes("vacation") || lowerTitle.includes("festival")) {
      return {
        bg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
        indicator: "bg-emerald-500",
        label: "Holiday"
      };
    } else if (lowerTitle.includes("training") || lowerTitle.includes("workshop") || lowerTitle.includes("class")) {
      return {
        bg: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-100 dark:border-purple-900/30",
        indicator: "bg-purple-500",
        label: "Training"
      };
    } else if (lowerTitle.includes("meeting") || lowerTitle.includes("discussion") || lowerTitle.includes("sync")) {
      return {
        bg: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-900/30",
        indicator: "bg-amber-500",
        label: "Meeting"
      };
    } else if (lowerTitle.includes("welfare") || lowerTitle.includes("health") || lowerTitle.includes("check-in")) {
      return {
        bg: "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 border-rose-100 dark:border-rose-900/30",
        indicator: "bg-rose-500",
        label: "Welfare"
      };
    }
    return {
      bg: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-900/30",
      indicator: "bg-blue-500",
      label: "Event"
    };
  };

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const daysInMonth = getDaysInMonth(currentDate);

  // Group events by date for the side view of all upcoming events
  const upcomingEvents = [...events]
    .filter((e) => {
      const eventDate = new Date(e.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate >= today;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  // Theme styling configurations
  const isOrange = themeColor === "orange";
  
  const headerGradient = isOrange 
    ? "from-[#8B3A00] to-slate-900" 
    : "from-primary to-slate-900";

  const dayCellSelectionStyles = (isSelected: boolean) => {
    if (isSelected) {
      return isOrange 
        ? "bg-orange-50/20 dark:bg-orange-950/10 border-orange-200 dark:border-orange-850/35"
        : "bg-primary-light/15 dark:bg-primary/10 border-primary/20";
    }
    return ""; 
  };

  const ringStyles = isOrange ? "ring-[#8B3A00]" : "ring-primary";
  const hoverStyles = isOrange 
    ? "hover:bg-orange-50/20 dark:hover:bg-orange-950/10" 
    : "hover:bg-primary-light/20 dark:hover:bg-primary/10";

  const todayBadgeStyles = isOrange 
    ? "bg-[#8B3A00] text-white" 
    : "bg-primary text-white";

  const dotStyles = isOrange ? "bg-[#8B3A00]" : "bg-primary";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r ${headerGradient} p-8 rounded-3xl text-white shadow-xl shadow-slate-100 dark:shadow-none`}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-orange-100/80 text-sm mt-1">{subtitle}</p>
        </div>
        <div className={`border px-5 py-3 rounded-2xl flex items-center gap-3 ${isOrange ? 'bg-orange-850/30 border-orange-700/30' : 'bg-white/10 border-white/20'}`}>
          <CalendarIcon className={`w-5 h-5 ${isOrange ? 'text-orange-300' : 'text-white'}`} />
          <div className="text-left">
            <p className={`text-xs font-semibold uppercase tracking-wider ${isOrange ? 'text-orange-200' : 'text-slate-350'}`}>Today&apos;s Date</p>
            <p className="text-sm font-bold">{new Date().toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Calendar Grid */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm shadow-slate-100/50 dark:shadow-none">
          {/* Calendar Header Controls */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              {getMonthName(currentDate)}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={previousMonth}
                className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl text-slate-600 dark:text-slate-400 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 transition-colors"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl text-slate-600 dark:text-slate-400 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Weekday Names */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-xs font-semibold text-slate-400 dark:text-slate-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Day Cells Grid */}
          <div className="grid grid-cols-7 gap-2">
            {daysInMonth.map(({ day, isCurrentMonth, date }, index) => {
              const dayEvents = getEventsForDate(date);
              const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === date.getMonth() &&
                new Date().getFullYear() === date.getFullYear();

              const isSelected =
                selectedDate !== null &&
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === date.getMonth() &&
                selectedDate.getFullYear() === date.getFullYear();

              return (
                <div
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`min-h-[100px] p-2 border rounded-2xl cursor-pointer transition-all flex flex-col justify-between ${
                    isCurrentMonth
                      ? `bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/60 ${hoverStyles}`
                      : "bg-slate-50/50 dark:bg-slate-900/30 border-slate-50 dark:border-slate-800/20 text-slate-300 dark:text-slate-700"
                  } ${isToday ? `ring-2 ${ringStyles} ring-offset-2 dark:ring-offset-slate-900` : ""} ${
                    dayCellSelectionStyles(isSelected)
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? todayBadgeStyles
                          : isCurrentMonth
                          ? "text-slate-700 dark:text-slate-300"
                          : "text-slate-400 dark:text-slate-600"
                      }`}
                    >
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles}`} />
                    )}
                  </div>

                  {/* Micro-list of events in day cell */}
                  <div className="space-y-1 mt-1.5 overflow-hidden flex-1 flex flex-col justify-end">
                    {dayEvents.slice(0, 2).map((event) => {
                      const styles = getEventCategoryStyles(event.title);
                      return (
                        <div
                          key={event.id}
                          className={`text-[10px] px-1.5 py-0.5 rounded-md truncate font-medium flex items-center gap-1 border ${styles.bg}`}
                          title={event.title}
                        >
                          <span className={`w-1 h-1 rounded-full shrink-0 ${styles.indicator}`} />
                          <span className="truncate">{event.title}</span>
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold pl-1">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Schedule Details */}
        <div className="space-y-6">
          {/* Selected Date Details */}
          {selectedDate && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm shadow-slate-100/50 dark:shadow-none">
              <div className="mb-4">
                <h3 className="font-bold text-slate-800 dark:text-white text-lg">
                  {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </h3>
                <p className="text-slate-400 dark:text-slate-500 text-xs">Events scheduled for this day</p>
              </div>

              {isLoading ? (
                <div className="py-8 text-center text-slate-400 dark:text-slate-500">
                  <p className="text-xs animate-pulse">Loading events...</p>
                </div>
              ) : getEventsForDate(selectedDate).length === 0 ? (
                <div className="py-8 text-center text-slate-400 dark:text-slate-500 space-y-2">
                  <AlertCircle size={24} className="mx-auto text-slate-300 dark:text-slate-700" />
                  <p className="text-xs">No company events or holidays scheduled.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {getEventsForDate(selectedDate).map((event) => {
                    const styles = getEventCategoryStyles(event.title);
                    return (
                      <div
                        key={event.id}
                        className={`p-3.5 border rounded-2xl flex justify-between items-start gap-2 ${styles.bg}`}
                      >
                        <div className="space-y-1">
                          <p className="text-xs font-bold leading-snug">{event.title}</p>
                          {event.time && (
                            <div className="flex items-center gap-1 text-[10px] opacity-80">
                              <Clock size={10} />
                              <span>{event.time}</span>
                            </div>
                          )}
                          <span className="inline-block text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 mt-1 bg-white/55 dark:bg-black/20 rounded-md">
                            {styles.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* General Upcoming Schedule */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm shadow-slate-100/50 dark:shadow-none flex flex-col h-[340px]">
            <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-1">Upcoming Events</h3>
            <p className="text-slate-400 dark:text-slate-500 text-xs mb-4">Your timeline of upcoming events</p>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {isLoading ? (
                <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                  <p className="text-xs animate-pulse">Loading schedule...</p>
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="py-12 text-center text-slate-400 dark:text-slate-500 space-y-2">
                  <CalendarIcon size={28} className="mx-auto text-slate-300 dark:text-slate-700 animate-pulse" />
                  <p className="text-xs">No upcoming events scheduled.</p>
                </div>
              ) : (
                upcomingEvents.map((event) => {
                  const evDate = new Date(event.date);
                  const styles = getEventCategoryStyles(event.title);
                  return (
                    <div
                      key={event.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border border-slate-100/85 dark:border-slate-850 rounded-2xl flex gap-3 transition-colors cursor-pointer"
                      onClick={() => {
                        setCurrentDate(evDate);
                        setSelectedDate(evDate);
                      }}
                    >
                      <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-900 w-11 h-11 rounded-xl shrink-0 border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase leading-none">
                          {evDate.toLocaleDateString("en-US", { month: "short" })}
                        </span>
                        <span className="text-sm font-black text-slate-800 dark:text-white leading-tight">
                          {evDate.getDate()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                          {event.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${styles.indicator}`} />
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">
                            {styles.label}
                          </span>
                          {event.time && (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5">
                              • <Clock size={8} /> {event.time}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
