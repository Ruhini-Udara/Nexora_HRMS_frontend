"use client";

import React, { useEffect, useState } from 'react';
import { Check, X, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
    position?: 'left' | 'right';
}

export function Toast({ message, type, onClose, duration = 3000, position = 'right' }: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade out animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const posStyles = position === 'left' ? 'left-4 slide-in-from-left-4' : 'right-4 slide-in-from-bottom-4';
    const baseStyles = `fixed bottom-4 z-[100] flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl animate-in fade-in ${posStyles} duration-300 transform transition-all bg-gray-900 text-white`;

    const typeIcons = {
        success: (
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 text-green-400" />
            </div>
        ),
        error: (
            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center shrink-0">
                <X className="w-5 h-5 text-red-400" />
            </div>
        ),
        info: (
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center shrink-0">
                <Info className="w-5 h-5 text-blue-400" />
            </div>
        )
    };

    if (!isVisible) return null;

    return (
        <div className={baseStyles}>
            {typeIcons[type]}
            <p className="font-medium text-sm flex-1">{message}</p>
            <button 
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                }}
                className="ml-2 hover:text-gray-300 text-gray-500 transition-colors flex items-center justify-center"
            >
                <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
        </div>
    );
}
