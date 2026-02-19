import React from "react";
import ProfileCard from "@/components/hr/profile/ProfileCard";
import SettingsPanel from "@/components/hr/profile/SettingsPanel";

export default function HRProfilePage() {
    return (
        <div className="p-8 max-w-7xl mx-auto w-full flex-1">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Profile & Settings</h2>
                <p className="text-gray-600 dark:text-gray-400">Manage your personal information and account security settings.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-4">
                    <ProfileCard />
                </div>

                {/* Right Column: Content Area */}
                <div className="lg:col-span-8">
                    <SettingsPanel />
                </div>
            </div>
        </div>
    );
}
