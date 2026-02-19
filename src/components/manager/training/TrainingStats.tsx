import { Clock, XCircle, CheckCircle, TrendingUp } from 'lucide-react';

export default function TrainingStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Card 1: Pending Requests */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-all">
                <div className="flex flex-col gap-1">
                    <p className="text-gray-500 text-sm font-medium">Pending Requests</p>
                    <h3 className="text-3xl font-bold text-gray-900">08</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                    <Clock className="w-6 h-6" />
                </div>
            </div>

            {/* Card 2: Rejected Lists */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-all">
                <div className="flex flex-col gap-1">
                    <p className="text-gray-500 text-sm font-medium">Rejected Lists</p>
                    <h3 className="text-3xl font-bold text-gray-900">12</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                    <XCircle className="w-6 h-6" />
                </div>
            </div>

            {/* Card 3: Approved This Month */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-all">
                <div className="flex flex-col gap-1">
                    <p className="text-gray-500 text-sm font-medium">Approved This Month</p>
                    <h3 className="text-3xl font-bold text-gray-900">45</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                    <CheckCircle className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
}
