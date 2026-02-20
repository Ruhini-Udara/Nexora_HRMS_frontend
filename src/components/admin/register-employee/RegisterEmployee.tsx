"use client";

import React, { useState } from "react";
import { ArrowLeft, Mail, Shield, Lock, Eye, EyeOff, CheckCircle2, Circle, Sparkles } from "lucide-react";
import { useAdminNavigation } from "../AdminNavigationContext";

export default function RegisterEmployee() {
  const { setActiveView } = useAdminNavigation();
  const [currentStep] = useState(3);
  const [showPassword, setShowPassword] = useState(false);
  const [enableSystemAccess, setEnableSystemAccess] = useState(true);

  // Form states
  const [email, setEmail] = useState("alex.morris@hrmate.com");
  const [userRole, setUserRole] = useState("Employee");
  const [password, setPassword] = useState("HRM_2024_P@ss");

  const generateRandomPassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let newPassword = "HRM_2024_";
    for (let i = 0; i < length - 9; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(newPassword);
  };

  const steps = [
    { id: 1, label: "Personal Info", completed: true },
    { id: 2, label: "Employment", completed: true },
    { id: 3, label: "System Access", completed: false },
  ];

  return (
    <div className="pt-20 p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#111827]">Register New Employee</h1>
      </div>

      {/* Progress Steps */}
      <div className="mb-12">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${step.completed
                      ? "bg-emerald-500 text-white"
                      : step.id === currentStep
                        ? "bg-amber-400 text-slate-900"
                        : "bg-slate-200 text-slate-400"
                    }`}
                >
                  {step.completed ? (
                    <CheckCircle2 size={24} />
                  ) : step.id === currentStep ? (
                    <span className="text-sm font-bold">0{step.id}</span>
                  ) : (
                    <Circle size={24} />
                  )}
                </div>
                <p
                  className={`mt-2 text-sm font-medium ${step.id === currentStep ? "text-[#111827]" : "text-slate-500"
                    }`}
                >
                  {step.label}
                </p>
              </div>

              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 -mt-10 transition-all ${step.completed ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* System Access Form */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#111827] mb-2">Configure System Access</h2>
          <p className="text-slate-500 text-sm">
            Set up the login credentials and permissions for the new employee.
          </p>
        </div>

        <div className="space-y-6">
          {/* Official Business Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[#111827] mb-2">
                Official Business Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-[#111827]"
                  placeholder="employee@hrmate.com"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                This will be used as the primary login username.
              </p>
            </div>

            {/* User Role */}
            <div>
              <label className="block text-sm font-semibold text-[#111827] mb-2">
                User Role
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield size={18} className="text-slate-400" />
                </div>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-[#111827] appearance-none cursor-pointer"
                >
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                  <option value="HR Admin">HR Admin</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Temporary Password */}
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-2">
              Temporary Password
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-[#111827]"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-amber-400 text-amber-600 rounded-lg font-medium hover:bg-amber-50 transition-colors whitespace-nowrap"
              >
                <Sparkles size={16} />
                Generate Random
              </button>
            </div>
          </div>

          {/* Enable System Access Toggle */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#111827]">Enable System Access</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Allow the employee to log in immediately after registration.
                </p>
              </div>
              <button
                onClick={() => setEnableSystemAccess(!enableSystemAccess)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${enableSystemAccess ? "bg-amber-400" : "bg-slate-300"
                  }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${enableSystemAccess ? "translate-x-6" : "translate-x-1"
                    }`}
                />
              </button>
            </div>
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <p className="text-sm text-blue-700">
              Employee will be prompted to change their password upon first login to ensure account
              security. An onboarding email with these credentials will be sent to the official address
              provided.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={() => setActiveView("employeeMaster")}
          className="flex items-center gap-2 px-6 py-2.5 text-slate-600 font-medium hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <button className="flex items-center gap-2 px-8 py-3 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold rounded-lg shadow-sm transition-all active:scale-95">
          Complete Registration
          <CheckCircle2 size={18} />
        </button>
      </div>
    </div>
  );
}
