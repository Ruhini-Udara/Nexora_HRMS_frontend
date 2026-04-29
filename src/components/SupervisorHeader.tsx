'use client';

import { Search, Bell } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

const SupervisorHeader = () => {
    const user = useAuthStore((state) => state.user);

    // Get initials for avatar fallback
    const initials = user?.name
        ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
        : "SP";

    return (
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-40">
            {/* Search */}
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

            {/* Right side */}
            <div className="flex items-center gap-6">
                {/* Bell */}
                <button className="relative p-1 text-gray-400 hover:text-gray-600">
                    <Bell className="h-6 w-6" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                </button>

                <div className="h-8 border-l border-gray-200" />

                {/* Profile */}
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-sm font-semibold text-gray-800">
                            {user?.name || "Supervisor"}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">
                            {user?.designation || user?.department || "Supervisor"}
                        </p>
                    </div>
                    {/* Avatar with initials fallback */}
                    <div className="h-10 w-10 rounded-full border border-gray-200 bg-primary flex items-center justify-center text-white text-sm font-bold">
                        {initials}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default SupervisorHeader;
