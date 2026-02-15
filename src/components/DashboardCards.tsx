import React from "react";
import { CheckCircle, Calendar, GraduationCap, Clock } from "lucide-react";

const DashboardCards = () => (
  <div className="grid grid-cols-4 gap-6 mb-10">
    {/* Attendance Status */}
    <div className="bg-white border border-[#F1F5F9] shadow-sm rounded-2xl p-6 flex flex-col h-[178px]">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#ECFDF5] text-[#059669] rounded-lg p-2">
          <CheckCircle className="w-5 h-5" />
        </div>
        <span className="font-medium text-[#64748B] text-base">Attendance Status</span>
      </div>
      <div className="font-bold text-2xl text-[#0F172A] mb-1">Checked In</div>
      <div className="text-sm text-[#059669]">at 9:00 AM</div>
    </div>
    {/* Leave Balance */}
    <div className="bg-white border border-[#F1F5F9] shadow-sm rounded-2xl p-6 flex flex-col h-[178px]">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#FFFBEB] text-[#D97706] rounded-lg p-2">
          <Calendar className="w-5 h-5" />
        </div>
        <span className="font-medium text-[#64748B] text-base">Leave Balance</span>
      </div>
      <div className="font-bold text-2xl text-[#0F172A] mb-1">12 Days</div>
      <div className="text-sm text-[#94A3B8]">Available</div>
    </div>
    {/* Training Progress */}
    <div className="bg-white border border-[#F1F5F9] shadow-sm rounded-2xl p-6 flex flex-col h-[178px]">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#EFF6FF] text-[#2563EB] rounded-lg p-2">
          <GraduationCap className="w-5 h-5" />
        </div>
        <span className="font-medium text-[#64748B] text-base">Training Progress</span>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="font-bold text-xs text-[#2563EB] bg-[#EFF6FF] rounded-full px-2 py-0.5">75%</span>
        <div className="w-24 h-2 bg-[#F1F5F9] rounded-full">
          <div className="h-2 bg-[#2563EB] rounded-full" style={{ width: '75%' }}></div>
        </div>
      </div>
    </div>
    {/* Pending Requests */}
    <div className="bg-white border border-[#F1F5F9] shadow-sm rounded-2xl p-6 flex flex-col h-[178px]">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#FAF5FF] text-[#9333EA] rounded-lg p-2">
          <Clock className="w-5 h-5" />
        </div>
        <span className="font-medium text-[#64748B] text-base">Pending Requests</span>
      </div>
      <div className="font-bold text-2xl text-[#0F172A] mb-1">3 Active</div>
      <div className="text-sm text-[#94A3B8]">Items</div>
    </div>
  </div>
);

export default DashboardCards;
