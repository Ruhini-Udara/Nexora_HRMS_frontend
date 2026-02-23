import { Search, Bell } from 'lucide-react';
import Link from 'next/link';

const ManagerHeader = () => {
    return (
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-40">
            <div className="relative w-full max-w-lg">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </span>
                <input
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-custom bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    placeholder="Search for team members, requests..."
                    type="text"
                />
            </div>
            <div className="flex items-center gap-6">
                <button className="relative p-1 text-gray-400 hover:text-gray-600">
                    <Bell className="h-6 w-6" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                </button>
                <div className="h-8 border-l border-gray-200"></div>
                <Link href="/manager/profile" className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <div className="text-right">
                        <p className="text-sm font-semibold text-gray-800">Sarah Wilson</p>
                        <p className="text-xs text-gray-500 font-medium">Department Manager</p>
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        alt="User Avatar"
                        className="h-10 w-10 rounded-full border border-gray-200 object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0_EpiKV1FoHDgAQfJ4rg83HDGt52Mf76DbiZg-5YXGFexAzfFOK6HXsKwPFXZ_aBQxmRCel5HE_8VPgOE3buNKrN9gzvB-B6PXO2p92qhVvj8jVbL_VyRY2z9uj-7DtFpsErKweMcde6LaKc30qDRpXhr5sUpIK0FSsmuTYYYRNokRhVFH2Dp28wXQ98Tp6djm90wX3AYB82QOjaQPxPjJS1iNTuoYn5OT1gGfpN4JiA2hmCsiQOwMOQNcNfd2Ry0gb9SOSkRtdU"
                    />
                </Link>
            </div>
        </header>
    );
};

export default ManagerHeader;
