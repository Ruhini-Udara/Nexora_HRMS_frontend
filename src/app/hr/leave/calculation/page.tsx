"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Calculator,
    UploadCloud,
    CheckCircle2,
    Printer,
    FileSpreadsheet,
    AlertCircle,
    ChevronRight,
    X,
    FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/useAuthStore";

interface LeaveBalance {
    id: number;
    employee: {
        id: number;
        fullName: string;
        employeeCode: string;
        branch: string;
    };
    year: number;
    annualLeaveQuota: number;
    casualLeaveQuota: number;
    medicalLeaveQuota: number;
    status: string;
}

interface DistrictInfo {
    name: string;
    pending: number;
    finalized: boolean;
}

export default function LeaveCalculationPage() {
    const { user } = useAuthStore();
    const [isCalculating, setIsCalculating] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [printingDistrict, setPrintingDistrict] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [balances, setBalances] = useState<LeaveBalance[]>([]);
    const [districts, setDistricts] = useState<DistrictInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const currentYear = new Date().getFullYear();

    const fetchBalances = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await api.get<LeaveBalance[]>(`/api/leave-calculation/balances?year=${currentYear}`);
            const data = response.data;
            setBalances(data);

            // Group by branch (district)
            const groups: { [key: string]: { pending: number; total: number } } = {};
            data.forEach((lb) => {
                const branch = lb.employee?.branch || "Head Office";
                if (!groups[branch]) {
                    groups[branch] = { pending: 0, total: 0 };
                }
                groups[branch].total += 1;
                if (lb.status === "CALCULATED") {
                    groups[branch].pending += 1;
                }
            });

            const districtList: DistrictInfo[] = Object.keys(groups).map((name) => ({
                name,
                pending: groups[name].pending,
                finalized: groups[name].pending === 0,
            }));

            setDistricts(districtList);
        } catch (err: any) {
            console.error("Error fetching balances", err);
            setError("Failed to fetch leave balances from server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBalances();
    }, []);

    const handleCalculate = async () => {
        setIsCalculating(true);
        try {
            await api.post(`/api/leave-calculation/calculate?year=${currentYear}`);
            await fetchBalances();
        } catch (err: any) {
            console.error("Error during calculation", err);
            alert("Leave calculation failed. Please try again.");
        } finally {
            setIsCalculating(false);
        }
    };

    const handleFinalize = async (districtName: string) => {
        if (!user) {
            alert("User not logged in");
            return;
        }
        setIsFinalizing(districtName);
        try {
            await api.post(
                `/api/leave-calculation/finalize?year=${currentYear}&branch=${encodeURIComponent(
                    districtName
                )}&finalizedById=${user.id}`
            );
            await fetchBalances();
        } catch (err: any) {
            console.error("Error finalising", err);
            alert("Failed to finalize leaves");
        } finally {
            setIsFinalizing(null);
        }
    };

    // ── Excel Upload ────────────────────────────────────────────────────────────
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadedFile(file);
        e.target.value = "";
    };

    const handleRemoveFile = () => setUploadedFile(null);

    // ── Print ──────────────────────────────────────────────────────────────────
    const handlePrint = (districtName: string) => {
        setPrintingDistrict(districtName);
        const branchBalances = balances.filter(
            (b) => (b.employee?.branch || "Head Office") === districtName
        );

        const printWindow = window.open("", "_blank", "width=800,height=600");
        if (!printWindow) return;

        let rows = "";
        branchBalances.forEach((b) => {
            rows += `
                <tr>
                    <td>${b.employee?.employeeCode || "N/A"}</td>
                    <td>${b.employee?.fullName || "N/A"}</td>
                    <td>${b.annualLeaveQuota}</td>
                    <td>${b.casualLeaveQuota}</td>
                    <td>${b.medicalLeaveQuota}</td>
                    <td><span class="badge ${b.status === "FINALIZED" ? "green" : "amber"}">${b.status}</span></td>
                </tr>
            `;
        });

        printWindow.document.write(`
            <html>
            <head>
                <title>Leave Report – ${districtName}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
                    h1 { font-size: 20px; font-weight: bold; margin-bottom: 4px; }
                    p { font-size: 13px; color: #555; margin-bottom: 24px; }
                    table { width: 100%; border-collapse: collapse; font-size: 13px; }
                    th { background: #f3f4f6; text-align: left; padding: 10px 14px; border: 1px solid #e5e7eb; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
                    td { padding: 10px 14px; border: 1px solid #e5e7eb; }
                    .badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
                    .green { background: #d1fae5; color: #065f46; }
                    .amber { background: #fef3c7; color: #92400e; }
                    @media print { body { padding: 16px; } }
                </style>
            </head>
            <body>
                <h1>Branch Leave Report – ${districtName}</h1>
                <p>Generated on: ${new Date().toLocaleString()} &nbsp;|&nbsp; Year: ${currentYear}</p>
                <table>
                    <thead>
                        <tr>
                            <th>Emp Code</th>
                            <th>Full Name</th>
                            <th>Annual Quota</th>
                            <th>Casual Quota</th>
                            <th>Medical Quota</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows || '<tr><td colspan="6" style="text-align:center">No records found</td></tr>'}
                    </tbody>
                </table>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
            setPrintingDistrict(null);
        }, 400);
    };

    const finalizedCount = districts.filter((d) => d.finalized).length;
    const pendingCount = districts.filter((d) => !d.finalized).length;

    return (
        <div className="p-8 max-w-7xl mx-auto w-full space-y-4">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileChange}
            />

            {/* ── Page Header ── */}
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Leave Calculation &amp; Finalization
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                        Calculate yearly leave quotas and finalize district-wise balances.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-center px-3 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-sm">
                        <p className="text-base font-bold text-emerald-600">{finalizedCount}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide">Finalized</p>
                    </div>
                    <div className="text-center px-3 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-sm">
                        <p className="text-base font-bold text-amber-600">{pendingCount}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide">Pending</p>
                    </div>
                </div>
            </div>

            {/* ── Action Cards ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

                {/* Auto Calculation Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:border-primary/40 transition-colors flex items-center gap-4 px-4 py-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                        <Calculator className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                            Auto-Calculate Yearly Quotas
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                            Calculate 35 / 21 / prorated leave days for all employees based on join date (Pre/Post July 2011).
                        </p>
                    </div>
                    <Button
                        onClick={handleCalculate}
                        disabled={isCalculating}
                        className="shrink-0 text-xs h-8 px-3 whitespace-nowrap"
                    >
                        {isCalculating ? (
                            <span className="animate-pulse flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
                                Running...
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5">
                                <Calculator className="w-3.5 h-3.5" />
                                Run Now
                            </span>
                        )}
                    </Button>
                </div>

                {/* Excel Upload Card */}
                <div
                    onClick={handleUploadClick}
                    className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:border-emerald-500/50 transition-colors flex items-center gap-4 px-4 py-3 cursor-pointer group"
                >
                    <div className="w-9 h-9 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
                        <FileSpreadsheet className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                            Manual Data Upload
                        </p>
                        {uploadedFile ? (
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium truncate">
                                    {uploadedFile.name}
                                </span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}
                                    className="ml-1 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ) : (
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                                Upload previous leave balances via .xlsx / .xls / .csv file.
                            </p>
                        )}
                    </div>
                    <div className="shrink-0 flex items-center gap-1.5 border border-dashed border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 bg-gray-50 dark:bg-zinc-800 group-hover:border-emerald-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/10 transition-colors">
                        <UploadCloud className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-600" />
                        <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                            Upload .xlsx
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Finalization Table ── */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden w-full">

                {/* Table Header */}
                <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800 flex flex-wrap gap-2 justify-between items-center">
                    <div>
                        <h2 className="text-sm font-bold text-gray-900 dark:text-white">District-Wise Finalization</h2>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">Review and finalize leave balances per district for the year.</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-700/40 text-[11px] font-bold whitespace-nowrap">
                        <AlertCircle className="w-3.5 h-3.5" />
                        High Authority Required
                    </div>
                </div>

                {/* Table */}
                <div className="w-full overflow-x-auto">
                    {loading ? (
                        <div className="px-6 py-12 text-center text-gray-500">Loading leave balances...</div>
                    ) : error ? (
                        <div className="px-6 py-12 text-center text-red-500">{error}</div>
                    ) : districts.length === 0 ? (
                        <div className="px-6 py-12 text-center text-gray-500">
                            No leave balance data available. Click "Run Now" to auto-calculate leave quotas.
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-zinc-800/60 border-b border-gray-200 dark:border-zinc-800">
                                <tr>
                                    <th className="px-4 py-2.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[35%]">
                                        District
                                    </th>
                                    <th className="px-3 py-2.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[20%]">
                                        Pending
                                    </th>
                                    <th className="px-3 py-2.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[20%]">
                                        Status
                                    </th>
                                    <th className="px-3 py-2.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right w-[25%]">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {districts.map((district) => (
                                    <tr
                                        key={district.name}
                                        className="hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors"
                                    >
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-1.5">
                                                <ChevronRight className="w-3 h-3 text-gray-300 dark:text-zinc-600 shrink-0" />
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {district.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5 text-sm text-gray-600 dark:text-gray-400">
                                            {district.finalized ? "0" : district.pending} emp
                                        </td>
                                        <td className="px-3 py-2.5">
                                            {district.finalized ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Finalized
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400">
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handlePrint(district.name)}
                                                    disabled={printingDistrict === district.name}
                                                    className="p-1.5 rounded-md text-gray-400 hover:text-primary hover:bg-primary/5 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40"
                                                    title={`Print ${district.name} Report`}
                                                >
                                                    <Printer className="w-3.5 h-3.5" />
                                                </button>
                                                {!district.finalized && (
                                                    <Button
                                                        onClick={() => handleFinalize(district.name)}
                                                        disabled={isFinalizing === district.name}
                                                        className="text-[11px] h-7 px-3 font-bold"
                                                    >
                                                        {isFinalizing === district.name ? "Saving..." : "Finalize"}
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Table Footer */}
                <div className="px-4 py-2 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900">
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        {districts.length} districts &mdash; <span className="text-emerald-600 font-semibold">{finalizedCount} finalized</span>,{" "}
                        <span className="text-amber-600 font-semibold">{pendingCount} pending</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
