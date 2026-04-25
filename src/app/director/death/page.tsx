import { FileText, Clock, CheckCircle, XCircle, TrendingUp, AlertCircle } from 'lucide-react';
import DeathRequestsTable from '@/components/director/death/DeathRequestsTable';

export default function DeathApplicationsPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Death Applications</h1>
                    <p className="text-gray-500 mt-1">Review and process employee death benefit claims and documentation.</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-5 rounded-xl border border-primary/5 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500 text-sm font-medium">Total Applications</span>
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <FileText className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">48</p>
                    <div className="flex items-center gap-1 mt-1 text-emerald-600">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">This year</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-primary/5 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500 text-sm font-medium">Pending Review</span>
                        <div className="size-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">5</p>
                    <div className="flex items-center gap-1 mt-1 text-orange-600">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">Action Required</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-primary/5 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500 text-sm font-medium">Approved</span>
                        <div className="size-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">43</p>
                    <div className="flex items-center gap-1 mt-1 text-gray-500">
                        <span className="text-xs font-bold">All-time total</span>
                    </div>
                </div>
            </div>

            {/* Table */}
            <DeathRequestsTable />
        </div>
    );
}
