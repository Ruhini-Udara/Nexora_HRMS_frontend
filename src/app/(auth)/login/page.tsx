'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LogIn, Mail, Lock, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/axiosInstance';
import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import { DarkModeToggle } from "@/components/DarkModeToggle";

// Validation Schema
const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        setError(null);

        try {
            // Normalize email: trim whitespace and convert to lowercase to match DB storage
            const normalizedData = { ...data, email: data.email.trim().toLowerCase() };
            const response = await api.post('/api/auth/login', normalizedData);
            const { token, ...userData } = response.data;

            // Rationale: We save to Zustand for immediate, reactive UI updates throughout 
            // the React application without re-parsing cookies.
            login(token, userData);

            // Rationale: We save to Cookies because Middleware (server-side) cannot access 
            // Zustand or localStorage. This enables secure route protection.
            document.cookie = `nexora-token=${token}; path=/; max-age=86400; SameSite=Strict`; //Stores JWT in cookie for middleware, max-age=86400 means 24 hours.
            document.cookie = `nexora-role=${userData.role}; path=/; max-age=86400; SameSite=Strict`;

            // Rationale: Role-based redirection ensures users land on the dashboard 
            // specifically designed for their permissions.
            let redirectPath = '/employee';
            if (userData.role === 'ROLE_ADMIN') redirectPath = '/admin';
            else if (userData.role === 'ROLE_HR') redirectPath = '/hr';
            else if (userData.role === 'ROLE_DIRECTOR') redirectPath = '/director';
            else if (userData.role === 'ROLE_SUPERVISOR') redirectPath = '/supervisor';

            router.push(redirectPath);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
            } else {
                setError('Login failed. Please check your credentials.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 relative">
            <div className="w-full max-w-md z-10">
                {/* Logo & Branding */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4 shadow-lg shadow-primary/20 dark:shadow-primary/10">
                        <LogIn className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Nexora HRMS
                    </h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                        Sign in to access your dashboard
                    </p>
                </div>

                {/* Login Form Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-sm">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                                Email Address
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    {...register('email')}
                                    type="email"
                                    placeholder="name@company.com"
                                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-slate-900 dark:text-white"
                                />
                            </div>
                            {errors.email && ( /*Shows email validation error only if email is invalid.*/
                                <p className="text-xs text-red-500 ml-1 mt-1 font-medium">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Password
                                </label>
                                <a href="#" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    {...register('password')}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="block w-full pl-11 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-slate-900 dark:text-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-500 ml-1 mt-1 font-medium">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 px-6 bg-primary hover:bg-primary/90 active:bg-primary/80 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 dark:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Quick Demo Info */}
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-center text-xs text-slate-500 dark:text-slate-500 font-medium">
                            Don&apos;t have an account? <span className="text-slate-700 dark:text-slate-300">Contact your Administrator</span>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center mt-10 text-xs text-slate-400 dark:text-slate-600">
                    &copy; 2024 Nexora Solutions. All rights reserved.
                </p>
            </div>

            {/* Dark Mode Toggle */}
            <div className="absolute top-6 right-6">
                <DarkModeToggle />
            </div>
        </div>
    );
}
