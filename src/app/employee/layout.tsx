import React from "react";
import EmployeeTopbar from "@/components/EmployeeTopbar";
import EmployeeSidebar from "@/components/EmployeeSidebar";


const EmployeeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      {/* Sidebar */}
      {/* Sidebar */}
      <EmployeeSidebar />
      <div className="flex-1 ml-[260px] flex flex-col min-h-screen">
        <EmployeeTopbar />
        <main className="p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;
