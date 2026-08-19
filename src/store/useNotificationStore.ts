import { create } from 'zustand';
import api from '@/lib/axiosInstance';
import { useAuthStore } from './useAuthStore';

interface Notification {
    id: number;
    title: string;
    message: string;
    isRead: boolean;
    link: string;
    createdAt: string;
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
    fetchNotifications: () => Promise<void>;
    markAsRead: (id: number) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,

    fetchNotifications: async () => {
        const user = useAuthStore.getState().user;
        if (!user || !user.employeeId) return;

        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`/api/system-notifications/all?employeeId=${user.employeeId}`);
            const data = response.data;
            const unreadCount = data.filter((n: Notification) => !n.isRead).length;
            set({ notifications: data, unreadCount, isLoading: false });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch notifications';
            set({ error: errorMessage, isLoading: false });
        }
    },

    markAsRead: async (id: number) => {
        try {
            await api.put(`/api/system-notifications/${id}/read`);
            const { notifications } = get();
            const updatedNotifications = notifications.map((n) =>
                n.id === id ? { ...n, isRead: true } : n
            );
            const unreadCount = updatedNotifications.filter((n) => !n.isRead).length;
            set({ notifications: updatedNotifications, unreadCount });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to mark notification as read';
            console.error(errorMessage, error);
        }
    }
}));
