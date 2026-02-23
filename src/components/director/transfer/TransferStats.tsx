import { CheckCircle, Clock, XCircle, FileText, AlertCircle } from 'lucide-react';

export default function TransferStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-primary/5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 text-sm font-medium">Total Requests</span>
                    <div className="size-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                        <FileText className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">24</p>
                <div className="flex items-center gap-1 mt-1 text-gray-500">
                    <span className="text-xs font-bold">All time</span>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-primary/5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 text-sm font-medium">Pending</span>
                    <div className="size-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                        <Clock className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
                <div className="flex items-center gap-1 mt-1 text-secondary">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">Awaiting review</span>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-primary/5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 text-sm font-medium">Approved</span>
                    <div className="size-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <CheckCircle className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
                <div className="flex items-center gap-1 mt-1 text-emerald-600">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">This month</span>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-primary/5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 text-sm font-medium">Rejected</span>
                    <div className="size-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                        <XCircle className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">4</p>
                <div className="flex items-center gap-1 mt-1 text-red-600">
                    <span className="text-xs font-bold">Low matching</span>
                </div>
            </div>
        </div>
    );
}
