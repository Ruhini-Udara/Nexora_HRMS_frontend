import React from "react";
import Link from "next/link";
import { Calendar, GraduationCap, ArrowLeftRight, Heart, Plane, FileText } from "lucide-react";

export interface RecentRequestItem {
  type: string;
  dateSubmitted: string;
  status: string;
}

interface RecentRequestsTableProps {
  requests: RecentRequestItem[];
  hideViewAll?: boolean;
}

const getRequestIcon = (type: string) => {
  if (type.toLowerCase().includes('leave')) {
    return (
      <div className="bg-[#FFFBEB] dark:bg-amber-950/20 text-[#D97706] dark:text-amber-400 rounded p-1">
        {type.toLowerCase().includes('overseas') ? <Plane className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
      </div>
    );
  }
  if (type.toLowerCase().includes('training')) {
    return (
      <div className="bg-[#EFF6FF] dark:bg-blue-950/20 text-[#2563EB] dark:text-blue-400 rounded p-1">
        <GraduationCap className="w-4 h-4" />
      </div>
    );
  }
  if (type.toLowerCase().includes('transfer')) {
    return (
      <div className="bg-[#FAF5FF] dark:bg-purple-950/20 text-[#9333EA] dark:text-purple-400 rounded p-1">
        <ArrowLeftRight className="w-4 h-4" />
      </div>
    );
  }
  if (type.toLowerCase().includes('welfare')) {
    return (
      <div className="bg-[#ECFDF5] dark:bg-green-950/20 text-[#059669] dark:text-green-400 rounded p-1">
        <Heart className="w-4 h-4" />
      </div>
    );
  }
  return (
    <div className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded p-1">
      <FileText className="w-4 h-4" />
    </div>
  );
};

const getStatusBadge = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'approved' || s === 'completed') {
    return <span className="bg-[#ECFDF5] dark:bg-green-950/20 text-[#047857] dark:text-green-400 px-3 py-1 rounded-full text-xs font-medium">{status}</span>;
  }
  if (s === 'rejected' || s === 'declined') {
    return <span className="bg-[#FEF2F2] dark:bg-red-950/20 text-[#B91C1C] dark:text-red-400 px-3 py-1 rounded-full text-xs font-medium">{status}</span>;
  }
  return <span className="bg-[#FFFBEB] dark:bg-amber-950/20 text-[#B45309] dark:text-amber-400 px-3 py-1 rounded-full text-xs font-medium">{status}</span>;
};

const RecentRequestsTable = ({ requests, hideViewAll = false }: RecentRequestsTableProps) => (
  <div className="bg-white dark:bg-slate-900 border border-[#F1F5F9] dark:border-slate-800 shadow-sm rounded-2xl p-8 transition-colors">
    <div className="flex justify-between items-center border-b border-[#F1F5F9] dark:border-slate-800 pb-6 mb-4">
      <h3 className="font-bold text-xl text-[#0F172A] dark:text-white">My Recent Requests</h3>
      {!hideViewAll && (
        <Link href="/employee/requests" className="text-[#8B4513] dark:text-amber-500 font-semibold text-base hover:underline">View All</Link>
      )}
    </div>
    <table className="w-full text-left">
      <thead>
        <tr className="bg-[#F8FAFC] dark:bg-slate-900/50 text-[#64748B] dark:text-slate-400 text-xs font-bold uppercase tracking-wide border-b border-[#F1F5F9] dark:border-slate-800">
          <th className="py-3 px-6">Request Type</th>
          <th className="py-3 px-6">Date Submitted</th>
          <th className="py-3 px-6">Status</th>
        </tr>
      </thead>
      <tbody className="text-[#334155] dark:text-slate-300 text-sm">
        {requests.length === 0 ? (
          <tr>
            <td colSpan={3} className="py-8 text-center text-slate-500">No recent requests found</td>
          </tr>
        ) : (
          requests.map((req, i) => (
            <tr key={i} className="border-t border-[#F1F5F9] dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <td className="py-4 px-6 flex items-center gap-2">
                {getRequestIcon(req.type)}
                {req.type}
              </td>
              <td className="py-4 px-6">
                {new Date(req.dateSubmitted).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}
              </td>
              <td className="py-4 px-6">{getStatusBadge(req.status)}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default RecentRequestsTable;
