"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getSignedUrl } from "@/lib/supabaseClient";

interface UserAvatarProps {
  user: { name?: string; profilePicturePath?: string } | null;
  size?: "sm" | "md" | "lg";
}

export default function UserAvatar({ user, size = "md" }: UserAvatarProps) {
    const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const loadProfilePic = async () => {
            if (user?.profilePicturePath) {
                const url = await getSignedUrl(user.profilePicturePath, 3600);
                if (isMounted && url) {
                    setProfilePicUrl(url);
                }
            } else {
                 if (isMounted) setProfilePicUrl(null);
            }
        };
        loadProfilePic();
        return () => { isMounted = false; };
    }, [user?.profilePicturePath]);

    const initials = user?.name ? user.name.substring(0, 2).toUpperCase() : "U";
    
    let sizeClasses = "w-10 h-10";
    if (size === "sm") sizeClasses = "w-8 h-8";
    if (size === "lg") sizeClasses = "w-32 h-32 text-4xl";

    if (profilePicUrl) {
        return (
            <Image
                alt="Profile Avatar"
                src={profilePicUrl}
                width={size === "lg" ? 128 : 40}
                height={size === "lg" ? 128 : 40}
                unoptimized
                className={`${sizeClasses} rounded-full object-cover ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-900 bg-slate-100 dark:bg-slate-800`}
            />
        );
    }

    return (
        <div className={`${sizeClasses} rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-900 overflow-hidden`}>
            {initials}
        </div>
    );
}
