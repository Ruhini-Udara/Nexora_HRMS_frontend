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
import { CalendarIcon, User, Mail, Home, IdCard, Users, Info, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, AlertCircle, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EmployeeFormData } from "./RegisterEmployee";
import api from "@/lib/axiosInstance";

interface RegisterEmployeeStep1Props {
  formData: EmployeeFormData;
  updateFormData: (fields: Partial<EmployeeFormData>) => void;
  onNext?: () => void;
}

export default function RegisterEmployeeStep1({
  formData,
  updateFormData,
  onNext,
}: RegisterEmployeeStep1Props) {

  const [showDateOfBirthCalendar, setShowDateOfBirthCalendar] = useState(false);
  const [showDateJoinedCalendar, setShowDateJoinedCalendar] = useState(false);
  const [currentMonthDOB, setCurrentMonthDOB] = useState(new Date());
  const [currentMonthDJ, setCurrentMonthDJ] = useState(new Date());
  const [viewDOB, setViewDOB] = useState<'days' | 'years'>('days');
  const [viewDJ, setViewDJ] = useState<'days' | 'years'>('days');
  const [error, setError] = useState<string | null>(null);
  const [nicExists, setNicExists] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [phoneExists, setPhoneExists] = useState(false);
  const [dobError, setDobError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [dateJoinedError, setDateJoinedError] = useState<string | null>(null);
  const [nicError, setNicError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const dobCalendarRef = useRef<HTMLDivElement>(null);
  const djCalendarRef = useRef<HTMLDivElement>(null);

  const parseDate = (dateStr: string): Date | null => {
    const trimmed = dateStr?.trim();
    if (!trimmed) return null;
    const parts = trimmed.split('/');
    if (parts.length !== 3) return null;
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (isNaN(month) || isNaN(day) || isNaN(year)) return null;
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }
    return date;
  };

  const validateAge = (dobStr: string): boolean => {
    const trimmed = dobStr.trim();
    if (!trimmed) {
      const errorMsg = "Date of Birth is required.";
      setDobError(errorMsg);
      setError(errorMsg);
      return false;
    }

    const dobParts = trimmed.split('/');
    if (dobParts.length !== 3) {
      const errorMsg = "Please enter a valid Date of Birth in MM/DD/YYYY format.";
      setDobError(errorMsg);
      setError(errorMsg);
      return false;
    }
    const dobMonth = parseInt(dobParts[0], 10);
    const dobDay = parseInt(dobParts[1], 10);
    const dobYear = parseInt(dobParts[2], 10);

    if (isNaN(dobMonth) || isNaN(dobDay) || isNaN(dobYear)) {
      const errorMsg = "Please enter a valid Date of Birth in MM/DD/YYYY format.";
      setDobError(errorMsg);
      setError(errorMsg);
      return false;
    }

    const dob = new Date(dobYear, dobMonth - 1, dobDay);
    if (
      dob.getFullYear() !== dobYear ||
      dob.getMonth() !== dobMonth - 1 ||
      dob.getDate() !== dobDay
    ) {
      const errorMsg = "Please enter a valid Date of Birth.";
      setDobError(errorMsg);
      setError(errorMsg);
      return false;
    }

    // Calculate age and check if under 18
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < 18) {
      const errorMsg = "Employee must be at least 18 years old.";
      setDobError(errorMsg);
      setError(errorMsg);
      return false;
    }

    setDobError(null);
    setError(null);
    return true;
  };

  const validateBirthYearWithNic = (dobStr: string, nicStr: string): boolean => {
    const trimmedDob = dobStr?.trim();
    const trimmedNic = nicStr?.trim();
    if (!trimmedDob || !trimmedNic) {
      return true;
    }

    const dobParts = trimmedDob.split('/');
    if (dobParts.length !== 3) {
      return true;
    }
    const dobYear = parseInt(dobParts[2], 10);
    if (isNaN(dobYear)) {
      return true;
    }

    if (/^[0-9]{4}/.test(trimmedNic)) {
      const firstFour = trimmedNic.substring(0, 4);
      if (dobYear.toString() !== firstFour) {
        // Also support old NIC format (9 digits + V/X) where first 2 digits represent the birth year
        if (/^[0-9]{9}[vVxX]$/.test(trimmedNic)) {
          const firstTwo = trimmedNic.substring(0, 2);
          if (dobYear.toString().slice(2) !== firstTwo) {
            const errorMsg = `The year of birthday (${dobYear}) should match the NIC number birth year (${firstTwo}).`;
            setDobError(errorMsg);
            setError(errorMsg);
            return false;
          }
          if (dobError && (dobError.includes("NIC number") || dobError.includes("nic number"))) {
            setDobError(null);
          }
          return true;
        }

        const errorMsg = "The year of birthday should be same to nic number first four number.";
        setDobError(errorMsg);
        setError(errorMsg);
        return false;
      }
    }

    if (dobError && (dobError.includes("NIC number") || dobError.includes("nic number"))) {
      setDobError(null);
    }
    return true;
  };

  const validateDateJoined = (djStr: string, dobStr: string): boolean => {
    const trimmedDJ = djStr?.trim();
    if (!trimmedDJ) {
      setDateJoinedError(null);
      return true;
    }

    const djDate = parseDate(trimmedDJ);
    if (!djDate) {
      const errorMsg = "Please enter a valid Date Joined in MM/DD/YYYY format.";
      setDateJoinedError(errorMsg);
      return false;
    }

    const trimmedDOB = dobStr?.trim();
    if (!trimmedDOB) {
      setDateJoinedError(null);
      return true;
    }

    const dobDate = parseDate(trimmedDOB);
    if (!dobDate) {
      setDateJoinedError(null);
      return true;
    }

    const minJoinDate = new Date(dobDate.getFullYear() + 18, dobDate.getMonth(), dobDate.getDate());
    if (djDate < minJoinDate) {
      const errorMsg = "Birthday and joined date in mismatch. Date joined must be after birthday + 18 years.";
      setDateJoinedError(errorMsg);
      return false;
    }

    setDateJoinedError(null);
    return true;
  };

  const validateNic = (nicStr: string): string | null => {
    const trimmed = nicStr.trim();
    if (!trimmed) {
      return null;
    }

    if (!/^[0-9vVxX]+$/.test(trimmed)) {
      return "NIC can only contain numbers and 'V' or 'X'";
    }

    if (/[vVxX]/.test(trimmed.slice(0, -1))) {
      return "Letter (V/X) can only appear at the end of the NIC number";
    }

    if (trimmed.length > 12) {
      return "NIC number cannot exceed 12 characters";
    }

    if (trimmed.length < 10) {
      return `NIC must be 10 characters (old format: 9 digits + V/X) or 12 digits (${trimmed.length} entered)`;
    }

    if (trimmed.length === 10) {
      if (/^[0-9]{9}[vVxX]$/.test(trimmed)) {
        return null; // Valid old NIC format
      }
      if (/^[0-9]{10}$/.test(trimmed)) {
        return "Old NIC format requires 9 digits followed by V or X, or enter a 12-digit new NIC (10/12 entered)";
      }
      return "Old NIC format must have 9 digits followed by V or X (e.g. 941234567V)";
    }

    if (trimmed.length === 11) {
      if (/[vVxX]/.test(trimmed)) {
        return "12-digit new NIC format must contain only numbers (no letters allowed)";
      }
      return "New NIC format must be 12 digits (11/12 digits entered)";
    }

    if (trimmed.length === 12) {
      if (/^[0-9]{12}$/.test(trimmed)) {
        return null; // Valid new NIC format
      }
      return "12-digit new NIC format must contain only numbers (no letters allowed)";
    }

    const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
    if (!nicRegex.test(trimmed)) {
      return "Please enter a valid Sri Lankan NIC number (e.g. 941234567V or 199412345678)";
    }

    return null;
  };

  const validateEmail = (emailStr: string): string | null => {
    const trimmed = emailStr.trim();
    if (!trimmed) {
      return null;
    }

    if (trimmed.length > 254) {
      return "Email address cannot exceed 254 characters";
    }

    if (/\s/.test(trimmed)) {
      return "Email address cannot contain spaces";
    }

    if (!trimmed.includes("@")) {
      return "Email address must include '@' (e.g. user@example.com)";
    }

    const parts = trimmed.split("@");
    if (parts.length > 2) {
      return "Email address can only contain one '@'";
    }

    const [username, domain] = parts;

    if (!username) {
      return "Username before '@' cannot be empty";
    }

    if (username.length > 64) {
      return "Username before '@' cannot exceed 64 characters";
    }

    if (username.startsWith(".")) {
      return "Username before '@' cannot start with a dot";
    }

    if (username.endsWith(".")) {
      return "Username before '@' cannot end with a dot";
    }

    if (username.includes("..")) {
      return "Username before '@' cannot contain consecutive dots";
    }

    if (!/^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*$/.test(username)) {
      return "Username contains invalid characters (only letters, numbers, and . _ + & * - are allowed)";
    }

    if (!domain) {
      return "Domain name after '@' cannot be empty (e.g. gmail.com)";
    }

    if (domain.startsWith(".")) {
      return "Domain name cannot start with a dot";
    }

    if (domain.endsWith(".")) {
      return "Domain name cannot end with a dot";
    }

    if (domain.includes("..")) {
      return "Domain name cannot contain consecutive dots";
    }

    if (!domain.includes(".")) {
      return "Domain name must contain a dot (e.g. example.com)";
    }

    const domainLabels = domain.split(".");
    for (const label of domainLabels) {
      if (!label) {
        return "Domain parts cannot be empty";
      }
      if (label.startsWith("-")) {
        return "Domain name cannot start with a hyphen (e.g. -example.com)";
      }
      if (label.endsWith("-")) {
        return "Domain name cannot end with a hyphen (e.g. example-.com)";
      }
      if (!/^[a-zA-Z0-9-]+$/.test(label)) {
        return "Domain name can only contain letters, numbers, and hyphens";
      }
    }

    const tld = domainLabels[domainLabels.length - 1];
    if (tld.length < 2) {
      return "Top-level domain (e.g. .com) must be at least 2 letters";
    }

    if (!/^[a-zA-Z]+$/.test(tld)) {
      return "Top-level domain (e.g. .com) must contain only letters";
    }

    return null;
  };

  const validatePhone = (phoneStr: string): string | null => {
    const trimmed = phoneStr.trim();
    if (!trimmed) {
      return null;
    }

    if (trimmed.startsWith("0")) {
      return "Phone number cannot start with 0. Must start with +94 (e.g. +94771234567)";
    }

    if (!trimmed.startsWith("+94")) {
      return "Phone number must start with +94 (e.g. +94771234567)";
    }

    const afterPlus = trimmed.slice(1);
    if (!/^\d+$/.test(afterPlus)) {
      return "Phone number can only contain digits after +";
    }

    if (trimmed.length > 12) {
      return "Phone number cannot exceed 9 digits after +94";
    }

    if (trimmed.length < 12) {
      const digitsCount = trimmed.slice(3).length;
      return `Phone number must be 9 digits after +94 (${digitsCount}/9 digits entered)`;
    }

    if (!/^\+94\d{9}$/.test(trimmed)) {
      return "Please enter a valid phone number (e.g. +94771234567)";
    }

    return null;
  };

  const shouldClearError = (fieldName: string, currentError: string | null): boolean => {
    if (!currentError) return false;
    if (fieldName === "nicNumber") {
      return currentError.includes("NIC");
    }
    if (fieldName === "fullName") {
      return currentError.includes("Full Name");
    }
    if (fieldName === "surname") {
      return currentError.includes("Surname");
    }
    if (fieldName === "sex") {
      return currentError.includes("Sex");
    }
    if (fieldName === "email") {
      return currentError.includes("Email") || currentError.includes("gmail");
    }
    if (fieldName === "phoneNumber") {
      return currentError.includes("Phone") || currentError.includes("phone");
    }
    if (fieldName === "dateOfBirth" || fieldName === "nicNumber") {
      return (
        currentError.includes("Date of Birth") ||
        currentError.includes("18 years old") ||
        currentError.includes("nic number") ||
        currentError.includes("NIC number") ||
        currentError.includes("NIC")
      );
    }
    if (fieldName === "dateJoined") {
      return (
        currentError.includes("Date Joined") ||
        currentError.includes("mismatch")
      );
    }
    return true;
  };

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

  useEffect(() => {
    const trimmed = formData.nicNumber?.trim() ?? "";
    const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;

    if (!nicRegex.test(trimmed)) {
      setNicExists(false);
      return;
    }

    let cancelled = false;

    const timeoutId = setTimeout(async () => {
      try {
        const response = await api.get<boolean>(`/api/employees/exists-nic/${trimmed}`);
        if (!cancelled) {
          setNicExists(response.data === true);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error checking NIC uniqueness:", err);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [formData.nicNumber]);

  useEffect(() => {
    const trimmed = formData.email?.trim() ?? "";

    if (!trimmed || validateEmail(trimmed) !== null) {
      setEmailExists(false);
      return;
    }

    let cancelled = false;

    const timeoutId = setTimeout(async () => {
      try {
        const response = await api.get<boolean>(`/api/employees/exists-email/${trimmed}`);
        if (!cancelled) {
          setEmailExists(response.data === true);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error checking email uniqueness:", err);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [formData.email]);

  useEffect(() => {
    const trimmed = formData.phoneNumber?.trim() ?? "";
    const phoneRegex = /^\+94\d{9}$/;

    if (!phoneRegex.test(trimmed)) {
      setPhoneExists(false);
      return;
    }

    let cancelled = false;

    const timeoutId = setTimeout(async () => {
      try {
        const response = await api.get<boolean>(`/api/employees/exists-phone`, {
          params: { phoneNumber: trimmed }
        });
        if (!cancelled) {
          setPhoneExists(response.data === true);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error checking phone uniqueness:", err);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [formData.phoneNumber]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
    if (name === "nicNumber") {
      setNicExists(false);
      setNicError(validateNic(value));
      if (formData.dateOfBirth) {
        validateBirthYearWithNic(formData.dateOfBirth, value);
      }
    }
    if (name === "email") {
      setEmailExists(false);
      setEmailError(validateEmail(value));
    }
    if (name === "phoneNumber") {
      setPhoneExists(false);
      setPhoneError(validatePhone(value));
    }
    if (name === "dateOfBirth") {
      setDobError(null);
      if (validateAge(value)) {
        if (formData.nicNumber) {
          validateBirthYearWithNic(value, formData.nicNumber);
        }
      }
      if (formData.dateJoined) {
        validateDateJoined(formData.dateJoined, value);
      }
    }
    if (name === "dateJoined") {
      setDateJoinedError(null);
      validateDateJoined(value, formData.dateOfBirth);
    }
    if (error && shouldClearError(name, error)) {
      setError(null);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    updateFormData({ [name]: value });
    if (error && shouldClearError(name, error)) {
      setError(null);
    }
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
    const formatted = formatDate(date);
    updateFormData({ [field]: formatted });
    if (field === 'dateOfBirth') {
      setShowDateOfBirthCalendar(false);
      if (validateAge(formatted)) {
        if (formData.nicNumber) {
          validateBirthYearWithNic(formatted, formData.nicNumber);
        }
      }
      if (formData.dateJoined) {
        validateDateJoined(formData.dateJoined, formatted);
      }
    } else {
      setShowDateJoinedCalendar(false);
      validateDateJoined(formatted, formData.dateOfBirth);
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

  const isFutureDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate > today;
  };

  const isFutureMonth = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() > today.getFullYear() ||
      (date.getFullYear() === today.getFullYear() && date.getMonth() > today.getMonth())
    );
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const handleNextStep = () => {
    if (!formData.nicNumber.trim()) {
      setError("NIC Number is required.");
      return;
    }
    if (!formData.fullName.trim()) {
      setError("Full Name is required.");
      return;
    }
    if (!formData.surname.trim()) {
      setError("Surname is required.");
      return;
    }
    if (!formData.sex) {
      setError("Sex is required.");
      return;
    }
    // Email format validation
    if (!formData.email.trim()) {
      setError("Email Address is required.");
      setEmailError("Email Address is required.");
      return;
    }

    const eError = validateEmail(formData.email.trim());
    if (eError) {
      setError(eError);
      setEmailError(eError);
      return;
    }

    // Sri Lankan NIC Format Validation
    if (!formData.nicNumber.trim()) {
      setError("NIC Number is required.");
      setNicError("NIC Number is required.");
      return;
    }

    const nError = validateNic(formData.nicNumber.trim());
    if (nError) {
      setError(nError);
      setNicError(nError);
      return;
    }

    if (nicExists) {
      setError("NIC Number already registered");
      return;
    }

    if (emailExists) {
      setError("gmail already registered");
      return;
    }

    // Phone number validation - must start with +94 followed by 9 digits (total 12 characters)
    if (formData.phoneNumber && formData.phoneNumber.trim()) {
      const trimmedPhone = formData.phoneNumber.trim();
      const pError = validatePhone(trimmedPhone);
      if (pError || !/^\+94\d{9}$/.test(trimmedPhone)) {
        const errorMsg = pError || "Phone Number must start with +94 followed by 9 digits (e.g., +94771234567).";
        setError(errorMsg);
        setPhoneError(errorMsg);
        return;
      }
      if (phoneExists) {
        setError("Phone number already registered");
        return;
      }
    }

    // Date of Birth validation
    if (!validateAge(formData.dateOfBirth)) {
      return;
    }

    if (!validateBirthYearWithNic(formData.dateOfBirth, formData.nicNumber)) {
      return;
    }

    // Date Joined validation
    if (formData.dateJoined && !validateDateJoined(formData.dateJoined, formData.dateOfBirth)) {
      setError("Birthday and joined date in mismatch. Date joined must be after birthday + 18 years.");
      return;
    }

    setError(null);
    if (onNext) {
      onNext();
    }
  };

  return (
    <div className="min-h-screen pb-10">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Register New Employee</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-2">Complete all required fields to add a new employee to the system</p>
        </div>

        {/* Stepper */}
        <div className="mb-10">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {/* Step 1 - Active */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-14 h-14 rounded-full bg-[#8B3A00] text-white flex items-center justify-center font-bold text-lg mb-3 shadow-md">
                01
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Personal Info</span>
            </div>

            {/* Connector */}
            <div className="flex-1 h-0.5 bg-gray-300 dark:bg-slate-700 mx-4 mb-8"></div>

            {/* Step 2 - Inactive */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-slate-800 text-gray-400 dark:text-slate-500 flex items-center justify-center font-bold text-lg mb-3">
                02
              </div>
              <span className="text-sm text-gray-500 dark:text-slate-400">Employment</span>
            </div>

            {/* Connector */}
            <div className="flex-1 h-0.5 bg-gray-300 dark:bg-slate-700 mx-4 mb-8"></div>

            {/* Step 3 - Inactive */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-slate-800 text-gray-400 dark:text-slate-500 flex items-center justify-center font-bold text-lg mb-3">
                03
              </div>
              <span className="text-sm text-gray-500 dark:text-slate-400">System Access</span>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-8">
          {/* Section Header */}
          <div className="mb-8 pb-6 border-b border-gray-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Basic Information</h2>
            <p className="text-gray-600 dark:text-slate-400 mt-1">
              Please provide the personal details of the new employee.
            </p>
          </div>

          <div className="space-y-8">
            {/* Employee NIC Number and Sex */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nicNumber" className="text-sm font-semibold text-gray-700 dark:text-slate-300">
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
                    className="pl-11 h-12 bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
                {nicError && (
                  <p className="text-xs text-red-600 font-semibold mt-1">
                    {nicError}
                  </p>
                )}
                {!nicError && nicExists && (
                  <p className="text-xs text-red-600 font-semibold mt-1">
                    NIC Number already registered
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sex" className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Sex <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
                  <Select
                    value={formData.sex}
                    onValueChange={(value) => handleSelectChange("sex", value)}
                  >
                    <SelectTrigger className="pl-11 h-12 bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white focus:border-amber-500 focus:ring-amber-500">
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
                <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700 dark:text-slate-300">
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
                    className="pl-11 h-12 bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="surname" className="text-sm font-semibold text-gray-700 dark:text-slate-300">
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
                    className="pl-11 h-12 bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Date of Birth and Date Joined */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Date of Birth <span className="text-red-500">*</span>
                </Label>

                <div className="relative" ref={dobCalendarRef}>
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                  <input
                    type="text"
                    id="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange(e)}
                    onFocus={() => {
                      setShowDateOfBirthCalendar(true);
                      setViewDOB('days');
                    }}
                    onBlur={(e) => {
                      // Only validate if focus is moving outside the calendar container
                      if (
                        dobCalendarRef.current &&
                        e.relatedTarget &&
                        dobCalendarRef.current.contains(e.relatedTarget as Node)
                      ) {
                        return;
                      }
                      if (validateAge(e.target.value)) {
                        if (formData.nicNumber) {
                          validateBirthYearWithNic(e.target.value, formData.nicNumber);
                        }
                      }
                    }}
                    placeholder="mm/dd/yyyy"
                    name="dateOfBirth"
                    className={`w-full pl-11 pr-4 h-12 bg-gray-50 dark:bg-slate-800 border ${dobError ? "border-red-500" : "border-gray-300 dark:border-slate-700"} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all`}
                  />

                  {/* Calendar Dropdown */}
                  {showDateOfBirthCalendar && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 w-80">
                      {viewDOB === 'days' ? (
                        <>
                          {/* Calendar Header */}
                          <div className="flex items-center justify-between mb-4">
                            <button
                              type="button"
                              onClick={() => setCurrentMonthDOB(new Date(currentMonthDOB.getFullYear(), currentMonthDOB.getMonth() - 1, 1))}
                              className="p-1 hover:bg-gray-100 rounded transition-colors shrink-0"
                              title="Previous Month"
                            >
                              <ChevronLeft size={20} className="text-gray-600" />
                            </button>
                            <span
                              className="font-semibold text-gray-800 text-sm cursor-pointer hover:bg-gray-100 hover:text-[#8B3A00] px-2.5 py-1 rounded transition-all select-none"
                              onClick={() => setViewDOB('years')}
                              title="Click to select month and year"
                            >
                              {getMonthName(currentMonthDOB)}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const nextMonth = new Date(currentMonthDOB.getFullYear(), currentMonthDOB.getMonth() + 1, 1);
                                if (!isFutureMonth(nextMonth)) {
                                  setCurrentMonthDOB(nextMonth);
                                }
                              }}
                              disabled={isFutureMonth(new Date(currentMonthDOB.getFullYear(), currentMonthDOB.getMonth() + 1, 1))}
                              className="p-1 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors shrink-0"
                              title="Next Month"
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
                              const isFuture = isFutureDate(dayObj.date);
                              const isDisabled = !dayObj.isCurrentMonth || isFuture;

                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => !isDisabled && handleDateSelect(dayObj.date, 'dateOfBirth')}
                                  disabled={isDisabled}
                                  className={`
                                    p-2 text-sm rounded-lg transition-colors
                                    ${isDisabled ? "text-gray-300 cursor-not-allowed" : ""}
                                    ${isToday(dayObj.date) ? "bg-blue-50 text-blue-600 font-semibold" : ""}
                                    ${isSelectedDate(dayObj.date, formData.dateOfBirth) ? "bg-[#8B3A00] text-white font-semibold" : ""}
                                    ${dayObj.isCurrentMonth && !isToday(dayObj.date) && !isSelectedDate(dayObj.date, formData.dateOfBirth) && !isFuture ? "hover:bg-gray-100 cursor-pointer" : ""}
                                  `}
                                >
                                  {dayObj.day}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Calendar Header for Years/Months View */}
                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                            <span className="font-bold text-gray-800 text-sm">
                              Select Month & Year
                            </span>
                            <button
                              type="button"
                              onClick={() => setViewDOB('days')}
                              className="text-xs font-semibold text-[#8B3A00] hover:text-[#722F00] transition-colors"
                            >
                              Cancel
                            </button>
                          </div>

                          <div className="flex gap-2">
                            {/* Scrollable Month List */}
                            <div className="flex-1 h-48 overflow-y-auto border border-gray-200 rounded-lg p-1 bg-gray-50 scrollbar-thin">
                              <div className="text-[10px] font-bold text-gray-400 mb-1 px-2 uppercase tracking-wider">Month</div>
                              {Array.from({ length: 12 }, (_, i) => {
                                const isFuture = currentMonthDOB.getFullYear() === new Date().getFullYear() && i > new Date().getMonth();
                                return (
                                  <button
                                    key={i}
                                    type="button"
                                    disabled={isFuture}
                                    onClick={() => {
                                      setCurrentMonthDOB(new Date(currentMonthDOB.getFullYear(), i, 1));
                                    }}
                                    className={`
                                      w-full text-left px-2.5 py-1 text-xs rounded transition-colors font-medium mb-1 block
                                      ${isFuture ? "opacity-30 cursor-not-allowed text-gray-400" : ""}
                                      ${!isFuture && currentMonthDOB.getMonth() === i ? "bg-[#8B3A00] text-white font-semibold shadow-sm" : ""}
                                      ${!isFuture && currentMonthDOB.getMonth() !== i ? "hover:bg-gray-200 text-gray-700" : ""}
                                    `}
                                  >
                                    {new Date(2000, i, 1).toLocaleDateString("en-US", { month: "short" })}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Scrollable Year List */}
                            <div className="flex-1 h-48 overflow-y-auto border border-gray-200 rounded-lg p-1 bg-gray-50 scrollbar-thin">
                              <div className="text-[10px] font-bold text-gray-400 mb-1 px-2 uppercase tracking-wider">Year</div>
                              {Array.from({ length: 101 }, (_, i) => {
                                const year = new Date().getFullYear() - 100 + i;
                                return year;
                              }).reverse().map((year) => (
                                <button
                                  key={year}
                                  type="button"
                                  onClick={() => {
                                    const nextDate = new Date(year, currentMonthDOB.getMonth(), 1);
                                    const today = new Date();
                                    if (year === today.getFullYear() && currentMonthDOB.getMonth() > today.getMonth()) {
                                      setCurrentMonthDOB(new Date(year, today.getMonth(), 1));
                                    } else {
                                      setCurrentMonthDOB(nextDate);
                                    }
                                  }}
                                  className={`
                                    w-full text-left px-2.5 py-1 text-xs rounded transition-colors font-medium mb-1 block
                                    ${currentMonthDOB.getFullYear() === year ? "bg-[#8B3A00] text-white font-semibold shadow-sm" : "hover:bg-gray-200 text-gray-700"}
                                  `}
                                >
                                  {year}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Footer Apply button */}
                          <div className="flex justify-end mt-3 border-t border-gray-150 pt-2.5">
                            <button
                              type="button"
                              onClick={() => setViewDOB('days')}
                              className="px-4 py-1.5 bg-[#8B3A00] hover:bg-[#722F00] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                            >
                              Apply Selection
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                {dobError && (
                  <p className="text-xs text-red-600 font-semibold mt-1">
                    {dobError}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateJoined" className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Date Joined
                </Label>
                <div className="relative" ref={djCalendarRef}>
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                  <input
                    type="text"
                    id="dateJoined"
                    value={formData.dateJoined}
                    onChange={(e) => handleInputChange(e)}
                    onFocus={() => {
                      setShowDateJoinedCalendar(true);
                      setViewDJ('days');
                    }}
                    onBlur={(e) => {
                      if (
                        djCalendarRef.current &&
                        e.relatedTarget &&
                        djCalendarRef.current.contains(e.relatedTarget as Node)
                      ) {
                        return;
                      }
                      validateDateJoined(e.target.value, formData.dateOfBirth);
                    }}
                    placeholder="mm/dd/yyyy"
                    name="dateJoined"
                    className="w-full pl-11 pr-4 h-12 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  />

                  {/* Calendar Dropdown */}
                  {showDateJoinedCalendar && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 w-80">
                      {viewDJ === 'days' ? (
                        <>
                          {/* Calendar Header */}
                          <div className="flex items-center justify-between mb-4">
                            <button
                              type="button"
                              onClick={() => setCurrentMonthDJ(new Date(currentMonthDJ.getFullYear(), currentMonthDJ.getMonth() - 1, 1))}
                              className="p-1 hover:bg-gray-100 rounded transition-colors shrink-0"
                              title="Previous Month"
                            >
                              <ChevronLeft size={20} className="text-gray-600" />
                            </button>
                            <span
                              className="font-semibold text-gray-800 text-sm cursor-pointer hover:bg-gray-100 hover:text-[#8B3A00] px-2.5 py-1 rounded transition-all select-none"
                              onClick={() => setViewDJ('years')}
                              title="Click to select month and year"
                            >
                              {getMonthName(currentMonthDJ)}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const nextMonth = new Date(currentMonthDJ.getFullYear(), currentMonthDJ.getMonth() + 1, 1);
                                if (!isFutureMonth(nextMonth)) {
                                  setCurrentMonthDJ(nextMonth);
                                }
                              }}
                              disabled={isFutureMonth(new Date(currentMonthDJ.getFullYear(), currentMonthDJ.getMonth() + 1, 1))}
                              className="p-1 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors shrink-0"
                              title="Next Month"
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
                              const isFuture = isFutureDate(dayObj.date);
                              const isDisabled = !dayObj.isCurrentMonth || isFuture;

                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => !isDisabled && handleDateSelect(dayObj.date, 'dateJoined')}
                                  disabled={isDisabled}
                                  className={`
                                    p-2 text-sm rounded-lg transition-colors
                                    ${isDisabled ? "text-gray-300 cursor-not-allowed" : ""}
                                    ${isToday(dayObj.date) ? "bg-blue-50 text-blue-600 font-semibold" : ""}
                                    ${isSelectedDate(dayObj.date, formData.dateJoined) ? "bg-[#8B3A00] text-white font-semibold" : ""}
                                    ${dayObj.isCurrentMonth && !isToday(dayObj.date) && !isSelectedDate(dayObj.date, formData.dateJoined) && !isFuture ? "hover:bg-gray-100 cursor-pointer" : ""}
                                  `}
                                >
                                  {dayObj.day}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Calendar Header for Years/Months View */}
                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                            <span className="font-bold text-gray-800 text-sm">
                              Select Month & Year
                            </span>
                            <button
                              type="button"
                              onClick={() => setViewDJ('days')}
                              className="text-xs font-semibold text-[#8B3A00] hover:text-[#722F00] transition-colors"
                            >
                              Cancel
                            </button>
                          </div>

                          <div className="flex gap-2">
                            {/* Scrollable Month List */}
                            <div className="flex-1 h-48 overflow-y-auto border border-gray-200 rounded-lg p-1 bg-gray-50 scrollbar-thin">
                              <div className="text-[10px] font-bold text-gray-400 mb-1 px-2 uppercase tracking-wider">Month</div>
                              {Array.from({ length: 12 }, (_, i) => {
                                const isFuture = currentMonthDJ.getFullYear() === new Date().getFullYear() && i > new Date().getMonth();
                                return (
                                  <button
                                    key={i}
                                    type="button"
                                    disabled={isFuture}
                                    onClick={() => {
                                      setCurrentMonthDJ(new Date(currentMonthDJ.getFullYear(), i, 1));
                                    }}
                                    className={`
                                      w-full text-left px-2.5 py-1 text-xs rounded transition-colors font-medium mb-1 block
                                      ${isFuture ? "opacity-30 cursor-not-allowed text-gray-400" : ""}
                                      ${!isFuture && currentMonthDJ.getMonth() === i ? "bg-[#8B3A00] text-white font-semibold shadow-sm" : ""}
                                      ${!isFuture && currentMonthDJ.getMonth() !== i ? "hover:bg-gray-200 text-gray-700" : ""}
                                    `}
                                  >
                                    {new Date(2000, i, 1).toLocaleDateString("en-US", { month: "short" })}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Scrollable Year List */}
                            <div className="flex-1 h-48 overflow-y-auto border border-gray-200 rounded-lg p-1 bg-gray-50 scrollbar-thin">
                              <div className="text-[10px] font-bold text-gray-400 mb-1 px-2 uppercase tracking-wider">Year</div>
                              {Array.from({ length: 101 }, (_, i) => {
                                const year = new Date().getFullYear() - 100 + i;
                                return year;
                              }).reverse().map((year) => (
                                <button
                                  key={year}
                                  type="button"
                                  onClick={() => {
                                    const nextDate = new Date(year, currentMonthDJ.getMonth(), 1);
                                    const today = new Date();
                                    if (year === today.getFullYear() && currentMonthDJ.getMonth() > today.getMonth()) {
                                      setCurrentMonthDJ(new Date(year, today.getMonth(), 1));
                                    } else {
                                      setCurrentMonthDJ(nextDate);
                                    }
                                  }}
                                  className={`
                                    w-full text-left px-2.5 py-1 text-xs rounded transition-colors font-medium mb-1 block
                                    ${currentMonthDJ.getFullYear() === year ? "bg-[#8B3A00] text-white font-semibold shadow-sm" : "hover:bg-gray-200 text-gray-700"}
                                  `}
                                >
                                  {year}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Footer Apply button */}
                          <div className="flex justify-end mt-3 border-t border-gray-150 pt-2.5">
                            <button
                              type="button"
                              onClick={() => setViewDJ('days')}
                              className="px-4 py-1.5 bg-[#8B3A00] hover:bg-[#722F00] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                            >
                              Apply Selection
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                {dateJoinedError && (
                  <p className="text-xs text-red-600 font-semibold mt-1">
                    {dateJoinedError}
                  </p>
                )}
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-slate-300">
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
                  className="pl-11 h-12 bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
              {emailError && (
                <p className="text-xs text-red-600 font-semibold mt-1">
                  {emailError}
                </p>
              )}
              {!emailError && emailExists && (
                <p className="text-xs text-red-600 font-semibold mt-1">
                  Email address already registered
                </p>
              )}
            </div>

            {/* Home Address */}
            <div className="space-y-2">
              <Label htmlFor="homeAddress" className="text-sm font-semibold text-gray-700 dark:text-slate-300">
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
                  className="w-full pl-11 pt-3 pr-4 pb-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                />
              </div>
            </div>

            {/* Marital Status and Phone Number */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="maritalStatus" className="text-sm font-semibold text-gray-700 dark:text-slate-300">
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
                    <SelectTrigger className="pl-11 h-12 bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white focus:border-amber-500 focus:ring-amber-500">
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

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="e.g. +94771234567"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="pl-11 h-12 bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
                {phoneError && (
                  <p className="text-xs text-red-600 font-semibold mt-1">
                    {phoneError}
                  </p>
                )}
                {!phoneError && phoneExists && (
                  <p className="text-xs text-red-600 font-semibold mt-1">
                    Phone number already registered
                  </p>
                )}
              </div>
            </div>

            {/* Info Alert */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-lg">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                Please ensure all personal details match the employee&apos;s
                government-issued ID documents (NIC) for compliance purposes.
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <Button
            onClick={handleNextStep}
            className="bg-[#8B3A00] hover:bg-[#722F00] text-white font-semibold px-10 h-12 rounded-lg shadow-md transition-all"
          >
            Next Step →
          </Button>
        </div>
      </div>
    </div>
  );
}
