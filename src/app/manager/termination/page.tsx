
import TerminationStats from '@/components/manager/termination/TerminationStats';
import TerminationTable from '@/components/manager/termination/TerminationTable';

export default function TerminationRequestsPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Termination Requests</h2>
                <p className="text-gray-500 mt-1">Manage employee termination processes and exit procedures.</p>
            </div>

            <TerminationStats />

            <TerminationTable />
        </div>
    );
}
