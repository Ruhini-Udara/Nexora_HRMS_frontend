"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type ActiveView =
  | "dashboard"
  | "employeeMaster"
  | "registerEmployee"
  | "officeCalendar"
  | "shifts"
  | "documents"
  | "reports"
  | "employees"
  | "training"
  | "leaveManagement";

interface AdminNavigationContextType {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

const AdminNavigationContext = createContext<AdminNavigationContextType | undefined>(
  undefined
);

export function AdminNavigationProvider({ children }: { children: ReactNode }) {
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");

  return (
    <AdminNavigationContext.Provider value={{ activeView, setActiveView }}>
      {children}
    </AdminNavigationContext.Provider>
  );
}

export function useAdminNavigation() {
  const context = useContext(AdminNavigationContext);
  if (context === undefined) {
    throw new Error(
      "useAdminNavigation must be used within an AdminNavigationProvider"
    );
  }
  return context;
}
