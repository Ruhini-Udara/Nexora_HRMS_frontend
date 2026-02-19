import TrainingStats from '@/components/manager/training/TrainingStats';
import TrainingTable from '@/components/manager/training/TrainingTable';

export default function TrainingRequestsPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Training Request List</h2>
                    <p className="text-gray-500 mt-1">Manage and review all pending training applications from your teams.</p>
                </div>
            </div>

            {/* Stats */}
            <TrainingStats />

            {/* Content */}
            <TrainingTable />
        </div>
    );
}
