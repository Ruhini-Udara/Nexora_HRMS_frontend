"use client";

import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axiosInstance";

interface CancelAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: any | null;
  employeeId: number;
}

export const CancelAttendanceModal: React.FC<CancelAttendanceModalProps> = ({ isOpen, onClose, record, employeeId }) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/api/attendance/manual/employee/cancel/${record.id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeAttendance', employeeId] });
      onClose();
    },
    onError: (error: any) => {
      console.error("Failed to cancel request:", error);
      alert(error?.response?.data || "An error occurred");
    }
  });

  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
        <div className="p-6 text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500 mb-4">
            <span className="material-symbols-outlined text-2xl">warning</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Cancel Manual Attendance?</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Are you sure you want to cancel this manual attendance request for {record.attendanceDate}?
          </p>
        </div>
        
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            No
          </button>
          <button 
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {mutation.isPending ? "Cancelling..." : "Yes, Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
};
