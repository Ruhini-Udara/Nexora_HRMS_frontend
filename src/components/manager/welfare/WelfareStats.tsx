import { FileText, Clock, DollarSign, TrendingUp } from 'lucide-react';

export default function WelfareStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-orange-50 rounded-lg">
                        <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-bold rounded flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +12.5%
                    </span>
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Applications</p>
                    <h3 className="text-3xl font-black text-gray-900">1,248</h3>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-amber-50 rounded-lg">
                        <Clock className="w-6 h-6 text-amber-500" />
                    </div>
                    <span className="px-2 py-1 bg-amber-100 text-amber-600 text-xs font-bold rounded">Action Required</span>
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pending Review</p>
                    <h3 className="text-3xl font-black text-gray-900">42</h3>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <DollarSign className="w-6 h-6 text-blue-500" />
                    </div>
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded uppercase">Monthly</span>
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Disbursed Amount</p>
                    <h3 className="text-3xl font-black text-gray-900">$45,200</h3>
                </div>
            </div>
        </div>
    );
}
