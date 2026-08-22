import { FileText, Clock, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

export default function WelfareStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 dark:text-slate-400 text-sm font-medium">Total Applications</span>
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <FileText className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">1,248</p>
                <div className="flex items-center gap-1 mt-1 text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">+12.5%</span>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 dark:text-slate-400 text-sm font-medium">Pending Review</span>
                    <div className="size-8 rounded-lg bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <Clock className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">42</p>
                <div className="flex items-center gap-1 mt-1 text-amber-600 dark:text-amber-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">Action Required</span>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 dark:text-slate-400 text-sm font-medium">Disbursed Amount</span>
                    <div className="size-8 rounded-lg bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <DollarSign className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">$45,200</p>
                <div className="flex items-center gap-1 mt-1 text-gray-500 dark:text-slate-400">
                    <span className="text-xs font-bold">Monthly total</span>
                </div>
            </div>
        </div>
    );
}
