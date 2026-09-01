"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Mail, Shield, Lock, Eye, EyeOff, CheckCircle2, Sparkles, Loader2, AlertCircle, Fingerprint } from "lucide-react";
import { useAdminNavigation } from "../AdminNavigationContext";
import type { EmployeeFormData } from "./RegisterEmployee";
import api from "@/lib/axiosInstance";
import type { AxiosError } from "axios";

interface RegisterEmployeeStep3Props {
  formData: EmployeeFormData;
  updateFormData: (fields: Partial<EmployeeFormData>) => void;
  onPrevious: () => void;
}

interface RegisteredEmployeeResponse {
  fingerprintUserId?: number | null;
}

export default function RegisterEmployeeStep3({ formData, updateFormData, onPrevious }: RegisterEmployeeStep3Props) {
  const { setActiveView } = useAdminNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [registeredFingerprintUserId, setRegisteredFingerprintUserId] = useState<number | null>(null);

  const generateBusinessEmail = () => {
    if (!formData.fullName) return "";
    const nameParts = formData.fullName.trim().split(/\s+/);
    const firstName = nameParts[0].toLowerCase();

    let lastName = "";
    if (formData.surname) {
      lastName = formData.surname.trim().toLowerCase();
    } else if (nameParts.length > 1) {
      lastName = nameParts[nameParts.length - 1].toLowerCase();
    }

    // Sanitize to alphanumeric characters only
    const cleanFirst = firstName.replace(/[^a-z0-9]/g, '');
    const cleanLast = lastName.replace(/[^a-z0-9]/g, '');

    let emailPrefix = cleanLast ? `${cleanFirst}.${cleanLast}` : cleanFirst;

    if (formData.nicNumber) {
      const cleanNic = formData.nicNumber.trim().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const nicSuffix = cleanNic.slice(-4);
      if (nicSuffix) {
        emailPrefix = `${emailPrefix}.${nicSuffix}`;
      }
    }

    return `${emailPrefix}@nexora.com`;
  };

  // Initialize specific fields from formData or defaults
  useEffect(() => {
    if (!formData.password) {
      generateRandomPassword();
    }
    // If role is Normal Employee, show the personal email from Step 1
    if (formData.roleName === "Employee") {
      if (!formData.accountEmail || formData.accountEmail.endsWith("@nexora.com")) {
        updateFormData({ accountEmail: formData.email || "" });
      }
    } else {
      // For higher roles, auto-generate business email if empty or equal to personal email
      if (!formData.accountEmail || formData.accountEmail === formData.email) {
        updateFormData({ accountEmail: generateBusinessEmail() });
      }
    }
  }, []);

  const handleRoleChange = (newRole: string) => {
    if (newRole === "Employee") {
      updateFormData({
        roleName: newRole,
        accountEmail: formData.email || "",
      });
    } else {
      const isPersonalOrEmpty = !formData.accountEmail || formData.accountEmail === formData.email;
      updateFormData({
        roleName: newRole,
        accountEmail: isPersonalOrEmpty ? generateBusinessEmail() : formData.accountEmail,
      });
    }
  };

  const generateRandomPassword = () => {
    const length = 10;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let newPassword = "Nex@";
    for (let i = 0; i < length - 4; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    updateFormData({ password: newPassword });
  };

  const steps = [
    { id: 1, label: "Personal Info", completed: true },
    { id: 2, label: "Employment", completed: true },
    { id: 3, label: "System Access", completed: false },
  ];

  const handleComplete = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setRegisteredFingerprintUserId(null);
    try {
      // Send the combined data to the backend
      const response = await api.post<RegisteredEmployeeResponse>("/api/employees", formData);
      setRegisteredFingerprintUserId(response.data.fingerprintUserId ?? null);
      setSubmitSuccess(true);

      // Navigate back to master list after success
      setTimeout(() => {
        setActiveView("employeeMaster");
      }, 2000);
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setSubmitError(
        axiosErr.response?.data?.message || "Failed to register employee. Please check your data and try again."
      );
    } finally {
      setIsSubmitting(false);
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
            {/* Step 1 - Completed */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-lg mb-3 shadow-md">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Personal Info</span>
            </div>

            {/* Connector */}
            <div className="flex-1 h-0.5 bg-gray-300 dark:bg-slate-700 mx-4 mb-8"></div>

            {/* Step 2 - Completed */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-lg mb-3 shadow-md">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Employment</span>
            </div>

            {/* Connector */}
            <div className="flex-1 h-0.5 bg-gray-300 dark:bg-slate-700 mx-4 mb-8"></div>

            {/* Step 3 - Active */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-lg mb-3 shadow-md">
                03
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">System Access</span>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-8">
          {/* Section Header */}
          <div className="mb-8 pb-6 border-b border-gray-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configure System Access</h2>
            <p className="text-gray-600 dark:text-slate-400 mt-1">
              Set up the login credentials and permissions for the new employee.
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Official Business Email / Account Email */}
              {formData.roleName === "Employee" ? (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">
                    Employee Email
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData({ email: e.target.value, accountEmail: e.target.value })}
                      className="w-full pl-11 pr-4 h-12 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 transition-all"
                      placeholder="e.g. employee@example.com"
                    />
                  </div>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                    Using the personal email provided in Step 1 for employee login.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">
                    Official Business Email
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                    <input
                      type="email"
                      value={formData.accountEmail}
                      onChange={(e) => updateFormData({ accountEmail: e.target.value })}
                      className="w-full pl-11 pr-4 h-12 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 transition-all"
                      placeholder="e.g. director@nexora.com"
                    />
                  </div>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                    This will be their login for administrative/managerial tasks.
                  </p>
                </div>
              )}

              {/* User Role */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Assigned System Role
                </label>
                <div className="relative group">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-amber-500 transition-colors pointer-events-none" />
                  <select
                    value={formData.roleName}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="w-full pl-11 pr-10 h-12 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm text-gray-900 dark:text-white cursor-pointer transition-all"
                  >
                    <option value="Employee">Normal Employee</option>
                    <option value="Admin">Administrator</option>
                    <option value="HR">HR Manager</option>
                    <option value="Director">Director</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Employee Email input for roles other than Normal Employee */}
            {formData.roleName !== "Employee" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">
                    Employee Email
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData({ email: e.target.value })}
                      className="w-full pl-11 pr-4 h-12 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 transition-all"
                      placeholder="e.g. personal@example.com"
                    />
                  </div>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                    Personal email from Step 1 for their personal employee account.
                  </p>
                </div>
              </div>
            )}

            {/* Temporary Password */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">
                Initial Password
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1 group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => updateFormData({ password: e.target.value })}
                    className="w-full pl-11 pr-10 h-12 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 transition-all"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-amber-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="flex items-center gap-2 px-5 h-12 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40 rounded-md font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all whitespace-nowrap"
                >
                  <Sparkles size={16} />
                  Auto-Generate
                </button>
              </div>
            </div>

            {/* Enable System Access Toggle */}
            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-5 border border-gray-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Enable System Access</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                    The employee will be able to log in with their personal email immediately.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => updateFormData({ enableSystemAccess: !formData.enableSystemAccess })}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${formData.enableSystemAccess ? "bg-amber-500" : "bg-gray-300 dark:bg-slate-700"
                    }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${formData.enableSystemAccess ? "translate-x-6" : "translate-x-1"
                      }`}
                  />
                </button>
              </div>
            </div>

            {/* Fingerprint Identity */}
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl p-5 flex gap-4">
              <div className="shrink-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <Fingerprint size={18} className="text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">Fingerprint Identity</h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-400 leading-relaxed mt-1">
                  A numeric fingerprint user ID will be assigned automatically after saving this employee.
                </p>
                {registeredFingerprintUserId !== null && (
                  <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300 mt-2">
                    Assigned ID: {registeredFingerprintUserId}
                  </p>
                )}
              </div>
            </div>

            {/* Important Message */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-xl p-5 flex gap-4">
              <div className="shrink-0">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Shield size={18} className="text-white" />
                </div>
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                <strong>Dual Identity Policy:</strong> If you assign a high-level role, the system will automatically create
                two accounts. One for their personal employee tasks (using their personal email) and one for their role-based
                dashboard (using the business email above).
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-3">
            <AlertCircle size={18} />
            {submitError}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between gap-4 mt-8">
          <button
            type="button"
            onClick={() => onPrevious()}
            className="flex items-center gap-2 px-10 h-12 font-semibold rounded-lg border-2 border-gray-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
          >
            <ArrowLeft size={18} />
            Previous
          </button>
          <button
            type="button"
            onClick={handleComplete}
            disabled={isSubmitting || submitSuccess}
            className={`flex items-center gap-3 px-10 h-12 font-semibold rounded-lg shadow-md transition-all active:scale-95 text-white ${submitSuccess
                ? "bg-green-600"
                : "bg-amber-500 hover:bg-amber-600"
              } disabled:opacity-70 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Finalizing Registration...
              </>
            ) : submitSuccess ? (
              <>
                <CheckCircle2 size={18} />
                Employee Registered!
              </>
            ) : (
              <>
                Complete Registration
                <CheckCircle2 size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}