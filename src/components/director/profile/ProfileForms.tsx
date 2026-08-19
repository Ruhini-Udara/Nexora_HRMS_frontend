import { Lock, Shield, ChevronDown } from 'lucide-react';

export default function ProfileForms() {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-slate-800 px-8">
                <button className="py-4 px-2 text-primary font-semibold border-b-2 border-primary text-sm">Personal Info</button>
                <button className="py-4 px-6 text-gray-500 dark:text-slate-400 font-medium hover:text-gray-700 dark:hover:text-slate-200 text-sm transition-colors cursor-pointer">Security</button>
                <button className="py-4 px-6 text-gray-500 dark:text-slate-400 font-medium hover:text-gray-700 dark:hover:text-slate-200 text-sm transition-colors cursor-pointer">Notifications</button>
            </div>

            <div className="p-8">
                {/* Personal Information */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-600 dark:text-slate-300">Full Name</label>
                            <input
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                type="text"
                                defaultValue="Director Profile"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-600 dark:text-slate-300">Work Email</label>
                            <input
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                type="email"
                                defaultValue="director@hrmate.com"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-600 dark:text-slate-300">Phone</label>
                            <input
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                type="text"
                                defaultValue="+1 (555) 123-4567"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-600 dark:text-slate-300">Office Location</label>
                            <div className="relative">
                                <select className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm appearance-none focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-gray-700 dark:text-slate-200 cursor-pointer">
                                    <option className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">New York HQ</option>
                                    <option className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">London Office</option>
                                    <option className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">Tokyo Hub</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-md shadow-primary/20 cursor-pointer">
                            Save Changes
                        </button>
                    </div>
                </div>

                <div className="my-10 border-t border-gray-100 dark:border-slate-800"></div>

                {/* Security */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Security</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-800">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center text-primary">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-gray-900 dark:text-white">Change Password</p>
                                    <p className="text-xs text-gray-500 dark:text-slate-400">Update your account password regularly to stay secure.</p>
                                </div>
                            </div>
                            <button className="px-4 py-1.5 border border-primary text-primary text-xs font-bold rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors cursor-pointer">
                                Update
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-800">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-950/40 flex items-center justify-center text-secondary">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-gray-900 dark:text-white">Two-Factor Authentication</p>
                                    <p className="text-xs text-gray-500 dark:text-slate-400">Add an extra layer of security to your account.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input defaultChecked type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

