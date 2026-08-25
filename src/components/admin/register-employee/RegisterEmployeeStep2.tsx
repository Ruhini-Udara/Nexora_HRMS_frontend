"use client";

import React, { useState, useEffect } from "react";
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
import { Briefcase, Hash, Info, Building2, UserCog, ChevronLeft, AlertCircle } from "lucide-react";
import type { EmployeeFormData } from "./RegisterEmployee";
import api from "@/lib/axiosInstance";

interface DesignationOption {
  designationId: number;
  designationName: string;
}

interface RegisterEmployeeStep2Props {
  formData: EmployeeFormData;
  updateFormData: (fields: Partial<EmployeeFormData>) => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export default function RegisterEmployeeStep2({
  formData,
  updateFormData,
  onNext,
  onPrevious,
}: RegisterEmployeeStep2Props) {
  const [designations, setDesignations] = useState<DesignationOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get("/api/designations")
      .then((res) => setDesignations(res.data))
      .catch((err) => console.error("Failed to fetch designations", err));
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
    if (error) setError(null);
  };

  const handleSelectChange = (name: string, value: string) => {
    updateFormData({ [name]: value });
    if (error) setError(null);
  };

  const handleNextStep = () => {
    if (!formData.designationId) {
      setError("Designation is required.");
      return;
    }
    if (!formData.employeeType) {
      setError("Employee Type is required.");
      return;
    }
    if (!formData.department) {
      setError("Department is required.");
      return;
    }

    const formatRegex = /^[a-zA-Z0-9/-]+$/;

    // Validate EPF number format if filled
    if (formData.epfNumber && formData.epfNumber.trim()) {
      if (!formatRegex.test(formData.epfNumber.trim())) {
        setError("Invalid EPF format. Must contain only alphanumeric characters, dashes, or slashes.");
        return;
      }
    }

    // Validate ETF number format if filled
    if (formData.etfNumber && formData.etfNumber.trim()) {
      if (!formatRegex.test(formData.etfNumber.trim())) {
        setError("Invalid ETF format. Must contain only alphanumeric characters, dashes, or slashes.");
        return;
      }
    }

    setError(null);
    if (onNext) {
      onNext();
    }
  };

  const handlePreviousStep = () => {
    if (onPrevious) {
      onPrevious();
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

            {/* Step 2 - Active */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-14 h-14 rounded-full bg-[#8B3A00] text-white flex items-center justify-center font-bold text-lg mb-3 shadow-md">
                02
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Employment</span>
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Employment Details</h2>
            <p className="text-gray-600 dark:text-slate-400 mt-1">
              Configure the official employment records and department assignment.
            </p>
          </div>

          <div className="space-y-8">
            {/* Designation and Employee Type */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="designation" className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Designation <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
                  <Select
                    value={formData.designationId?.toString() ?? ""}
                    onValueChange={(value) => {
                      updateFormData({ designationId: Number(value) });
                      if (error) setError(null);
                    }}
                  >
                    <SelectTrigger className="pl-11 h-12 bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white focus:border-amber-500 focus:ring-amber-500">
                      <SelectValue placeholder="Select Designation" />
                    </SelectTrigger>
                    <SelectContent>
                      {designations.map((d) => (
                        <SelectItem key={d.designationId} value={d.designationId.toString()}>
                          {d.designationName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeType" className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Employee Type <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <UserCog className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
                  <Select
                    value={formData.employeeType}
                    onValueChange={(value) => handleSelectChange("employeeType", value)}
                  >
                    <SelectTrigger className="pl-11 h-12 bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white focus:border-amber-500 focus:ring-amber-500">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-Time</SelectItem>
                      <SelectItem value="part-time">Part-Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="intern">Intern</SelectItem>
                      <SelectItem value="temporary">Temporary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                Department <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleSelectChange("department", value)}
                >
                  <SelectTrigger className="pl-11 h-12 bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white focus:border-amber-500 focus:ring-amber-500">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Human Resources">Human Resources</SelectItem>
                    <SelectItem value="Sales & Marketing">Sales & Marketing</SelectItem>
                    <SelectItem value="Product Development">Product Development</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* EPF Number and ETF Number */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="epfNumber" className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                  EPF Number
                </Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="epfNumber"
                    name="epfNumber"
                    placeholder="e.g. EPF-12345"
                    value={formData.epfNumber}
                    onChange={handleInputChange}
                    className="pl-11 h-12 bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="etfNumber" className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                  ETF Number
                </Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="etfNumber"
                    name="etfNumber"
                    placeholder="e.g. ETF-67890"
                    value={formData.etfNumber}
                    onChange={handleInputChange}
                    className="pl-11 h-12 bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Info Alert */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-lg">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                The EPF and ETF numbers can be updated later by HR Admin if they are not yet assigned.
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between gap-4 mt-8">
          <Button
            onClick={handlePreviousStep}
            variant="outline"
            className="font-semibold px-10 h-12 rounded-lg border-2 border-gray-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            Previous
          </Button>
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
