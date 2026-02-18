import React from "react";
import Image from "next/image";
import { Mail, Phone, Camera } from "lucide-react";

export default function ProfileCard() {
    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-8 card-shadow text-center">
            <div className="relative inline-block mb-6">
                <Image
                    alt="HR User Avatar"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0aPIXuWM-MwXdewl5Avina40OTKN91Ji7OU4AJJcLCKdP3Q2Wk4Pf7bWuw7b-QWE4GUfjLZGlbFZoDUtWTI3fZISwaHeFS6ksgEhIFd0XCSJtwQ7-StSEKlT4f2HUcj8NuZnRD4_s1SZzodHceLIMV9vkGm42tWf9KmcJwpMdlezG8Xemow-nN-cos3k6cl1hxAsgvavhzpWEdDzopxulJyKwE0ANJWcLsvVPgNelj0AmK-JW2D5ozspvfK0YqXuqi30wb1Mkkds"
                    width={128}
                    height={128}
                    className="w-32 h-32 rounded-full object-cover ring-4 ring-primary/20 p-1 mx-auto"
                />
                <button className="absolute bottom-0 right-0 bg-secondary text-primary font-bold p-2 rounded-full shadow-lg hover:scale-105 transition-transform border-2 border-white dark:border-gray-800">
                    <Camera className="w-4 h-4" />
                </button>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">HR User</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">HR Manager</p>
            <button className="w-full py-2.5 px-4 bg-secondary text-primary font-bold rounded-lg hover:opacity-90 transition-opacity">
                Change Photo
            </button>

            <div className="mt-8 pt-8 border-t border-border-light dark:border-border-dark text-left space-y-4">
                <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">hr.user@hrmate.com</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">+1 (555) 987-6543</span>
                </div>
            </div>
        </div>
    );
}
