"use client";

import React, { useState } from "react";
import RegisterEmployeeStep1 from "./RegisterEmployeeStep1";
import RegisterEmployeeStep2 from "./RegisterEmployeeStep2";
import RegisterEmployeeStep3 from "./RegisterEmployeeStep3";

export default function RegisterEmployee() {
  const [currentStep, setCurrentStep] = useState(1);

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

  return (
    <>
      {currentStep === 1 && <RegisterEmployeeStep1 onNext={handleNextStep} />}
      {currentStep === 2 && (
        <RegisterEmployeeStep2
          onNext={handleNextStep}
          onPrevious={handlePreviousStep}
        />
      )}
      {currentStep === 3 && <RegisterEmployeeStep3 onPrevious={handlePreviousStep} />}
    </>
  );
}
