import { Clock, XCircle, CheckCircle, AlertCircle } from 'lucide-react';

export default function TrainingStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Card 1: Pending Requests */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-primary/5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 text-sm font-medium">Pending Requests</span>
                    <div className="size-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                        <Clock className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">08</p>
                <div className="flex items-center gap-1 mt-1 text-secondary">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">Action Required</span>
                </div>
            </div>

            {/* Card 2: Rejected Lists */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-primary/5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 text-sm font-medium">Rejected Lists</span>
                    <div className="size-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                        <XCircle className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
                <div className="flex items-center gap-1 mt-1 text-red-600">
                    <span className="text-xs font-bold">Updates available</span>
                </div>
            </div>

            {/* Card 3: Approved This Month */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-primary/5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 text-sm font-medium">Approved This Month</span>
                    <div className="size-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <CheckCircle className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">45</p>
                <div className="flex items-center gap-1 mt-1 text-emerald-600">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">On track</span>
                </div>
            </div>
        </div>
    );
}
