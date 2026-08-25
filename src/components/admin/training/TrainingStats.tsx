import { Clock, XCircle, CheckCircle, AlertCircle } from 'lucide-react';

interface TrainingStatsProps {
    pendingCount: number;
    rejectedCount: number;
    approvedCount: number;
}

export default function TrainingStats({ pendingCount, rejectedCount, approvedCount }: TrainingStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Card 1: Pending Requests */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 dark:text-slate-400 text-sm font-medium">Pending Requests</span>
                    <div className="size-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <Clock className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{String(pendingCount).padStart(2, '0')}</p>
            </div>

            {/* Card 2: Rejected Lists */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 dark:text-slate-400 text-sm font-medium">Rejected Lists</span>
                    <div className="size-9 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/50 dark:border-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                        <XCircle className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{String(rejectedCount).padStart(2, '0')}</p>
            </div>

            {/* Card 3: Approved This Month */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 dark:text-slate-400 text-sm font-medium">Approved Programs</span>
                    <div className="size-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{String(approvedCount).padStart(2, '0')}</p>
            </div>
        </div>
    );
}
