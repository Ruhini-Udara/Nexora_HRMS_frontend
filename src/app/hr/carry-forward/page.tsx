"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import axiosInstance from "@/lib/axiosInstance";

export default function CarryForwardDashboard() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/v1/carry-forward/batches");
      setBatches(res.data);
    } catch (err) {
      console.error("Failed to fetch batches", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-full text-xs font-bold uppercase">Draft</span>;
      case "BRANCH_VERIFIED":
        return <span className="px-2.5 py-1 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light rounded-full text-xs font-bold uppercase">Branch Verified</span>;
      case "HR_APPROVED":
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded-full text-xs font-bold uppercase">HR Approved</span>;
      case "FINANCE_SYNCED":
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 rounded-full text-xs font-bold uppercase">Finance Dispatched</span>;
      case "AUDITING":
        return <span className="px-2.5 py-1 bg-primary/10 text-primary dark:bg-primary/20 rounded-full text-xs font-bold uppercase">Auditing</span>;
      case "AUDITED":
        return <span className="px-2.5 py-1 bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100 rounded-full text-xs font-bold uppercase">Audited</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 rounded-full text-xs font-bold uppercase">{status}</span>;
    }
  };

  const filteredBatches = batches.filter((b) => {
    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
    const matchesSearch = b.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.submittedBy?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const draftCount = batches.filter(b => b.status === 'DRAFT').length;
  const verifiedCount = batches.filter(b => b.status === 'BRANCH_VERIFIED').length;
  const approvedCount = batches.filter(b => b.status === 'HR_APPROVED').length;
  const financeSyncedCount = batches.filter(b => b.status === 'FINANCE_SYNCED' || b.status === 'AUDITED' || b.status === 'AUDITING').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Carry Forward Leave Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage branch-wise employee carry forward balances, HR approval, finance dispatch, and post-payment audits.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/hr/carry-forward/new"
            className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-bold shadow-sm transition-all flex items-center gap-2 text-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            New Batch
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Draft Batches</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{draftCount}</p>
            <span className="text-[11px] text-slate-400">Awaiting branch verification</span>
          </div>
          <div className="w-11 h-11 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">pending_actions</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Branch Verified</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{verifiedCount}</p>
            <span className="text-[11px] text-primary font-medium">Ready for HO HR Approval</span>
          </div>
          <div className="w-11 h-11 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">verified</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">HR Approved</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{approvedCount}</p>
            <span className="text-[11px] text-slate-500 font-medium">Ready for Finance API sync</span>
          </div>
          <div className="w-11 h-11 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">task_alt</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Finance Dispatched</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{financeSyncedCount}</p>
            <span className="text-[11px] text-slate-500 font-medium">Disbursed / In-Audit</span>
          </div>
          <div className="w-11 h-11 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">payments</span>
          </div>
        </div>
      </div>

      {/* Filter and Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {["ALL", "DRAFT", "BRANCH_VERIFIED", "HR_APPROVED", "FINANCE_SYNCED", "AUDITING", "AUDITED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === status
                    ? "bg-primary text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {status === "ALL" ? "All Batches" : status.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">search</span>
            <input
              type="text"
              placeholder="Search batch ID or creator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white w-full sm:w-60 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Batch ID</th>
                <th className="p-4">Year</th>
                <th className="p-4">Submitted By</th>
                <th className="p-4 text-center">Employees</th>
                <th className="p-4 text-center">Carried Days</th>
                <th className="p-4 text-right">Est. Amount (LKR)</th>
                <th className="p-4">Created Date</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {filteredBatches.map((batch) => (
                <tr key={batch.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                    {batch.id}
                    {batch.financeReferenceId && (
                      <div className="text-[10px] text-slate-500 font-normal font-sans">{batch.financeReferenceId}</div>
                    )}
                  </td>
                  <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{batch.year}</td>
                  <td className="p-4">
                    <div className="font-medium text-slate-900 dark:text-white">{batch.submittedBy || "HR Admin"}</div>
                    {batch.approvedBy && (
                      <div className="text-[10px] text-primary font-medium">Approved by: {batch.approvedBy}</div>
                    )}
                  </td>
                  <td className="p-4 text-center font-bold text-slate-800 dark:text-slate-200">{batch.entriesCount || 0}</td>
                  <td className="p-4 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold">
                      {batch.totalCarriedDays || 0}
                    </span>
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {batch.totalCalculatedAmount ? `Rs. ${Number(batch.totalCalculatedAmount).toLocaleString()}` : "-"}
                  </td>
                  <td className="p-4 text-slate-500">
                    {batch.createdAt ? format(new Date(batch.createdAt), "MMM dd, yyyy") : "-"}
                  </td>
                  <td className="p-4 text-center">{getStatusBadge(batch.status)}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/hr/carry-forward/${batch.id}`}
                        className="text-primary hover:text-primary/80 font-bold transition-colors bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg"
                      >
                        Review
                      </Link>
                      {(batch.status === "FINANCE_SYNCED" || batch.status === "AUDITING" || batch.status === "AUDITED") && (
                        <Link
                          href={`/hr/carry-forward/audit?batchId=${batch.id}`}
                          className="text-slate-800 dark:text-slate-200 hover:text-primary font-bold transition-colors bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-3 py-1.5 rounded-lg"
                        >
                          Audit
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBatches.length === 0 && !loading && (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-slate-500">
                    <span className="material-symbols-outlined text-3xl text-slate-400 mb-2 block">folder_off</span>
                    No carry forward batches found matching the selected filter.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-slate-500">
                    <span className="material-symbols-outlined animate-spin text-2xl text-primary mb-2 block">sync</span>
                    Loading carry forward batches...
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
