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
    } catch {
        return timeStr;
    }
};

export const formatDateRange = (startDate?: string, endDate?: string) => {
    if (!startDate || startDate === "TBD") return "TBD";
    if (!endDate || endDate === "TBD" || endDate === startDate) return startDate;
    return `${startDate} to ${endDate}`;
};

export const areDateRangesOverlapping = (startA?: string, endA?: string, startB?: string, endB?: string): boolean => {
    const sA = (startA || '').trim();
    const eA = (endA || startA || '').trim();
    const sB = (startB || '').trim();
    const eB = (endB || startB || '').trim();
    if (!sA || !sB) return false;
    return sA <= eB && eA >= sB;
};
