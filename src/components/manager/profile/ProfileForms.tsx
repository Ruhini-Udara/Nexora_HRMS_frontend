import { Lock, Shield, ChevronDown } from 'lucide-react';

export default function ProfileForms() {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 px-8">
                <button className="py-4 px-2 text-primary font-semibold border-b-2 border-primary text-sm">Personal Info</button>
                <button className="py-4 px-6 text-gray-500 font-medium hover:text-gray-700 text-sm transition-colors">Security</button>
                <button className="py-4 px-6 text-gray-500 font-medium hover:text-gray-700 text-sm transition-colors">Notifications</button>
            </div>

            <div className="p-8">
                {/* Personal Information */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-600">Full Name</label>
                            <input
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                type="text"
                                defaultValue="Manager Profile"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-600">Work Email</label>
                            <input
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                type="email"
                                defaultValue="manager@hrmate.com"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-600">Phone</label>
                            <input
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                type="text"
                                defaultValue="+1 (555) 123-4567"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-600">Office Location</label>
                            <div className="relative">
                                <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm appearance-none focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-gray-700">
                                    <option>New York HQ</option>
                                    <option>London Office</option>
                                    <option>Tokyo Hub</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-md shadow-primary/20">
                            Save Changes
                        </button>
                    </div>
                </div>

                <div className="my-10 border-t border-gray-100"></div>

                {/* Security */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-900">Security</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-primary">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-gray-900">Change Password</p>
                                    <p className="text-xs text-gray-500">Update your account password regularly to stay secure.</p>
                                </div>
                            </div>
                            <button className="px-4 py-1.5 border border-primary text-primary text-xs font-bold rounded-lg hover:bg-primary/5 transition-colors">
                                Update
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center text-secondary">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-gray-900">Two-Factor Authentication</p>
                                    <p className="text-xs text-gray-500">Add an extra layer of security to your account.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input defaultChecked type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
