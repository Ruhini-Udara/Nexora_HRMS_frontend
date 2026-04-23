import WelfareStats from '@/components/director/welfare/WelfareStats';
import WelfareTable from '@/components/director/welfare/WelfareTable';
import { Plus } from 'lucide-react';

export default function WelfareRequestsPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Welfare Requests</h1>
                    <p className="text-gray-500 mt-1">Monitor and manage all active employee welfare assistance applications.</p>
                </div>
            </div>

            {/* Stats */}
            <WelfareStats />

            {/* Content */}
            <WelfareTable />
        </div>
    );
}

