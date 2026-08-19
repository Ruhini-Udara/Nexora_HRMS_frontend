"use client";

import React, { useState } from "react";
import { 
    Calculator, 
    UploadCloud, 
    CheckCircle2, 
    Printer,
    FileSpreadsheet,
    AlertCircle
} from "lucide-react";

export default function LeaveCalculationPage() {
    const [isCalculating, setIsCalculating] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);

    // Mock data for the UI
    const mockDistricts = [
        { name: "Colombo District", pending: 45, finalized: false },
        { name: "Kandy District", pending: 12, finalized: true },
        { name: "Galle District", pending: 28, finalized: false }
    ];

    const handleCalculate = () => {
        setIsCalculating(true);
        setTimeout(() => setIsCalculating(false), 2000);
    };

    const handleFinalize = (district: string) => {
        setIsFinalizing(true);
        setTimeout(() => setIsFinalizing(false), 1500);
        alert(`Leaves finalized for ${district}`);
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Leave Calculation & Finalization</h1>
                <p className="text-gray-500 mt-1 text-sm">
                    Calculate yearly leave quotas based on join dates and finalize district-wise balances.
                </p>
            </div>

            {/* Top Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Auto Calculation Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                            <Calculator className="w-6 h-6" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Auto-Calculate Yearly Quotas</h2>
                        <p className="text-gray-500 text-sm mt-2">
                            Run the system engine to calculate the 35, 21, or prorated leave days for all employees based on their joining date (Pre/Post 2011).
                        </p>
                    </div>
                    <button 
                        onClick={handleCalculate}
                        disabled={isCalculating}
                        className="mt-6 w-full bg-[#1e40af] hover:bg-[#1e3a8a] text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {isCalculating ? (
                            <span className="animate-pulse">Calculating...</span>
                        ) : (
                            <>
                                <Calculator className="w-4 h-4" />
                                Run Calculation Now
                            </>
                        )}
                    </button>
                </div>

                {/* Excel Upload Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600 mb-4">
                            <FileSpreadsheet className="w-6 h-6" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Manual Data Upload</h2>
                        <p className="text-gray-500 text-sm mt-2">
                            Missing historical data? Upload previous leave balances via an Excel spreadsheet to update the system.
                        </p>
                    </div>
                    
                    <div className="mt-6 border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                        <UploadCloud className="w-6 h-6 text-gray-400 group-hover:text-gray-600 mb-2" />
                        <span className="text-sm font-medium text-gray-600">Click to upload .xlsx file</span>
                    </div>
                </div>
            </div>

            {/* Finalization Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">District-Wise Finalization</h2>
                        <p className="text-gray-500 text-sm">Review calculated balances and finalize them for the year.</p>
                    </div>
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-200 text-sm font-medium">
                        <AlertCircle className="w-4 h-4" />
                        High Authority Verification Required
                    </div>
                </div>

                <div className="p-0">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                            <tr>
                                <th className="px-6 py-4 font-medium">District Name</th>
                                <th className="px-6 py-4 font-medium">Pending Records</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {mockDistricts.map((district) => (
                                <tr key={district.name} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {district.name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {district.finalized ? '0' : district.pending} employees
                                    </td>
                                    <td className="px-6 py-4">
                                        {district.finalized ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Finalized
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                Pending Review
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 flex justify-end gap-3">
                                        <button className="text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100 transition-colors" title="Print Branch Report">
                                            <Printer className="w-4 h-4" />
                                        </button>
                                        {!district.finalized && (
                                            <button 
                                                onClick={() => handleFinalize(district.name)}
                                                className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
                                            >
                                                Finalize
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
