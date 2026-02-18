import React from "react";
import { Lock, Shield } from "lucide-react";

export default function SettingsPanel() {
    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark card-shadow overflow-hidden">
            <div className="border-b border-border-light dark:border-border-dark px-6">
                <nav className="flex space-x-8">
                    <button className="py-4 px-1 text-sm font-semibold border-b-2 border-primary text-primary">Personal Info</button>
                    <button className="py-4 px-1 text-sm font-medium text-gray-500 hover:text-primary transition-colors">Security</button>
                    <button className="py-4 px-1 text-sm font-medium text-gray-500 hover:text-primary transition-colors">Notifications</button>
                </nav>
            </div>

            <div className="p-8">
                <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                            <input
                                className="w-full px-4 py-2.5 border border-border-light dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-primary focus:border-primary text-gray-900 dark:text-white"
                                type="text"
                                defaultValue="HR User"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Work Email</label>
                            <input
                                className="w-full px-4 py-2.5 border border-border-light dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-primary focus:border-primary text-gray-900 dark:text-white"
                                type="email"
                                defaultValue="hr.user@hrmate.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                            <input
                                className="w-full px-4 py-2.5 border border-border-light dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-primary focus:border-primary text-gray-900 dark:text-white"
                                type="tel"
                                defaultValue="+1 (555) 987-6543"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Office Location</label>
                            <select className="w-full px-4 py-2.5 border border-border-light dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-primary focus:border-primary text-gray-900 dark:text-white">
                                <option>New York HQ</option>
                                <option defaultValue="London Branch">London Branch</option>
                                <option>Tokyo Office</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity">Save Changes</button>
                    </div>
                </div>

                <div className="mt-12 pt-12 border-t border-border-light dark:border-border-dark space-y-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Security</h4>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Lock className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Change Password</p>
                                    <p className="text-xs text-gray-500">Update your account password regularly to stay secure.</p>
                                </div>
                            </div>
                            <button className="px-4 py-2 border border-primary text-primary text-xs font-bold rounded-md hover:bg-primary hover:text-white transition-colors">Update</button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-secondary/10 rounded-lg">
                                    <Shield className="w-5 h-5 text-secondary" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Two-Factor Authentication</p>
                                    <p className="text-xs text-gray-500">Add an extra layer of security to your account.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
