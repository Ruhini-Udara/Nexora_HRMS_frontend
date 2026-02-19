"use client";

import React from "react";
import Image from "next/image";

export default function SettingsPage() {
    return (
        <div className="max-w-[1200px] w-full mx-auto space-y-6">
            <div className="mb-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Account Settings & Profile</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your profile details and security preferences.</p>
            </div>

            <div className="grid grid-cols-12 gap-8 items-start">
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="h-24 bg-[#FEF9F6] dark:bg-primary/5 relative"></div>
                        <div className="px-6 pb-6 -mt-12 flex flex-col items-center text-center">
                            <div className="relative">
                                <Image
                                    alt="Tharindu Perera"
                                    width={96}
                                    height={96}
                                    className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 object-cover"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0YmfPIlwddcMgDIoZ-DHLQxnaaKF48KcwmAe0hI8hU63XGE8mxAmeEtV3pugbIL4YPwFNhGo8_tehvo0rQzkL8OzDrrcMt_fGiEwjGP6aubS2RRqMaPEoDVSvXyNgfv3tziR4_qM9woRIG2PKXdSZv1notIRXcVsAAUgC_pK7vu7Rox0C9_4by5Vcmrd8xcX7KFozke87iv1J_d1LoTaRg90EEKsFWGvYUar74aJdzfPcfYnW-gUyWsVibzL4FPa_g8LiadZbGNE"
                                />
                                <button className="absolute bottom-0 right-0 bg-yellow-500 text-white p-1.5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                                </button>
                            </div>
                            <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">Tharindu Perera</h2>
                            <p className="text-sm text-slate-500 font-medium">Software Engineer</p>
                            <p className="text-[11px] text-slate-400">Engineering Dept.</p>

                            <div className="grid grid-cols-2 gap-4 w-full mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <div>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">12</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Team Members</p>
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">4.8</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Perf. Rating</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                        <div className="flex items-center gap-2 text-primary">
                            <span className="material-symbols-outlined text-[20px]">info</span>
                            <h3 className="font-bold text-sm">Quick Info</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-slate-400 text-[18px]">calendar_today</span>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Joined Date</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">12 Oct 2022</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-slate-400 text-[18px]">location_on</span>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Location</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">Colombo, LK</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-slate-400 text-[18px]">badge</span>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">ID</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">HM-2024-0492</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-8 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
                        <div className="px-8 border-b border-slate-100 dark:border-slate-800 flex gap-8">
                            <button className="py-4 text-sm font-bold text-primary border-b-2 border-primary">Personal Details</button>
                            <button className="py-4 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Account Security</button>
                            <button className="py-4 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Notifications</button>
                        </div>
                        <div className="p-8 space-y-10">
                            <section>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 tracking-wider">Full Name</label>
                                        <input className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-sm text-slate-700 dark:text-slate-300 px-4 py-2.5 outline-none" type="text" defaultValue="Tharindu Perera" />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 tracking-wider">Official Email</label>
                                        <input className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-sm text-slate-700 dark:text-slate-300 px-4 py-2.5 outline-none" type="email" defaultValue="tharindu.p@hrmate.com" />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 tracking-wider">Phone Number</label>
                                        <input className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-sm text-slate-700 dark:text-slate-300 px-4 py-2.5 outline-none" type="tel" defaultValue="+94 77 123 4567" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 tracking-wider">Residential Address</label>
                                        <textarea className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-sm text-slate-700 dark:text-slate-300 px-4 py-2.5 h-24 resize-none outline-none" defaultValue="456 Corporate Avenue, Suite 10, Colombo 03, Sri Lanka"></textarea>
                                    </div>
                                </div>
                            </section>

                            <hr className="border-slate-100 dark:border-slate-800" />

                            <section>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">Security Overview</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700">
                                                <span className="material-symbols-outlined">lock</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">Password</p>
                                                <p className="text-xs text-slate-400">Last changed 3 months ago</p>
                                            </div>
                                        </div>
                                        <button className="text-xs font-bold text-primary hover:underline">Change Password</button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700">
                                                <span className="material-symbols-outlined">verified_user</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">Two-Factor Authentication (2FA)</p>
                                                <p className="text-xs text-slate-400">Enhanced security for your account</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                </div>
                            </section>

                            <div className="flex justify-end gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button className="px-6 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                                <button className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
