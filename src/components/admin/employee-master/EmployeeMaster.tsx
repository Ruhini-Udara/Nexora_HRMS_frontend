import React, { useState } from "react";
import EmployeeMasterHeader from "./EmployeeMasterHeader";
import EmployeeFilters from "./EmployeeFilters";
import EmployeeTable from "./EmployeeTable";

export default function EmployeeMaster() {
  const [department, setDepartment] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [status, setStatus] = useState("");

  const handleReset = () => {
    setDepartment("");
    setJobTitle("");
    setStatus("");
  };

  return (
    <div className="pt-20 p-8">
      <EmployeeMasterHeader />
      <EmployeeFilters
        department={department}
        setDepartment={setDepartment}
        jobTitle={jobTitle}
        setJobTitle={setJobTitle}
        status={status}
        setStatus={setStatus}
        onReset={handleReset}
      />
      <EmployeeTable
        department={department}
        jobTitle={jobTitle}
        status={status}
      />
    </div>
  );
}
