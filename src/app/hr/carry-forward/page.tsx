"use client";

import React, { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";

// Mock Data
const MOCK_BATCHES = [
  {
    id: "CF-2026-001",
    year: 2026,
    status: "APPROVED",
    submittedBy: "HR Admin",
    approvedBy: "Director John",
    entriesCount: 150,
    createdAt: "2025-12-28T10:00:00Z"
  },
  {
    id: "CF-2026-002",
    year: 2026,
    status: "PENDING",
    submittedBy: "HR Manager",
    approvedBy: null,
    entriesCount: 45,
    createdAt: "2026-01-05T14:30:00Z"
  },
  {
    id: "CF-2026-003",
    year: 2026,
    status: "VERIFIED",
    submittedBy: "HR Assistant",
    approvedBy: null,
    entriesCount: 80,
    createdAt: "2026-01-10T09:15:00Z"
  }
];

import axiosInstance from "@/lib/axiosInstance";

export default function CarryForwardDashboard() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await axiosInstance.get("/api/v1/carry-forward/batches");
        setBatches(res.data);
      } catch (err) {
        console.error("Failed to fetch batches", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-semibold">Approved</span>;
      case "VERIFIED":
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-semibold">Verified</span>;
      case "PENDING":
        return <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-xs font-semibold">Pending Approval</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Carry Forward Leave</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage and audit employee carry forward leave balances.</p>
        </div>
        <Link 
          href="/hr/carry-forward/new" 
          className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm transition-all flex items-center gap-2 text-sm"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New Batch
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Batch ID</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Year</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Submitted By</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Entries</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {batches.map((batch) => (
                <tr key={batch.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">{batch.id}</div>
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-medium">{batch.year}</td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{batch.submittedBy}</div>
                    {batch.approvedBy && (
                      <div className="text-xs text-slate-500">Approved by: {batch.approvedBy}</div>
                    )}
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-medium">{batch.entriesCount}</td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{format(new Date(batch.createdAt), "MMM dd, yyyy")}</td>
                  <td className="p-4">{getStatusBadge(batch.status)}</td>
                  <td className="p-4 text-right">
                    <Link 
                      href={`/hr/carry-forward/${batch.id}`} 
                      className="text-primary hover:text-primary/80 font-semibold text-sm transition-colors"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
              {batches.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No carry forward batches found. Create a new batch to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
