import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
    id: number;
    email: string;
    role: string;
    name: string;
    designation: string;
    epfNumber?: string;
    department?: string;
    branch?: string;
    employeeId?: number;
}

interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}

/**
 * Global Auth Store using Zustand.
 * Handles JWT token storage and user role information.
 */
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            isAuthenticated: false,

            login: (token, user) => set({ 
                token, 
                user, 
                isAuthenticated: true 
            }),

            logout: () => {
                // Clear state
                set({ 
                    token: null, 
                    user: null, 
                    isAuthenticated: false 
                });
                
                // Clear cookies
                document.cookie = "nexora-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                document.cookie = "nexora-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            },
        }),
        {
            // Rationale: We use 'persist' middleware to ensure that user session data 
            // survives page refreshes by automatically syncing with localStorage.
            name: 'nexora-auth-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
