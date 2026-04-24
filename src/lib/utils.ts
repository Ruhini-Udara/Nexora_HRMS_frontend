import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const formatTime = (timeStr: string | undefined) => {
    if (!timeStr || timeStr === "TBD") return "TBD";
    if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;
    
    try {
        const [hours, minutes] = timeStr.split(':');
        let h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        h = h ? h : 12;
        return `${h}:${minutes} ${ampm}`;
    } catch (e) {
        return timeStr;
    }
};
