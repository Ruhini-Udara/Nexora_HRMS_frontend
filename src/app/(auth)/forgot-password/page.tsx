'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { DarkModeToggle } from "@/components/DarkModeToggle";

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 relative">
            <div className="w-full max-w-md z-10">
                {/* Logo & Branding */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4 shadow-lg shadow-primary/20 dark:shadow-primary/10">
                        <ShieldAlert className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Nexora HRMS
                    </h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                        Password Reset
                    </p>
                </div>

                {/* Info Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8 text-center">
                    <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed text-sm">
                        For security reasons, self-service password resets are disabled. 
                        Please contact your system administrator or HR department to request a password reset.
                    </p>
                    
                    <Link 
                        href="/login" 
                        className="w-full py-4 px-6 bg-primary hover:bg-primary/90 active:bg-primary/80 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 dark:shadow-none transition-all flex items-center justify-center gap-2 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Login</span>
                    </Link>
                </div>

            </div>

            {/* Footer */}
            <div className="absolute bottom-8 left-0 right-0 text-center">
                <p className="text-xs text-slate-400 dark:text-slate-600">
                    Copyright 2026 - 2030 HR MATE All right reserved
                </p>
            </div>

            {/* Dark Mode Toggle */}
            <div className="absolute top-6 right-6">
                <DarkModeToggle />
            </div>
        </div>
    );
}
