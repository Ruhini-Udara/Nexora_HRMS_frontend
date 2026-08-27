"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/useAuthStore";
import { EditAttendanceModal } from "@/components/employee/attendance/EditAttendanceModal";
import { CancelAttendanceModal } from "@/components/employee/attendance/CancelAttendanceModal";
import Link from "next/link";

export default function MyAttendancePage() {
  const { user } = useAuthStore();
  const [selectedRecordForEdit, setSelectedRecordForEdit] = useState<any | null>(null);
  const [selectedRecordForCancel, setSelectedRecordForCancel] = useState<any | null>(null);

  const { data: attendanceData = [], isLoading } = useQuery({
    queryKey: ['employeeAttendance', user?.id],
    queryFn: async () => {
      const res = await api.get(`/api/attendance/manual/employee/${user?.id}`);
      return res.data;
    },
    enabled: !!user?.id
  });

  const getStatusBadge = (status: string, approvalStatus: string) => {
    if (approvalStatus === 'PENDING') {
      return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Pending Approval</span>;
    }
    if (approvalStatus === 'CANCELLED') {
      return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">Cancelled</span>;
    }
    
    switch (status?.toLowerCase()) {
      case 'present':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Present</span>;
      case 'working':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Working</span>;
      case 'absent':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Absent</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">{status || "Unknown"}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/employee" className="w-10 h-10 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Attendance</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">View and manage your attendance records</p>
        </div>
        <div className="ml-auto">
          <button 
            onClick={() => setSelectedRecordForEdit({ isNew: true })}
            className="flex items-center gap-2 bg-[#9e3f00] hover:bg-[#7a3100] text-white px-4 py-2 rounded-xl font-bold text-[13px] shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            New Manual Request
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Date</th>
                <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">In Date</th>
                <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">In Time</th>
                <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Out Date</th>
                <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Out Time</th>
                <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Status</th>
                <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">Loading attendance...</td>
                </tr>
              ) : attendanceData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">No attendance records found.</td>
                </tr>
              ) : (
                attendanceData.map((record: any, index: number) => {
                  const displayDate = new Date(record.attendanceDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                  const inDateStr = record.inTime ? new Date(record.attendanceDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—';
                  const inTimeStr = record.inTime ? record.inTime.substring(0, 5) : '—';
                  const outDateStr = record.outTime ? new Date(record.attendanceDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—';
                  const outTimeStr = record.outTime ? record.outTime.substring(0, 5) : '—';
                  
                  const isPending = record.approvalStatus === 'PENDING';
                  const isApproved = record.approvalStatus === 'APPROVED';
                  const isCancelled = record.approvalStatus === 'CANCELLED';
                  
                  // Logic for edit button availability
                  // User indicated in matrix: Present (Yes), Working (Yes), Absent (Yes)
                  // Edit is false for Pending and Cancelled
                  const canEdit = !isPending && !isCancelled;

                  return (
                    <tr key={record.id || index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="p-4 text-sm font-medium text-slate-900 dark:text-white">
                        {displayDate}
                      </td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{inDateStr}</td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{inTimeStr}</td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{outDateStr}</td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{outTimeStr}</td>
                      <td className="p-4">
                        {getStatusBadge(record.status, record.approvalStatus)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          {canEdit && (
                            <button 
                              onClick={() => setSelectedRecordForEdit(record)}
                              className="text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Edit
                            </button>
                          )}
                          {isPending && (
                            <button 
                              onClick={() => setSelectedRecordForCancel(record)}
                              className="text-xs font-semibold text-red-600 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EditAttendanceModal 
        isOpen={!!selectedRecordForEdit} 
        onClose={() => setSelectedRecordForEdit(null)} 
        record={selectedRecordForEdit} 
        employeeId={user?.id || 0}
      />

      <CancelAttendanceModal 
        isOpen={!!selectedRecordForCancel} 
        onClose={() => setSelectedRecordForCancel(null)} 
        record={selectedRecordForCancel} 
        employeeId={user?.id || 0}
      />
    </div>
  );
}
