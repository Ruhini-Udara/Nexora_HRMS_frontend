"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";

// Mock Data grouped by location
const MOCK_DATA = {
  id: "CF-2026-004", // This matches the new batch we "created"
  year: 2026,
  status: "DRAFT", // DRAFT, VERIFIED, PENDING_APPROVAL, APPROVED, SYNCED
  locations: [
    {
      locationName: "Colombo HQ",
      entries: [
        { empId: "EMP-001", name: "John Doe", department: "Engineering", carriedForwardDays: 5, remarks: "Max limit" },
        { empId: "EMP-002", name: "Jane Smith", department: "HR", carriedForwardDays: 2, remarks: "" },
      ]
    },
    {
      locationName: "Kandy Branch",
      entries: [
        { empId: "EMP-005", name: "Mike Johnson", department: "Sales", carriedForwardDays: 7, remarks: "Needs review" },
        { empId: "EMP-006", name: "Sarah Connor", department: "Marketing", carriedForwardDays: 4, remarks: "" },
      ]
    }
  ]
};

export default function CarryForwardBatchDetails() {
  const params = useParams();
  const router = useRouter();
  
  const [batch, setBatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");

  React.useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axiosInstance.get(`/api/v1/carry-forward/batches/${params.id}`);
        setBatch(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) {
      fetchDetails();
    }
  }, [params.id]);

  const updateStatus = async (newStatus: string) => {
    setIsProcessing(true);
    try {
      await axiosInstance.put(`/api/v1/carry-forward/batches/${params.id}/status`, {
        status: newStatus,
        approvedBy: newStatus === "APPROVED" ? "HR Admin" : null
      });
      setBatch((prev: any) => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerify = () => updateStatus("VERIFIED");
  const handleSubmitApproval = () => updateStatus("PENDING_APPROVAL");
  const handleApprove = () => updateStatus("APPROVED");

  const handleSyncFinance = async () => {
    setSyncStatus("syncing");
    try {
      // For now we mock the finance API sync by just updating status
      await axiosInstance.put(`/api/v1/carry-forward/batches/${params.id}/status`, {
        status: "SYNCED"
      });
      setBatch((prev: any) => ({ ...prev, status: "SYNCED" }));
      setSyncStatus("success");
    } catch (err) {
      console.error(err);
      setSyncStatus("error");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading batch details...</div>;
  if (!batch) return <div className="p-10 text-center text-red-500">Batch not found</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/hr/carry-forward" className="w-10 h-10 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Batch: {params.id}</h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-slate-500 dark:text-slate-400 text-sm">Review location-wise carry forward data.</p>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 rounded text-[10px] font-bold uppercase">{batch.status}</span>
            </div>
          </div>
        </div>
        
        {/* Actions based on Status */}
        <div className="flex items-center gap-3">
          {batch.status === "DRAFT" && (
            <button 
              onClick={handleVerify}
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold shadow-sm transition-all text-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              Verify Data
            </button>
          )}
          
          {batch.status === "VERIFIED" && (
            <button 
              onClick={handleSubmitApproval}
              disabled={isProcessing}
              className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg font-semibold shadow-sm transition-all text-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              Submit for Approval
            </button>
          )}

          {batch.status === "PENDING_APPROVAL" && (
            <button 
              onClick={handleApprove}
              disabled={isProcessing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-semibold shadow-sm transition-all text-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">thumb_up</span>
              Approve List
            </button>
          )}

          {batch.status === "APPROVED" && (
            <button 
              onClick={handleSyncFinance}
              disabled={syncStatus === "syncing"}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg font-semibold shadow-sm transition-all text-sm flex items-center gap-2"
            >
              <span className={`material-symbols-outlined text-[18px] ${syncStatus === 'syncing' ? 'animate-spin' : ''}`}>sync</span>
              {syncStatus === 'syncing' ? 'Syncing...' : 'Sync to Finance Module'}
            </button>
          )}

          {batch.status === "SYNCED" && (
            <div className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm border border-green-200 dark:border-green-800/30">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Synced to Finance
            </div>
          )}
        </div>
      </div>

      {syncStatus === "success" && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/30 flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-emerald-500">task_alt</span>
            <div className="text-sm font-medium">Successfully synced carry forward balances to the Finance Module API.</div>
          </div>
          <button onClick={() => setSyncStatus("idle")} className="text-emerald-600 hover:text-emerald-800">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      )}

      {/* Location Groups */}
      <div className="space-y-8">
        {batch.locations.map((loc, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">location_on</span>
                {loc.locationName}
              </h2>
              <span className="text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full">
                {loc.entries.length} Employees
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Emp ID</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Department</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Carry Forward Days</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loc.entries.map((entry, eIdx) => (
                    <tr key={eIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="p-4 font-mono text-sm text-slate-600 dark:text-slate-400">{entry.empId}</td>
                      <td className="p-4 font-medium text-slate-900 dark:text-white text-sm">{entry.name}</td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{entry.department}</td>
                      <td className="p-4 text-center">
                        <span className="inline-block w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold leading-8 text-center text-sm">
                          {entry.carriedForwardDays}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-500 italic">
                        {entry.remarks || <span className="text-slate-300 dark:text-slate-600">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
