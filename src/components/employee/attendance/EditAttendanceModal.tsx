"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axiosInstance";

const editSchema = z.object({
  attendanceDate: z.string().min(1, "Date is required"),
  inTime: z.string().min(1, "In Time is required"),
  outDate: z.string().min(1, "Out Date is required"),
  outTime: z.string().min(1, "Out Time is required"),
  reason: z.string().optional(),
}).superRefine((data, ctx) => {
  // Use string comparison for YYYY-MM-DD format to avoid timezone issues
  // Get today's date in local time as YYYY-MM-DD
  const todayDate = new Date();
  const offset = todayDate.getTimezoneOffset();
  const todayStr = new Date(todayDate.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];

  // In Date <= Today
  if (data.attendanceDate > todayStr) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "In Date cannot be in the future",
      path: ["attendanceDate"],
    });
  }

  // Out Date <= Today
  if (data.outDate > todayStr) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Out Date cannot be in the future",
      path: ["outDate"],
    });
  }

  // In Date <= Out Date
  if (data.attendanceDate > data.outDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Out Date cannot be before In Date",
      path: ["outDate"],
    });
  }

  // If same day, In Time < Out Time
  if (data.attendanceDate === data.outDate) {
    // Basic format check HH:mm to safely compare strings
    if (data.inTime && data.outTime && data.inTime >= data.outTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Out Time must be strictly after In Time",
        path: ["outTime"],
      });
    }
  }
});

type EditFormValues = z.infer<typeof editSchema>;

interface EditAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: any | null;
  employeeId: number;
}

export const EditAttendanceModal: React.FC<EditAttendanceModalProps> = ({ isOpen, onClose, record, employeeId }) => {
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
  });

  useEffect(() => {
    if (record) {
      const defaultDate = new Date().toISOString().split('T')[0];
      reset({
        attendanceDate: record.attendanceDate || defaultDate,
        inTime: record.inTime || "",
        outDate: record.outDate || record.attendanceDate || defaultDate, // Defaulting to same day
        outTime: record.outTime || "",
        reason: record.remarks || "",
      });
    }
  }, [record, reset]);

  const mutation = useMutation({
    mutationFn: async (data: EditFormValues) => {
      // Create request payload matching EmployeeAttendanceRequestDto
      const payload = {
        attendanceDate: data.attendanceDate, // using the original record date or the submitted one
        inTime: data.inTime,
        outTime: data.outTime,
        reason: data.reason
      };

      const response = await api.post(`/api/attendance/manual/employee/${employeeId}/request`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeAttendance', employeeId] });
      onClose();
    },
    onError: (error: any) => {
      console.error("Failed to submit request:", error);
      alert(error?.response?.data || "An error occurred");
    }
  });

  if (!isOpen || !record) return null;

  const todayDate = new Date();
  const offset = todayDate.getTimezoneOffset();
  const maxDateStr = new Date(todayDate.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <h2 className="font-bold text-slate-800 dark:text-white">Edit Attendance</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="p-6 flex-1 overflow-y-auto space-y-4">

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">In Date</label>
            <input
              type="date"
              max={maxDateStr}
              {...register("attendanceDate")}
              disabled={!record?.isNew}
              className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 p-2.5 outline-none focus:ring-primary focus:border-primary ${!record?.isNew ? 'cursor-not-allowed opacity-75' : ''} ${errors.attendanceDate ? 'border-red-500' : ''}`}
            />
            {errors.attendanceDate && <p className="text-red-500 text-xs mt-1">{errors.attendanceDate.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">In Time</label>
            <input
              type="time"
              {...register("inTime")}
              className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none ${errors.inTime ? 'border-red-500' : ''}`}
            />
            {errors.inTime && <p className="text-red-500 text-xs mt-1">{errors.inTime.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Out Date</label>
            <input
              type="date"
              max={maxDateStr}
              {...register("outDate")}
              className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none ${errors.outDate ? 'border-red-500' : ''}`}
            />
            {errors.outDate && <p className="text-red-500 text-xs mt-1">{errors.outDate.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Out Time</label>
            <input
              type="time"
              {...register("outTime")}
              className={`w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none ${errors.outTime ? 'border-red-500' : ''}`}
            />
            {errors.outTime && <p className="text-red-500 text-xs mt-1">{errors.outTime.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Reason</label>
            <textarea
              {...register("reason")}
              rows={3}
              placeholder="Brief reason for edit..."
              className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300 p-2.5 outline-none"
            />
          </div>

          <div className="flex gap-3 pt-4 mt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {mutation.isPending ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
