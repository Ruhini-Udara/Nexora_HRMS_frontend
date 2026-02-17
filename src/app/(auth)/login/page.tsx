"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { InputIcon } from "@/components/ui/input-icon";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MaterialIcon } from "@/components/ui/material-icon";
import { AuthCard, AuthHeader, AuthFooterLinks } from "@/components/auth/auth-components";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);

    const footerLinks = [
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Service", href: "#" },
        { label: "Support Center", href: "#" },
    ];

    return (
        <div className="flex min-h-screen flex-col lg:flex-row bg-white dark:bg-slate-900 transition-colors duration-300">
            {/* LEFT SIDE - Hero Section */}
            <div className="hidden lg:flex lg:w-1/2 bg-white dark:bg-zinc-900 flex-col items-center justify-center p-8 xl:p-16 relative overflow-hidden">
                {/* Decorative gradient blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-[#8B3A00]/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#8B3A00]/10 rounded-full blur-3xl"></div>

                {/* Hero Image */}
                <div className="relative z-10 w-full max-w-lg xl:max-w-xl transform hover:scale-[1.02] transition-transform duration-500">
                    <Image
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqGtxWGKdgdVf_MMqGR3iSo2Byl1zsxhuiiKxkNfpR8tIwdqVh1VXl4HoHAJN-Vx7EK_5sLC-CtlinFWLoawhNqtWUFNEAWrtWfvu2XT1kLWqosaK6_ZOlZf7xFlpObwIwSl69XlHkwSpHjHPy9KF6J4komSigSNrezoFXBAEJF8qETAV8nx__WG8w9povjrgZor2o86sjwYKA-i3M4hGjAsTSCky2_mUe6tATqjNDPepmrV6QWMMF5IBU5_aN_9F-owCkywhFu9s"
                        alt="Professional woman working on a laptop in a modern office"
                        width={800}
                        height={600}
                        className="w-full h-auto drop-shadow-2xl rounded-2xl"
                        priority
                    />
                </div>

                {/* Bottom text - positioned below image */}
                <div className="relative z-10 w-full max-w-lg xl:max-w-xl mt-6">
                    <h2 className="text-zinc-800 dark:text-zinc-100 text-xl xl:text-2xl font-semibold mb-2">
                        Elevate your workforce.
                    </h2>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm xl:text-base leading-relaxed">
                        Experience a comprehensive HR management system designed for the modern enterprise.
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE - Form Section */}
            <div className="w-full lg:w-1/2 bg-gradient-to-br from-[#8B3A00] to-[#D68D5A] flex items-center justify-center p-6 lg:p-10 xl:p-16 relative">
                {/* Decorative circles */}
                <div className="absolute inset-0 overflow-hidden opacity-20">
                    <div className="absolute top-1/4 -right-20 w-80 h-80 border-4 border-white rounded-full"></div>
                    <div className="absolute -bottom-20 -left-20 w-60 h-60 border-2 border-white/50 rounded-full"></div>
                </div>

                {/* Content */}
                <div className="w-full max-w-sm xl:max-w-md z-10">
                    <AuthCard>
                        <AuthHeader title="HR MATE" subtitle="Welcome back" />

                        <form className="space-y-6">
                            {/* Email Field */}
                            <div>
                                <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300 mb-2">
                                    Email Address
                                </Label>
                                <InputIcon
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="name@company.com"
                                    icon={<MaterialIcon icon="mail" />}
                                />
                            </div>

                            {/* Password Field */}
                            <div>
                                <Label htmlFor="password" className="text-zinc-700 dark:text-zinc-300 mb-2">
                                    Password
                                </Label>
                                <InputIcon
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    icon={<MaterialIcon icon="lock" />}
                                    endAdornment={
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-zinc-400 hover:text-[#8B3A00] transition-colors"
                                        >
                                            <MaterialIcon
                                                icon={showPassword ? "visibility_off" : "visibility"}
                                            />
                                        </button>
                                    }
                                />
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between py-1">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-[#8B3A00] focus:ring-[#8B3A00] border-zinc-300 dark:border-zinc-700 rounded transition-all"
                                    />
                                    <Label
                                        htmlFor="remember-me"
                                        className="ml-2 text-sm text-zinc-600 dark:text-zinc-400 font-normal"
                                    >
                                        Remember me
                                    </Label>
                                </div>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm font-medium text-[#8B3A00] hover:text-[#8B3A00]/80 transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full h-12 bg-[#8B3A00] hover:bg-[#722F00] text-white font-bold shadow-lg rounded-xl active:scale-[0.98] transition-all"
                            >
                                Login to Dashboard
                            </Button>
                        </form>

                        {/* Bottom Section */}
                        <div className="mt-8 pt-8">
                            <Separator className="mb-8" />
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
                                Don't have an account?{" "}
                                <Link href="#" className="font-semibold text-[#8B3A00] hover:underline">
                                    Contact Support
                                </Link>
                            </p>
                        </div>
                    </AuthCard>

                    {/* Footer Links */}
                    <AuthFooterLinks links={footerLinks} />
                </div>
            </div>

            {/* Dark Mode Toggle */}
            <DarkModeToggle />
        </div>
    );
}
