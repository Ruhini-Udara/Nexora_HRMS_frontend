"use client";

import Link from "next/link";
import { MaterialIcon } from "@/components/ui/material-icon";

export default function ResetPasswordPage() {
    return (
        <div className="flex h-screen w-full bg-[#f8f7f5] dark:bg-[#23170f] overflow-hidden">
            {/* Left Side: Illustration Panel */}
            {/* Left Side: Illustration Panel */}
            {/* Left Side: Illustration Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-white flex-col justify-between px-12 pt-12 pb-6 relative h-full overflow-hidden">
                <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-8 h-8 bg-[#8B3A00] rounded flex items-center justify-center text-white">
                        <MaterialIcon icon="account_balance_wallet" className="text-xl" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-[#8B3A00]">HR MATE</span>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center max-w-lg xl:max-w-xl text-center mx-auto min-h-0">
                    <div className="mb-8 relative flex-shrink-1 min-h-0 w-full px-4">
                        <div className="absolute inset-0 bg-[#8B3A00]/5 rounded-[40%] blur-3xl -z-10 transform scale-150 mix-blend-multiply transition-transform duration-700 hover:scale-[1.6]"></div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            alt="Professional checking phone"
                            className="w-full h-auto object-contain mx-auto mix-blend-multiply max-h-[55vh] transform transition-transform duration-700 hover:scale-[1.03]"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJjVe74AhUPiM2qKxHTBpeUlipwirLfNBi59J0GAqlBIaLeqRwOw6_Yr59tkgiIbuapqEq2drkHCsNNgWxwBvuGz_-dnGon8IHb92a5S2Sn5a0QnT5jVMecSHvXIVUxf16y2POM4rK-632l7VvXfc_LWoQVqGXUuXCQh7QPZTPxX6gdRJZeYFs-MOmVmHkluEDSQuEFITe_Ui0_gqiirVDmORQawxq6jVuRf2ljaO1M1INzF_CU5ZWDFwdr2FCA-Htypcj9_zMeS4"
                        />
                    </div>
                    <h2 className="text-3xl xl:text-4xl font-semibold text-[#8B3A00] mb-4 flex-shrink-0">Almost there!</h2>
                    <p className="text-[#8B3A00]/60 leading-relaxed flex-shrink-0">
                        We have sent a secure link to your registered email address.
                    </p>
                </div>

                <div className="text-[#8B3A00]/40 text-sm text-center flex-shrink-0">
                    Copyright 2026 - 2030 HR MATE All right reserved
                </div>
            </div>

            {/* Right Side: Content Panel */}
            <div className="w-full lg:w-1/2 bg-gradient-to-br from-[#8B3A00] via-[#8B3A00] to-[#d27e40] relative h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="min-h-full flex items-center justify-center p-6 sm:p-8">
                    {/* Mobile Header */}
                    <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2 z-20">
                        <div className="w-8 h-8 bg-white/20 backdrop-blur rounded flex items-center justify-center text-white">
                            <MaterialIcon icon="account_balance_wallet" className="text-xl" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">HR MATE</span>
                    </div>

                    {/* Card */}
                    <div className="w-full max-w-[480px] bg-white rounded-xl shadow-2xl p-8 sm:p-12 transform transition-all duration-300 z-10">
                        <div className="flex flex-col items-center text-center">
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-xl transform scale-150"></div>
                                <div className="relative w-24 h-24 bg-[#8B3A00]/5 rounded-full flex items-center justify-center border border-[#8B3A00]/10">
                                    <span className="text-6xl text-[#8B3A00] flex items-center justify-center">
                                        <MaterialIcon icon="mark_email_read" className="text-6xl" />
                                    </span>
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold text-[#8B3A00] mb-4">Check your Inbox</h1>
                            <p className="text-slate-500 leading-relaxed mb-10">
                                A recovery link has been sent to your email. Please follow the instructions to reset your password.
                            </p>

                            <Link
                                href="/login"
                                className="w-full py-4 px-6 bg-[#8B3A00] text-white font-bold rounded-lg shadow-lg hover:bg-opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                            >
                                Back to Login
                                <span className="order-first group-hover:-translate-x-1 transition-transform flex items-center">
                                    <MaterialIcon icon="arrow_back" className="text-lg" />
                                </span>
                            </Link>

                            <div className="mt-8">
                                <p className="text-sm text-slate-400">
                                    Didn&apos;t receive the email?{" "}
                                    <button className="text-[#8B3A00] font-semibold hover:underline transition-all">
                                        Resend Email
                                    </button>
                                </p>
                            </div>
                        </div>


                    </div>

                    {/* Background blobs */}
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
