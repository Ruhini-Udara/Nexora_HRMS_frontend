"use client";

import React, { useEffect, useState } from 'react';

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

    const posStyles = position === 'left' ? 'left-8 slide-in-from-left-10' : 'right-8 slide-in-from-right-10';
    const baseStyles = `fixed bottom-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in ${posStyles} duration-300 transform transition-all`;
    
    const typeStyles = {
        success: "bg-emerald-500 text-white",
        error: "bg-rose-500 text-white",
        info: "bg-stone-800 text-white"
    };

    const icon = {
        success: "check_circle",
        error: "error",
        info: "info"
    };

    if (!isVisible) return null;

    return (
        <div className={`${baseStyles} ${typeStyles[type]}`}>
            <span className="material-symbols-outlined text-xl">{icon[type]}</span>
            <p className="font-semibold text-sm">{message}</p>
            <button 
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                }}
                className="ml-2 hover:opacity-70 transition-opacity"
            >
                <span className="material-symbols-outlined text-lg">close</span>
            </button>
        </div>
    );
}
