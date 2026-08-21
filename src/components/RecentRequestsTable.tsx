import React from "react";
import { Calendar, GraduationCap, ArrowLeftRight, Heart, MoreVertical } from "lucide-react";

const RecentRequestsTable = () => (
  <div className="bg-white dark:bg-slate-900 border border-[#F1F5F9] dark:border-slate-800 shadow-sm rounded-2xl p-8 transition-colors">
    <div className="flex justify-between items-center border-b border-[#F1F5F9] dark:border-slate-800 pb-6 mb-4">
      <h3 className="font-bold text-xl text-[#0F172A] dark:text-white">My Recent Requests</h3>
      <a href="#" className="text-[#8B4513] dark:text-amber-500 font-semibold text-base hover:underline">View All</a>
    </div>
    <table className="w-full text-left">
      <thead>
        <tr className="bg-[#F8FAFC] dark:bg-slate-900/50 text-[#64748B] dark:text-slate-400 text-xs font-bold uppercase tracking-wide border-b border-[#F1F5F9] dark:border-slate-800">
          <th className="py-3 px-6">Request Type</th>
          <th className="py-3 px-6">Date Submitted</th>
          <th className="py-3 px-6">Status</th>
          <th className="py-3 px-6 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="text-[#334155] dark:text-slate-300 text-sm">
        <tr className="border-t border-[#F1F5F9] dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
          <td className="py-4 px-6 flex items-center gap-2">
            <div className="bg-[#FFFBEB] dark:bg-amber-950/20 text-[#D97706] dark:text-amber-400 rounded p-1">
              <Calendar className="w-4 h-4" />
            </div>
            Annual Leave
          </td>
          <td className="py-4 px-6">Oct 12, 2023</td>
          <td className="py-4 px-6"><span className="bg-[#ECFDF5] dark:bg-green-950/20 text-[#047857] dark:text-green-400 px-3 py-1 rounded-full text-xs font-medium">Approved</span></td>
          <td className="py-4 px-6 text-right">
            <MoreVertical className="w-5 h-5 text-[#94A3B8] cursor-pointer inline-block" />
          </td>
        </tr>
        <tr className="border-t border-[#F1F5F9] dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
          <td className="py-4 px-6 flex items-center gap-2">
            <div className="bg-[#EFF6FF] dark:bg-blue-950/20 text-[#2563EB] dark:text-blue-400 rounded p-1">
              <GraduationCap className="w-4 h-4" />
            </div>
            UI/UX Training Course
          </td>
          <td className="py-4 px-6">Oct 10, 2023</td>
          <td className="py-4 px-6"><span className="bg-[#FFFBEB] dark:bg-amber-950/20 text-[#B45309] dark:text-amber-400 px-3 py-1 rounded-full text-xs font-medium">Pending</span></td>
          <td className="py-4 px-6 text-right">
            <MoreVertical className="w-5 h-5 text-[#94A3B8] cursor-pointer inline-block" />
          </td>
        </tr>
        <tr className="border-t border-[#F1F5F9] dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
          <td className="py-4 px-6 flex items-center gap-2">
            <div className="bg-[#FAF5FF] dark:bg-purple-950/20 text-[#9333EA] dark:text-purple-400 rounded p-1">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            Department Transfer
          </td>
          <td className="py-4 px-6">Oct 05, 2023</td>
          <td className="py-4 px-6"><span className="bg-[#FEF2F2] dark:bg-red-950/20 text-[#B91C1C] dark:text-red-400 px-3 py-1 rounded-full text-xs font-medium">Rejected</span></td>
          <td className="py-4 px-6 text-right">
            <MoreVertical className="w-5 h-5 text-[#94A3B8] cursor-pointer inline-block" />
          </td>
        </tr>
        <tr className="border-t border-[#F1F5F9] dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
          <td className="py-4 px-6 flex items-center gap-2">
            <div className="bg-[#ECFDF5] dark:bg-green-950/20 text-[#059669] dark:text-green-400 rounded p-1">
              <Heart className="w-4 h-4" />
            </div>
            Medical Reimbursement
          </td>
          <td className="py-4 px-6">Oct 01, 2023</td>
          <td className="py-4 px-6"><span className="bg-[#ECFDF5] dark:bg-green-950/20 text-[#047857] dark:text-green-400 px-3 py-1 rounded-full text-xs font-medium">Approved</span></td>
          <td className="py-4 px-6 text-right">
            <MoreVertical className="w-5 h-5 text-[#94A3B8] cursor-pointer inline-block" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

export default RecentRequestsTable;
