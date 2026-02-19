import WelfareStats from '@/components/manager/welfare/WelfareStats';
import WelfareTable from '@/components/manager/welfare/WelfareTable';
import { Plus } from 'lucide-react';

export default function WelfareRequestsPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Welfare Requests</h1>
                    <p className="text-gray-500 text-sm">Monitor and manage all active employee welfare assistance applications.</p>
                </div>
                <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-medium flex items-center space-x-2 transition-all shadow-sm">
                    <Plus className="w-5 h-5" />
                    <span>New Application</span>
                </button>
            </div>

            {/* Stats */}
            <WelfareStats />

            {/* Content */}
            <WelfareTable />
        </div>
    );
}
