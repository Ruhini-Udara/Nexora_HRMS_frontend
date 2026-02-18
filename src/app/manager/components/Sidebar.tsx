import Link from 'next/link'; // Trigger re-check
import { Home, ArrowLeftRight, UserX, Heart, UserMinus, ShieldQuestion, GraduationCap, Calendar } from 'lucide-react';

const Sidebar = () => {
    return (
        <aside className="w-[260px] bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 left-0 z-50">
            <div className="p-6 flex items-center gap-2">
                <div className="w-10 h-10 bg-primary rounded-custom flex items-center justify-center text-white font-bold text-xl">
                    HM
                </div>
                <span className="text-xl font-bold tracking-tight text-gray-800">HR MATE</span>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                <Link href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium bg-primary-light text-primary border-r-4 border-primary rounded-custom">
                    <Home className="w-5 h-5" />
                    Dashboard
                </Link>
                <Link href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-sidebar-text hover:bg-gray-50 rounded-custom">
                    <ArrowLeftRight className="w-5 h-5" />
                    Transfer Requests
                </Link>
                <Link href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-sidebar-text hover:bg-gray-50 rounded-custom">
                    <UserMinus className="w-5 h-5" />
                    Termination Requests
                </Link>
                <Link href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-sidebar-text hover:bg-gray-50 rounded-custom">
                    <UserX className="w-5 h-5" />
                    Death Applications
                </Link>
                <Link href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-sidebar-text hover:bg-gray-50 rounded-custom">
                    <ShieldQuestion className="w-5 h-5" />
                    Resignation Requests
                </Link>
                <Link href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-sidebar-text hover:bg-gray-50 rounded-custom">
                    <Heart className="w-5 h-5" />
                    Welfare Requests
                </Link>
                <Link href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-sidebar-text hover:bg-gray-50 rounded-custom">
                    <GraduationCap className="w-5 h-5" />
                    Training Requests
                </Link>
                <Link href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-sidebar-text hover:bg-gray-50 rounded-custom">
                    <Calendar className="w-5 h-5" />
                    Leave Requests
                </Link>
            </nav>
            <div className="p-4 border-t border-gray-200">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-custom hover:bg-gray-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                    Toggle Theme
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
