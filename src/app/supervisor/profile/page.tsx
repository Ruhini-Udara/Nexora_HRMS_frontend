"use client";
import React, { useState } from "react";
import { Mail, Phone, Camera, CheckCircle, Edit2, Save } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function SupervisorProfilePage() {
    const { user } = useAuthStore();
    
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || "Sarah Jenkins",
        email: user?.email || "sarah.j@hexaco.com",
        designation: user?.designation || "Operations Lead",
        department: "Operations",
        phone: "+1 (555) 123-4567"
    });
    
    const [toast, setToast] = useState({ msg: "", show: false });

    const showToast = (msg: string) => {
        setToast({ msg, show: true });
        setTimeout(() => setToast({ msg: "", show: false }), 3000);
    };

    const handleSave = () => {
        setIsEditing(false);
        showToast("Profile updated successfully!");
    };

    return (
        <div className="p-8 max-w-7xl mx-auto w-full flex-1">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Profile & Settings</h2>
                <p className="text-gray-600">Manage your personal information and account security settings.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center">
                        <div className="relative inline-block mb-6">
                            <div className="w-32 h-32 rounded-full object-cover ring-4 ring-[#9e3f00]/20 p-1 mx-auto bg-[#9e3f00] flex items-center justify-center text-white text-4xl font-bold">
                                {formData.name.substring(0, 2).toUpperCase()}
                            </div>
                            <button onClick={() => showToast("Photo upload simulation triggered!")} className="absolute bottom-0 right-0 bg-[#9e3f00] text-white font-bold p-2 rounded-full shadow-lg hover:scale-105 transition-transform border-2 border-white">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{formData.name}</h3>
                        <p className="text-gray-500 mb-6">{formData.designation}</p>
                        <button onClick={() => showToast("Photo upload simulation triggered!")} className="w-full py-2.5 px-4 bg-[#9e3f00]/10 text-[#9e3f00] font-bold rounded-lg hover:bg-[#9e3f00]/20 transition-colors">
                            Change Photo
                        </button>

                        <div className="mt-8 pt-8 border-t border-gray-100 text-left space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="w-5 h-5 text-gray-400" />
                                <span className="text-gray-600">{formData.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="w-5 h-5 text-gray-400" />
                                <span className="text-gray-600">{formData.phone}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Content Area */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Account Details</h3>
                            {!isEditing ? (
                                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm font-semibold text-[#9e3f00] hover:text-[#7a3000]">
                                    <Edit2 className="w-4 h-4" /> Edit Profile
                                </button>
                            ) : (
                                <button onClick={handleSave} className="flex items-center gap-2 text-sm font-semibold text-white bg-[#9e3f00] px-4 py-1.5 rounded-lg hover:bg-[#7a3000]">
                                    <Save className="w-4 h-4" /> Save Changes
                                </button>
                            )}
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input type="text" readOnly={!isEditing} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={`w-full px-3 py-2 border rounded-md text-gray-700 ${!isEditing ? 'border-gray-200 bg-gray-50' : 'border-[#9e3f00]/50 bg-white focus:ring-2 focus:ring-[#9e3f00]/20 focus:outline-none'}`} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input type="email" readOnly={!isEditing} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={`w-full px-3 py-2 border rounded-md text-gray-700 ${!isEditing ? 'border-gray-200 bg-gray-50' : 'border-[#9e3f00]/50 bg-white focus:ring-2 focus:ring-[#9e3f00]/20 focus:outline-none'}`} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                                    <input type="text" readOnly={!isEditing} value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} className={`w-full px-3 py-2 border rounded-md text-gray-700 ${!isEditing ? 'border-gray-200 bg-gray-50' : 'border-[#9e3f00]/50 bg-white focus:ring-2 focus:ring-[#9e3f00]/20 focus:outline-none'}`} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                    <input type="text" readOnly={!isEditing} value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className={`w-full px-3 py-2 border rounded-md text-gray-700 ${!isEditing ? 'border-gray-200 bg-gray-50' : 'border-[#9e3f00]/50 bg-white focus:ring-2 focus:ring-[#9e3f00]/20 focus:outline-none'}`} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6">
                            <div className="pt-2">
                                <h4 className="text-md font-bold text-gray-900 mb-4">Security Preferences</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">Two-Factor Authentication (2FA)</p>
                                            <p className="text-sm text-gray-500">Add an extra layer of security to your account.</p>
                                        </div>
                                        <button onClick={() => showToast("Two-Factor Authentication Enabled")} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                                            Enable
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                        <div>
                                            <p className="font-medium text-gray-900">Change Password</p>
                                            <p className="text-sm text-gray-500">Update your password regularly to keep your account secure.</p>
                                        </div>
                                        <button onClick={() => showToast("A password reset link has been sent to your email.")} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                                            Update
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-full flex items-center gap-3 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-5">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium">{toast.msg}</span>
                </div>
            )}
        </div>
    );
}
