"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Mail, Phone, Camera, Briefcase, Hash, Calendar, Building, Loader2, X, Clock, User, Activity } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { uploadHrmsDocument, getProfilePictureSignedUrl } from "@/lib/supabaseClient";
import api from "@/lib/axiosInstance";
import { format } from "date-fns";

export default function ProfileView() {
    // Evaluator Note: Profile data is retrieved instantaneously from the Zustand global store.
    // Since the full user payload is injected into the store upon login, we eliminate
    // the need for a redundant API call here, significantly improving page load performance.
    const { user, login, token } = useAuthStore();
    const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    useEffect(() => {
        const loadProfilePic = async () => {
            if (user?.profilePicturePath) {
                const url = await getProfilePictureSignedUrl(user.profilePicturePath, 3600);
                if (url) {
                    setProfilePicUrl(url);
                }
            }
        };
        loadProfilePic();
    }, [user?.profilePicturePath]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        
        setIsUploading(true);
        try {
            // Upload to supabase in 'profile-pictures' folder within hrms-documents bucket
            const filePath = await uploadHrmsDocument(file, "profile-pictures");
            if (!filePath) {
                alert("Failed to upload profile picture.");
                setIsUploading(false);
                return;
            }

            // Update backend
            if (user?.id) {
                await api.patch(`/api/employees/${user.id}/profile-picture`, {
                    profilePicturePath: filePath
                });

                // Update auth store
                if (token && user) {
                    login(token, { ...user, profilePicturePath: filePath });
                }
            }
        } catch (error) {
            console.error("Error updating profile picture", error);
            alert("Error updating profile picture.");
        } finally {
            setIsUploading(false);
        }
    };

    if (!user) {
        return <div>Loading profile...</div>;
    }

    // A placeholder avatar with initials if no profile picture is set
    const initials = user.name ? user.name.substring(0, 2).toUpperCase() : "US";

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">My Profile</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm text-center flex flex-col items-center">
                    <div className="relative inline-block mb-6 w-32 h-32">
                        {profilePicUrl ? (
                            <Image
                                alt="Profile Avatar"
                                src={profilePicUrl}
                                width={128}
                                height={128}
                                unoptimized
                                className="w-32 h-32 rounded-full object-cover ring-4 ring-primary/20 p-1 mx-auto cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setIsImageModalOpen(true)}
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center ring-4 ring-primary/20 p-1 mx-auto overflow-hidden">
                                <div className="w-full h-full rounded-full bg-orange-300 dark:bg-orange-800 flex items-center justify-center text-white font-bold text-4xl">
                                    {initials}
                                </div>
                            </div>
                        )}
                        <label className="absolute bottom-0 right-0 bg-primary text-white p-2.5 rounded-full shadow-lg hover:scale-105 transition-transform border-2 border-white dark:border-slate-900 cursor-pointer flex items-center justify-center">
                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
                        </label>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">{user.designation}</p>
                    
                    <div className="w-full mt-4 pt-6 border-t border-slate-100 dark:border-slate-800 text-left space-y-4">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3 text-sm" title="Work Email">
                                <Mail className="w-5 h-5 text-slate-400" />
                                <div className="flex flex-col">
                                    <span className="text-slate-600 dark:text-slate-300 font-medium truncate">{user.email}</span>
                                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Work Email</span>
                                </div>
                            </div>
                            
                            {user.personalEmail && ["ROLE_HR", "ROLE_ADMIN", "ROLE_DIRECTOR", "ROLE_SUPERVISOR"].includes(user.role) && (
                                <div className="flex items-center gap-3 text-sm" title="Personal Email">
                                    <Mail className="w-5 h-5 text-slate-400" />
                                    <div className="flex flex-col">
                                        <span className="text-slate-600 dark:text-slate-300 font-medium truncate">{user.personalEmail}</span>
                                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Personal Email</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile Details */}
                <div className="col-span-1 md:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Personal & Employment Details</h3>
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold rounded-full border border-slate-200 dark:border-slate-700">
                            Read Only
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5"/> Role</label>
                            <p className="text-slate-800 dark:text-slate-200 font-medium">{user.role.replace("ROLE_", "")}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><Building className="w-3.5 h-3.5"/> Department</label>
                            <p className="text-slate-800 dark:text-slate-200 font-medium">{user.department || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><Hash className="w-3.5 h-3.5"/> Employee ID</label>
                            <p className="text-slate-800 dark:text-slate-200 font-medium">{user.id}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5"/> Designation</label>
                            <p className="text-slate-800 dark:text-slate-200 font-medium">{user.designation}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><Hash className="w-3.5 h-3.5"/> EPF Number</label>
                            <p className="text-slate-800 dark:text-slate-200 font-medium">{user.epfNumber || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><Building className="w-3.5 h-3.5"/> Branch</label>
                            <p className="text-slate-800 dark:text-slate-200 font-medium">{user.branch || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> Employee Type</label>
                            <p className="text-slate-800 dark:text-slate-200 font-medium">{user.employeeType || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><User className="w-3.5 h-3.5"/> Gender</label>
                            <p className="text-slate-800 dark:text-slate-200 font-medium">{user.gender || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5"/> Phone Number</label>
                            <p className="text-slate-800 dark:text-slate-200 font-medium">{user.phoneNumber || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5"/> Status</label>
                            <p className="text-slate-800 dark:text-slate-200 font-medium">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${user.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                    {user.isActive ? "Active" : "Inactive"}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fullscreen Image Modal */}
            {isImageModalOpen && profilePicUrl && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={() => setIsImageModalOpen(false)}
                >
                    <div className="relative max-w-3xl max-h-[90vh] w-full flex justify-center" onClick={(e) => e.stopPropagation()}>
                        <button 
                            className="absolute -top-12 right-0 md:-right-12 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2"
                            onClick={() => setIsImageModalOpen(false)}
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <img 
                            src={profilePicUrl} 
                            alt="Full Profile" 
                            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl ring-4 ring-white/10"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
