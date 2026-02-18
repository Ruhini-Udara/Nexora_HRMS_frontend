import React from "react";
import EmployeeMasterHeader from "./EmployeeMasterHeader";
import EmployeeFilters from "./EmployeeFilters";
import EmployeeTable from "./EmployeeTable";

export default function EmployeeMaster() {
  return (
    <div className="pt-20 p-8">
      <EmployeeMasterHeader />
      <EmployeeFilters />
      <EmployeeTable />
    </div>
  );
}
