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

  // Initialize specific fields from formData or defaults
  useEffect(() => {
    if (!formData.password) {
      generateRandomPassword();
    }
    // Default account email based on name if empty
    if (!formData.accountEmail && formData.fullName) {
      const namePart = formData.fullName.split(' ')[0].toLowerCase();
      updateFormData({ accountEmail: `${namePart}@nexora.com` });
    }
  }, []);

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
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Register New Employee</h1>
      </div>

      {/* Progress Steps */}
      <div className="mb-12">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step.completed
                      ? "bg-emerald-500 text-white"
                      : step.id === 3
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-200 text-slate-400"
                    }`}
                >
                  {step.completed ? (
                    <CheckCircle2 size={24} />
                  ) : (
                    <span className="text-sm font-bold">0{step.id}</span>
                  )}
                </div>
                <p className={`mt-2 text-sm font-medium ${step.id === 3 ? "text-slate-900 dark:text-white" : "text-slate-500"}`}>
                  {step.label}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 -mt-10 transition-all ${step.completed ? "bg-emerald-500" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* System Access Form */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Configure System Access</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Set up the login credentials and permissions for the new employee.
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Role-Based Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Official Business Email (Role-Based)
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={formData.accountEmail}
                  onChange={(e) => updateFormData({ accountEmail: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
                  placeholder="e.g. director@nexora.com"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                This will be their login for administrative/managerial tasks.
              </p>
            </div>

            {/* User Role */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Assigned System Role
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Shield size={18} />
                </div>
                <select
                  value={formData.roleName}
                  onChange={(e) => updateFormData({ roleName: e.target.value })}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white appearance-none cursor-pointer"
                >
                  <option value="Employee">Normal Employee</option>
                  <option value="Admin">Administrator</option>
                  <option value="HR">HR Manager</option>
                  <option value="Director">Director</option>
                </select>
              </div>
            </div>
          </div>

          {/* Temporary Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Initial Password
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => updateFormData({ password: e.target.value })}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-indigo-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl font-semibold hover:bg-indigo-100 transition-all whitespace-nowrap"
              >
                <Sparkles size={16} />
                Auto-Generate
              </button>
            </div>
          </div>

          {/* Enable System Access Toggle */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Enable System Access</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  The employee will be able to log in with their personal email immediately.
                </p>
              </div>
              <button
                onClick={() => updateFormData({ enableSystemAccess: !formData.enableSystemAccess })}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  formData.enableSystemAccess ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    formData.enableSystemAccess ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Fingerprint Identity */}
          <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl p-5 flex gap-4">
            <div className="shrink-0">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Fingerprint size={14} className="text-white" />
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
          <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 rounded-2xl p-5 flex gap-4">
            <div className="shrink-0">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Shield size={14} className="text-white" />
              </div>
            </div>
            <p className="text-sm text-indigo-700 dark:text-indigo-400 leading-relaxed">
              <strong>Dual Identity Policy:</strong> If you assign a high-level role, the system will automatically create 
              two accounts. One for their personal employee tasks (using their personal email) and one for their role-based 
              dashboard (using the business email above).
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-10">
        <button
          onClick={() => onPrevious()}
          className="flex items-center gap-2 px-6 py-3 text-slate-600 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Employment
        </button>
        <button
          onClick={handleComplete}
          disabled={isSubmitting || submitSuccess}
          className={`flex items-center gap-3 px-10 py-4 font-bold rounded-2xl shadow-lg transition-all active:scale-95 ${
            submitSuccess
              ? "bg-emerald-500 text-white"
              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 dark:shadow-none"
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

      {/* Error Message */}
      {submitError && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          {submitError}
        </div>
      )}
    </div>
  );
}