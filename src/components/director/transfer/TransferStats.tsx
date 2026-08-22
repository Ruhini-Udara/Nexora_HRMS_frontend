import { CheckCircle, Clock, XCircle, FileText, AlertCircle } from 'lucide-react';

export default function TransferStats({ stats }: { stats: { total: number, pending: number, approved: number, rejected: number } }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 dark:text-slate-400 text-sm font-medium">Total Requests</span>
                    <div className="size-8 rounded-lg bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <FileText className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                <div className="flex items-center gap-1 mt-1 text-gray-500 dark:text-slate-400">
                    <span className="text-xs font-bold">All time</span>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 dark:text-slate-400 text-sm font-medium">Pending</span>
                    <div className="size-8 rounded-lg bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <Clock className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
                <div className="flex items-center gap-1 mt-1 text-amber-600 dark:text-amber-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">Awaiting review</span>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 dark:text-slate-400 text-sm font-medium">Approved</span>
                    <div className="size-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.approved}</p>
                <div className="flex items-center gap-1 mt-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">This month</span>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 dark:text-slate-400 text-sm font-medium">Rejected</span>
                    <div className="size-8 rounded-lg bg-red-100 dark:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-400">
                        <XCircle className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.rejected}</p>
                <div className="flex items-center gap-1 mt-1 text-red-600 dark:text-red-400">
                    <span className="text-xs font-bold">Low matching</span>
                </div>
            </div>
        </div>
    );
}
