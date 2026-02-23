import DeathStats from '@/components/director/death/DeathStats';
import DeathTable from '@/components/director/death/DeathTable';

export default function DeathApplicationsPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Death Applications</h2>
                <p className="text-gray-500 mt-1">Review and process employee death benefit claims and documentation.</p>
            </div>

            <DeathStats />

            <DeathTable />
        </div>
    );
}

