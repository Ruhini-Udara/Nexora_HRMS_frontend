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
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-primary/5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 text-sm font-medium">Pending Requests</span>
                    <div className="size-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                        <Clock className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{String(pendingCount).padStart(2, '0')}</p>
            </div>

            {/* Card 2: Rejected Lists */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-primary/5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 text-sm font-medium">Rejected Lists</span>
                    <div className="size-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                        <XCircle className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{String(rejectedCount).padStart(2, '0')}</p>
            </div>

            {/* Card 3: Approved This Month */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-primary/5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 text-sm font-medium">Approved Programs</span>
                    <div className="size-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <CheckCircle className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{String(approvedCount).padStart(2, '0')}</p>
            </div>
        </div>
    );
}
