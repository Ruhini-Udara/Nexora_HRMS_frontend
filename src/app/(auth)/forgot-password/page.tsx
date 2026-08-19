"use client";

import Link from "next/link";
import { useState } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";

export default function ForgotPasswordPage() {
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");

    // Calculate password strength (0-4)
    const getPasswordStrength = (password: string): number => {
        if (!password) return 0;
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        return strength;
    };

    const passwordStrength = getPasswordStrength(newPassword);

    return (
        <div className="flex h-screen w-full bg-[#f8f7f5] dark:bg-[#23170f] overflow-hidden">
            {/* Left Side: Illustration Panel */}
            {/* Left Side: Illustration Panel */}
            {/* Left Side: Illustration Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-white flex-col justify-between px-12 pt-12 pb-6 relative h-full overflow-hidden">
                <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-8 h-8 bg-[#8a3900] rounded flex items-center justify-center text-white">
                        <MaterialIcon icon="account_balance_wallet" className="text-xl" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-[#8a3900]">HR MATE</span>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center max-w-lg xl:max-w-xl text-center mx-auto min-h-0">
                    <div className="mb-8 relative flex-shrink-1 min-h-0 w-full px-4">
                        <div className="absolute inset-0 bg-[#8a3900]/5 rounded-[40%] blur-3xl -z-10 transform scale-150 mix-blend-multiply transition-transform duration-700 hover:scale-[1.6]"></div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            alt="Security Illustration"
                            className="w-full h-auto object-contain mx-auto mix-blend-multiply max-h-[55vh] transform transition-transform duration-700 hover:scale-[1.03]"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJjVe74AhUPiM2qKxHTBpeUlipwirLfNBi59J0GAqlBIaLeqRwOw6_Yr59tkgiIbuapqEq2drkHCsNNgWxwBvuGz_-dnGon8IHb92a5S2Sn5a0QnT5jVMecSHvXIVUxf16y2POM4rK-632l7VvXfc_LWoQVqGXUuXCQh7QPZTPxX6gdRJZeYFs-MOmVmHkluEDSQuEFITe_Ui0_gqiirVDmORQawxq6jVuRf2ljaO1M1INzF_CU5ZWDFwdr2FCA-Htypcj9_zMeS4"
                        />
                    </div>
                    <h2 className="text-3xl xl:text-4xl font-semibold text-[#8a3900] mb-4 flex-shrink-0">Securing your journey</h2>
                    <p className="text-[#8a3900]/60 leading-relaxed flex-shrink-0">
                        We take your privacy seriously. Resetting your password ensures your professional profile stays protected within the HR MATE ecosystem.
                    </p>
                </div>

                <div className="text-[#8a3900]/40 text-sm text-center flex-shrink-0">
                    Copyright 2026 - 2030 HR MATE All right reserved
                </div>
            </div>

            {/* Right Side: Reset Form Panel */}
            <div className="w-full lg:w-1/2 bg-gradient-to-br from-[#8a3900] via-[#8a3900] to-[#d27e40] relative h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="min-h-full flex items-center justify-center p-6 sm:p-8">
                    {/* Mobile Logo */}
                    <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2 z-20">
                        <div className="w-8 h-8 bg-white/20 backdrop-blur rounded flex items-center justify-center text-white">
                            <MaterialIcon icon="account_balance_wallet" className="text-xl" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">HR MATE</span>
                    </div>

                    {/* Form Card */}
                    <div className="w-full max-w-[480px] bg-white rounded-xl shadow-2xl p-6 sm:p-8 transform transition-all duration-300 z-10">
                        <div className="mb-6 text-center lg:text-left">
                            <h1 className="text-3xl font-bold text-[#8a3900] mb-2">Reset Password</h1>
                            <p className="text-slate-500">Enter your new password below to secure your account.</p>
                        </div>

                        <form className="space-y-4">
                            {/* New Password Field */}
                            <div className="space-y-2 group">
                                <label className="block text-sm font-semibold text-[#8a3900] uppercase tracking-wider" htmlFor="new-password">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="new-password"
                                        type={showNewPassword ? "text" : "password"}
                                        placeholder="Min. 8 characters"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-[#8a3900]/20 rounded-lg focus:ring-2 focus:ring-[#8a3900]/20 focus:border-[#8a3900] outline-none transition-all placeholder:text-slate-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#8a3900] transition-colors"
                                    >
                                        <MaterialIcon icon={showNewPassword ? "visibility_off" : "visibility"} className="text-xl" />
                                    </button>
                                </div>

                                {/* Strength Indicator */}
                                <div className="flex gap-1 mt-2">
                                    {[1, 2, 3, 4].map((level) => (
                                        <div
                                            key={level}
                                            className={`h-1 flex-1 rounded-full transition-colors ${level <= passwordStrength ? "bg-[#8a3900]" : "bg-[#8a3900]/20"
                                                }`}
                                        ></div>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-400 italic">Security tip: Use a mix of letters, numbers and symbols.</p>
                            </div>

                            {/* Confirm Password Field */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-[#8a3900] uppercase tracking-wider" htmlFor="confirm-password">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirm-password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Re-enter password"
                                        className="w-full px-4 py-3 bg-slate-50 border border-[#8a3900]/20 rounded-lg focus:ring-2 focus:ring-[#8a3900]/20 focus:border-[#8a3900] outline-none transition-all placeholder:text-slate-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#8a3900] transition-colors"
                                    >
                                        <MaterialIcon icon={showConfirmPassword ? "visibility_off" : "visibility"} className="text-xl" />
                                    </button>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <button
                                type="submit"
                                className="w-full py-3 px-6 bg-[#8a3900] text-white font-bold rounded-lg shadow-lg hover:bg-opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                            >
                                Update Password
                                <span className="group-hover:translate-x-1 transition-transform flex items-center">
                                    <MaterialIcon icon="lock_reset" className="text-lg" />
                                </span>
                            </button>

                            {/* Back Link */}
                            <div className="pt-6 text-center">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 text-slate-400 font-medium hover:text-[#8a3900] transition-colors group"
                                >
                                    <span className="group-hover:-translate-x-1 transition-transform flex items-center">
                                        <MaterialIcon icon="arrow_back" className="text-sm" />
                                    </span>
                                    Back to Login
                                </Link>
                            </div>
                        </form>


                    </div>

                    {/* Decorative elements on the right panel */}
                    <div className="absolute top-0 right-0 p-8">
                        <div className="w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                    </div>
                    <div className="absolute bottom-0 right-1/4 p-8">
                        <div className="w-48 h-48 bg-black/10 rounded-full blur-3xl"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
