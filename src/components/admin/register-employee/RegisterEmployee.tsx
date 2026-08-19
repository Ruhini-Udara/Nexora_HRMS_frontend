"use client";

import React, { useState } from "react";
import RegisterEmployeeStep1 from "./RegisterEmployeeStep1";
import RegisterEmployeeStep2 from "./RegisterEmployeeStep2";
import RegisterEmployeeStep3 from "./RegisterEmployeeStep3";

export interface EmployeeFormData {
  // Step 1: Personal Info
  nicNumber: string;
  sex: string;
  fullName: string;
  surname: string;
  dateOfBirth: string;
  dateJoined: string;
  email: string;
  homeAddress: string;
  maritalStatus: string;
  // Step 2: Employment Info
  designationId: number | null;
  employeeType: string;
  department: string;
  epfNumber: string;
  etfNumber: string;
  // Step 3: System Access
  accountEmail: string;
  password: string;
  roleName: string;
  enableSystemAccess: boolean;
}

export default function RegisterEmployee() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<EmployeeFormData>({
    nicNumber: "",
    sex: "",
    fullName: "",
    surname: "",
    dateOfBirth: "",
    dateJoined: "",
    email: "",
    homeAddress: "",
    maritalStatus: "Single",
    designationId: null,
    employeeType: "",
    department: "",
    epfNumber: "",
    etfNumber: "",
    accountEmail: "",
    password: "",
    roleName: "Employee",
    enableSystemAccess: true,
  });

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (fields: Partial<EmployeeFormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  return (
    <>
      {currentStep === 1 && (
        <RegisterEmployeeStep1
          formData={formData}
          updateFormData={updateFormData}
          onNext={handleNextStep}
        />
      )}
      {currentStep === 2 && (
        <RegisterEmployeeStep2
          formData={formData}
          updateFormData={updateFormData}
          onNext={handleNextStep}
          onPrevious={handlePreviousStep}
        />
      )}
      {currentStep === 3 && (
        <RegisterEmployeeStep3
          formData={formData}
          updateFormData={updateFormData}
          onPrevious={handlePreviousStep}
        />
      )}
    </>
  );
}
