import { CheckCircle, Clock, XCircle, FileText } from 'lucide-react';
import SummaryCard from '@/components/dashboard/SummaryCard';

export default function TransferStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <SummaryCard
                title="Total Requests"
                value="24"
                subContent={
                    <div className="text-gray-500 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>All time</span>
                    </div>
                }
                icon={<FileText className="w-6 h-6" />}
                iconBgColor="bg-blue-50"
                iconColor="text-blue-600"
            />
            <SummaryCard
                title="Pending"
                value="8"
                subContent={
                    <div className="text-orange-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Awaiting review</span>
                    </div>
                }
                icon={<Clock className="w-6 h-6" />}
                iconBgColor="bg-orange-50"
                iconColor="text-orange-600"
            />
            <SummaryCard
                title="Approved"
                value="12"
                subContent={
                    <div className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>This month</span>
                    </div>
                }
                icon={<CheckCircle className="w-6 h-6" />}
                iconBgColor="bg-green-50"
                iconColor="text-green-600"
            />
            <SummaryCard
                title="Rejected"
                value="4"
                subContent={
                    <div className="text-red-600 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        <span>Low matching</span>
                    </div>
                }
                icon={<XCircle className="w-6 h-6" />}
                iconBgColor="bg-red-50"
                iconColor="text-red-600"
            />
        </div>
    );
}
