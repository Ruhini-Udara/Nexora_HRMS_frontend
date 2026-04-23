import ProfileCard from '@/components/director/profile/ProfileCard';
import ProfileForms from '@/components/director/profile/ProfileForms';

export default function ProfilePage() {
    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Profile & Settings</h1>
                <p className="text-gray-500 mt-1">Manage your personal information and account security settings.</p>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Left Sidebar */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <ProfileCard />
                </div>

                {/* Main Content */}
                <div className="col-span-12 lg:col-span-8">
                    <ProfileForms />
                </div>
            </div>
        </div>
    );
}

