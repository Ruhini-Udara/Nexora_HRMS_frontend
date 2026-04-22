"use client";

import React, { useState } from "react";
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
import { Briefcase, Hash, Info, Building2, UserCog, ChevronLeft } from "lucide-react";

interface RegisterEmployeeStep2Props {
  onNext?: () => void;
  onPrevious?: () => void;
}

export default function RegisterEmployeeStep2({
  onNext,
  onPrevious,
}: RegisterEmployeeStep2Props) {
  const [formData, setFormData] = useState({
    designation: "",
    employeeType: "",
    department: "",
    epfNumber: "",
    etfNumber: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
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
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Register New Employee</h1>
          <p className="text-gray-600 mt-2">Complete all required fields to add a new employee to the system</p>
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
              <span className="text-sm font-semibold text-gray-900">Personal Info</span>
            </div>
            
            {/* Connector */}
            <div className="flex-1 h-0.5 bg-gray-300 mx-4 mb-8"></div>
            
            {/* Step 2 - Active */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-lg mb-3 shadow-md">
                02
              </div>
              <span className="text-sm font-semibold text-gray-900">Employment</span>
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
            <h2 className="text-2xl font-bold text-gray-900">Employment Details</h2>
            <p className="text-gray-600 mt-1">
              Configure the official employment records and department assignment.
            </p>
          </div>

          <div className="space-y-8">
            {/* Designation and Employee Type */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="designation" className="text-sm font-semibold text-gray-700">
                  Designation <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
                  <Select
                    value={formData.designation}
                    onValueChange={(value) => handleSelectChange("designation", value)}
                  >
                    <SelectTrigger className="pl-11 h-12 bg-gray-50 border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                      <SelectValue placeholder="Select Designation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Senior Engineer">Senior Engineer</SelectItem>
                      <SelectItem value="Engineer">Engineer</SelectItem>
                      <SelectItem value="HR Manager">HR Manager</SelectItem>
                      <SelectItem value="HR Executive">HR Executive</SelectItem>
                      <SelectItem value="Sales Executive">Sales Executive</SelectItem>
                      <SelectItem value="Product Manager">Product Manager</SelectItem>
                      <SelectItem value="Driver">Driver</SelectItem>
                      <SelectItem value="Support Staff">Support Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeType" className="text-sm font-semibold text-gray-700">
                  Employee Type <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <UserCog className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
                  <Select
                    value={formData.employeeType}
                    onValueChange={(value) => handleSelectChange("employeeType", value)}
                  >
                    <SelectTrigger className="pl-11 h-12 bg-gray-50 border-gray-300 focus:border-amber-500 focus:ring-amber-500">
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
              <Label htmlFor="department" className="text-sm font-semibold text-gray-700">
                Department <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleSelectChange("department", value)}
                >
                  <SelectTrigger className="pl-11 h-12 bg-gray-50 border-gray-300 focus:border-amber-500 focus:ring-amber-500">
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
                <Label htmlFor="epfNumber" className="text-sm font-semibold text-gray-700">
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
                    className="pl-11 h-12 bg-gray-50 border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="etfNumber" className="text-sm font-semibold text-gray-700">
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
                    className="pl-11 h-12 bg-gray-50 border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>





            {/* Info Alert */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-800 leading-relaxed">
                The EPF and ETF numbers can be updated later by HR Admin if they are not yet assigned.
              </p>
            </div>


          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-4 mt-8">
          <Button
            onClick={handlePreviousStep}
            variant="outline"
            className="font-semibold px-10 h-12 rounded-lg border-2 border-gray-300 hover:bg-gray-100 transition-all"
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            Previous
          </Button>
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
