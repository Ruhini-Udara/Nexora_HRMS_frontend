"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, UserX, Heart, UserMinus, ShieldQuestion, GraduationCap, Calendar } from 'lucide-react';

const DirectorSidebar = () => {
    const pathname = usePathname();

    const navLinks = [
        { label: "Dashboard", href: "/director", icon: LayoutDashboard },
        { label: "Transfer Requests", href: "/director/transfer", icon: ArrowLeftRight },
        { label: "Termination Requests", href: "/director/termination", icon: UserMinus },
        { label: "Death Applications", href: "/director/death", icon: UserX },
        { label: "Resignation Requests", href: "/director/resign", icon: ShieldQuestion },
        { label: "Welfare Requests", href: "/director/welfare", icon: Heart },
        { label: "Training Requests", href: "/director/training", icon: GraduationCap },
        { label: "Leave Requests", href: "/director/leave", icon: Calendar },
    ];

    return (
        <aside className="w-[260px] bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 left-0 z-50">
            <div className="p-6 flex items-center gap-2">
                <div className="w-10 h-10 bg-primary rounded-custom flex items-center justify-center text-white font-bold text-xl">
                    HM
                </div>
                <span className="text-xl font-bold tracking-tight text-primary">HR MATE</span>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                {navLinks.map(({ label, href, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-custom transition-colors ${isActive
                                ? "bg-primary-light text-primary border-r-4 border-primary"
                                : "text-sidebar-text hover:bg-gray-50"
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            {label}
                        </Link>
                    );
                })}
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

export default DirectorSidebar;

