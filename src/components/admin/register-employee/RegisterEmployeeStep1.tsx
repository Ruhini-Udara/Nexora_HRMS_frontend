"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, User, Mail, Home, IdCard, Users, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface RegisterEmployeeStep1Props {
  onNext?: () => void;
}

export default function RegisterEmployeeStep1({
  onNext,
}: RegisterEmployeeStep1Props) {
  const [formData, setFormData] = useState({
    nicNumber: "",
    sex: "",
    fullName: "",
    surname: "",
    dateOfBirth: "",
    dateJoined: "",
    email: "",
    homeAddress: "",
    maritalStatus: "Single",
  });

  const [showDateOfBirthCalendar, setShowDateOfBirthCalendar] = useState(false);
  const [showDateJoinedCalendar, setShowDateJoinedCalendar] = useState(false);
  const [currentMonthDOB, setCurrentMonthDOB] = useState(new Date());
  const [currentMonthDJ, setCurrentMonthDJ] = useState(new Date());
  
  const dobCalendarRef = useRef<HTMLDivElement>(null);
  const djCalendarRef = useRef<HTMLDivElement>(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dobCalendarRef.current && !dobCalendarRef.current.contains(event.target as Node)) {
        setShowDateOfBirthCalendar(false);
      }
      if (djCalendarRef.current && !djCalendarRef.current.contains(event.target as Node)) {
        setShowDateJoinedCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleDateSelect = (date: Date, field: 'dateOfBirth' | 'dateJoined') => {
    setFormData((prev) => ({ ...prev, [field]: formatDate(date) }));
    if (field === 'dateOfBirth') {
      setShowDateOfBirthCalendar(false);
    } else {
      setShowDateJoinedCalendar(false);
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelectedDate = (date: Date, dateString: string) => {
    if (!dateString) return false;
    return formatDate(date) === dateString;
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const handleNextStep = () => {
    if (onNext) {
      onNext();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Register New Employee</h1>
          <p className="text-gray-600 mt-2">Complete all required fields to add a new employee to the system</p>
        </div>

        {/* Stepper */}
        <div className="mb-10">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {/* Step 1 - Active */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-lg mb-3 shadow-md">
                01
              </div>
              <span className="text-sm font-semibold text-gray-900">Personal Info</span>
            </div>
            
            {/* Connector */}
            <div className="flex-1 h-0.5 bg-gray-300 mx-4 mb-8"></div>
            
            {/* Step 2 - Inactive */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-14 h-14 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center font-bold text-lg mb-3">
                02
              </div>
              <span className="text-sm text-gray-500">Employment</span>
            </div>
            
            {/* Connector */}
            <div className="flex-1 h-0.5 bg-gray-300 mx-4 mb-8"></div>
            
            {/* Step 3 - Inactive */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-14 h-14 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center font-bold text-lg mb-3">
                03
              </div>
              <span className="text-sm text-gray-500">System Access</span>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Section Header */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
            <p className="text-gray-600 mt-1">
              Please provide the personal details of the new employee.
            </p>
          </div>

          <div className="space-y-8">
            {/* Employee NIC Number and Sex */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nicNumber" className="text-sm font-semibold text-gray-700">
                  Employee NIC Number <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="nicNumber"
                    name="nicNumber"
                    placeholder="e.g. 199012345678"
                    value={formData.nicNumber}
                    onChange={handleInputChange}
                    className="pl-11 h-12 bg-gray-50 border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sex" className="text-sm font-semibold text-gray-700">
                  Sex <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
                  <Select
                    value={formData.sex}
                    onValueChange={(value) => handleSelectChange("sex", value)}
                  >
                    <SelectTrigger className="pl-11 h-12 bg-gray-50 border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                      <SelectValue placeholder="Select Sex" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Full Name and Surname */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="e.g. Jonathan David Doe"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="pl-11 h-12 bg-gray-50 border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="surname" className="text-sm font-semibold text-gray-700">
                  Surname <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="surname"
                    name="surname"
                    placeholder="e.g. Doe"
                    value={formData.surname}
                    onChange={handleInputChange}
                    className="pl-11 h-12 bg-gray-50 border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Date of Birth and Date Joined */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-sm font-semibold text-gray-700">
                  Date of Birth
                </Label>
                <div className="relative" ref={dobCalendarRef}>
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                  <input
                    type="text"
                    id="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange(e)}
                    onFocus={() => setShowDateOfBirthCalendar(true)}
                    placeholder="mm/dd/yyyy"
                    name="dateOfBirth"
                    className="w-full pl-11 pr-4 h-12 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  />
                  
                  {/* Calendar Dropdown */}
                  {showDateOfBirthCalendar && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 w-80">
                      {/* Calendar Header */}
                      <div className="flex items-center justify-between mb-4">
                        <button
                          type="button"
                          onClick={() => setCurrentMonthDOB(new Date(currentMonthDOB.getFullYear(), currentMonthDOB.getMonth() - 1, 1))}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <ChevronLeft size={20} className="text-gray-600" />
                        </button>
                        <span className="font-semibold text-gray-800">
                          {getMonthName(currentMonthDOB)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentMonthDOB(new Date(currentMonthDOB.getFullYear(), currentMonthDOB.getMonth() + 1, 1))}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <ChevronRight size={20} className="text-gray-600" />
                        </button>
                      </div>

                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 gap-1">
                        {/* Weekday Headers */}
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                          <div
                            key={day}
                            className="text-center text-xs font-medium text-gray-500 py-2"
                          >
                            {day}
                          </div>
                        ))}
                        
                        {/* Calendar Days */}
                        {getDaysInMonth(currentMonthDOB).map((dayObj, idx) => {
                          const isPast = isPastDate(dayObj.date);
                          const isDisabled = !dayObj.isCurrentMonth;
                          
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => !isDisabled && handleDateSelect(dayObj.date, 'dateOfBirth')}
                              disabled={isDisabled}
                              className={`
                                p-2 text-sm rounded-lg transition-colors
                                ${!dayObj.isCurrentMonth ? "text-gray-300 cursor-not-allowed" : ""}
                                ${isToday(dayObj.date) ? "bg-blue-50 text-blue-600 font-semibold" : ""}
                                ${isSelectedDate(dayObj.date, formData.dateOfBirth) ? "bg-amber-500 text-white font-semibold" : ""}
                                ${dayObj.isCurrentMonth && !isToday(dayObj.date) && !isSelectedDate(dayObj.date, formData.dateOfBirth) ? "hover:bg-gray-100 cursor-pointer" : ""}
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

              <div className="space-y-2">
                <Label htmlFor="dateJoined" className="text-sm font-semibold text-gray-700">
                  Date Joined
                </Label>
                <div className="relative" ref={djCalendarRef}>
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                  <input
                    type="text"
                    id="dateJoined"
                    value={formData.dateJoined}
                    onChange={(e) => handleInputChange(e)}
                    onFocus={() => setShowDateJoinedCalendar(true)}
                    placeholder="mm/dd/yyyy"
                    name="dateJoined"
                    className="w-full pl-11 pr-4 h-12 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  />
                  
                  {/* Calendar Dropdown */}
                  {showDateJoinedCalendar && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 w-80">
                      {/* Calendar Header */}
                      <div className="flex items-center justify-between mb-4">
                        <button
                          type="button"
                          onClick={() => setCurrentMonthDJ(new Date(currentMonthDJ.getFullYear(), currentMonthDJ.getMonth() - 1, 1))}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <ChevronLeft size={20} className="text-gray-600" />
                        </button>
                        <span className="font-semibold text-gray-800">
                          {getMonthName(currentMonthDJ)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentMonthDJ(new Date(currentMonthDJ.getFullYear(), currentMonthDJ.getMonth() + 1, 1))}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <ChevronRight size={20} className="text-gray-600" />
                        </button>
                      </div>

                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 gap-1">
                        {/* Weekday Headers */}
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                          <div
                            key={day}
                            className="text-center text-xs font-medium text-gray-500 py-2"
                          >
                            {day}
                          </div>
                        ))}
                        
                        {/* Calendar Days */}
                        {getDaysInMonth(currentMonthDJ).map((dayObj, idx) => {
                          const isDisabled = !dayObj.isCurrentMonth;
                          
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => !isDisabled && handleDateSelect(dayObj.date, 'dateJoined')}
                              disabled={isDisabled}
                              className={`
                                p-2 text-sm rounded-lg transition-colors
                                ${!dayObj.isCurrentMonth ? "text-gray-300 cursor-not-allowed" : ""}
                                ${isToday(dayObj.date) ? "bg-blue-50 text-blue-600 font-semibold" : ""}
                                ${isSelectedDate(dayObj.date, formData.dateJoined) ? "bg-amber-500 text-white font-semibold" : ""}
                                ${dayObj.isCurrentMonth && !isToday(dayObj.date) && !isSelectedDate(dayObj.date, formData.dateJoined) ? "hover:bg-gray-100 cursor-pointer" : ""}
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
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="e.g. jonathan.doe@company.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-11 h-12 bg-gray-50 border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Home Address */}
            <div className="space-y-2">
              <Label htmlFor="homeAddress" className="text-sm font-semibold text-gray-700">
                Home Address
              </Label>
              <div className="relative">
                <Home className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  id="homeAddress"
                  name="homeAddress"
                  placeholder="Street address, City, State, Zip Code"
                  value={formData.homeAddress}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full pl-11 pt-3 pr-4 pb-3 bg-gray-50 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                />
              </div>
            </div>

            {/* Marital Status */}
            <div className="space-y-2">
              <Label htmlFor="maritalStatus" className="text-sm font-semibold text-gray-700">
                Marital Status
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
                <Select
                  value={formData.maritalStatus}
                  onValueChange={(value) =>
                    handleSelectChange("maritalStatus", value)
                  }
                >
                  <SelectTrigger className="pl-11 h-12 bg-gray-50 border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Married">Married</SelectItem>
                    <SelectItem value="Divorced">Divorced</SelectItem>
                    <SelectItem value="Widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Info Alert */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800 leading-relaxed">
                Please ensure all personal details match the employee&apos;s
                government-issued ID documents (NIC) for compliance purposes.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <Button
            onClick={handleNextStep}
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-10 h-12 rounded-lg shadow-md transition-all"
          >
            Next Step →
          </Button>
        </div>
      </div>
    </div>
  );
}
