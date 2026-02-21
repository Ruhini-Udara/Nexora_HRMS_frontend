"use client";

import React, { useState } from "react";
import CompanyFiles from "./CompanyFiles";
import EmployeeFiles from "./EmployeeFiles";

export default function DocumentManagement() {
  const [activeTab, setActiveTab] = useState<"company" | "employee">("company");

  return (
    <div className="pt-20 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
          <p className="text-gray-600 mt-2">
            Manage, organize, and track all company documentation and employee documentation.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <div className="flex gap-8 px-6">
              <button
                onClick={() => setActiveTab("company")}
                className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "company"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-600 hover:text-gray-800"
                }`}
              >
                Company Files
              </button>
              <button
                onClick={() => setActiveTab("employee")}
                className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "employee"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-600 hover:text-gray-800"
                }`}
              >
                Employee Files
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "company" ? (
              <CompanyFiles />
            ) : (
              <EmployeeFiles />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
