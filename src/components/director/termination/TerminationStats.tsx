import { FileText, TrendingUp, TrendingDown, Clock, CheckCircle } from 'lucide-react';

export default function TerminationStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 dark:text-slate-400 text-sm font-medium">Total Applications</span>
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <FileText className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">56</p>
                <div className="flex items-center gap-1 mt-1 text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">3.5%</span>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 dark:text-slate-400 text-sm font-medium">Pending Review</span>
                    <div className="size-8 rounded-lg bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <Clock className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
                <div className="flex items-center gap-1 mt-1 text-red-600 dark:text-red-400">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">1.2%</span>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 dark:text-slate-400 text-sm font-medium">Approved This Month</span>
                    <div className="size-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
                <div className="flex items-center gap-1 mt-1 text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">8.2%</span>
                </div>
            </div>
        </div>
    );
}
