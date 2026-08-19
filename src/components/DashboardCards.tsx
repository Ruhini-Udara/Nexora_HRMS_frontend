import React from "react";
import { CheckCircle, Calendar, GraduationCap, Clock } from "lucide-react";

const DashboardCards = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
    {/* Attendance Status */}
    <div className="bg-white dark:bg-slate-900 border border-[#F1F5F9] dark:border-slate-800 shadow-sm rounded-2xl p-6 flex flex-col h-[178px] transition-colors">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#ECFDF5] dark:bg-green-950/20 text-[#059669] dark:text-green-400 rounded-lg p-2">
          <CheckCircle className="w-5 h-5" />
        </div>
        <span className="font-medium text-[#64748B] dark:text-slate-400 text-base">Attendance Status</span>
      </div>
      <div className="font-bold text-2xl text-[#0F172A] dark:text-white mb-1">Checked In</div>
      <div className="text-sm text-[#059669] dark:text-green-400 font-medium">at 9:00 AM</div>
    </div>
    {/* Leave Balance */}
    <div className="bg-white dark:bg-slate-900 border border-[#F1F5F9] dark:border-slate-800 shadow-sm rounded-2xl p-6 flex flex-col h-[178px] transition-colors">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#FFFBEB] dark:bg-amber-950/20 text-[#D97706] dark:text-amber-500 rounded-lg p-2">
          <Calendar className="w-5 h-5" />
        </div>
        <span className="font-medium text-[#64748B] dark:text-slate-400 text-base">Leave Balance</span>
      </div>
      <div className="font-bold text-2xl text-[#0F172A] dark:text-white mb-1">12 Days</div>
      <div className="text-sm text-[#94A3B8] dark:text-slate-500">Available</div>
    </div>
    {/* Training Progress */}
    <div className="bg-white dark:bg-slate-900 border border-[#F1F5F9] dark:border-slate-800 shadow-sm rounded-2xl p-6 flex flex-col h-[178px] transition-colors">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#EFF6FF] dark:bg-blue-950/20 text-[#2563EB] dark:text-blue-400 rounded-lg p-2">
          <GraduationCap className="w-5 h-5" />
        </div>
        <span className="font-medium text-[#64748B] dark:text-slate-400 text-base">Training Progress</span>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="font-bold text-xs text-[#2563EB] dark:text-blue-400 bg-[#EFF6FF] dark:bg-blue-950/30 rounded-full px-2 py-0.5">75%</span>
        <div className="w-24 h-2 bg-[#F1F5F9] dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-2 bg-[#2563EB] dark:bg-blue-500 rounded-full" style={{ width: '75%' }}></div>
        </div>
      </div>
    </div>
    {/* Pending Requests */}
    <div className="bg-white dark:bg-slate-900 border border-[#F1F5F9] dark:border-slate-800 shadow-sm rounded-2xl p-6 flex flex-col h-[178px] transition-colors">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#FAF5FF] dark:bg-purple-950/20 text-[#9333EA] dark:text-purple-400 rounded-lg p-2">
          <Clock className="w-5 h-5" />
        </div>
        <span className="font-medium text-[#64748B] dark:text-slate-400 text-base">Pending Requests</span>
      </div>
      <div className="font-bold text-2xl text-[#0F172A] dark:text-white mb-1">3 Active</div>
      <div className="text-sm text-[#94A3B8] dark:text-slate-500">Items</div>
    </div>
  </div>
);

export default DashboardCards;
