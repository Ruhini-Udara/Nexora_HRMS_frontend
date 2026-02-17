"use client";

import React from "react";

interface MaterialIconProps {
    icon: string;
    className?: string;
}

export function MaterialIcon({ icon, className = "text-xl" }: MaterialIconProps) {
    return (
        <span className={`material-icons-outlined ${className}`}>
            {icon}
        </span>
    );
}
