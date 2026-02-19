"use client";

import React from "react";
import HRStats from "@/components/hr/dashboard/HRStats";
import HRModules from "@/components/hr/dashboard/HRModules";

export default function HRDashboard() {
    return (
        <div className="p-8 max-w-7xl mx-auto w-full">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">HR User Dashboard</h2>
                <p className="text-gray-600 dark:text-gray-400">Manage daily HR operations and staff activities.</p>
            </div>

            <HRStats />

            <HRModules />
        </div>
    );
}
