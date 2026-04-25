import { create } from 'zustand';
import { TEMP_AUTH } from '@/lib/authConfig';

interface AuthState {
    employeeId: number;
    employeeName: string;
    isAdmin: boolean;
    setEmployeeId: (id: number) => void;
    setEmployeeName: (name: string) => void;
    setIsAdmin: (isAdmin: boolean) => void;
}

/**
 * Global Auth Store using Zustand.
 * Centralizes user identity across the application.
 */
export const useAuthStore = create<AuthState>((set) => ({
    // Initialize with values from our temp config
    employeeId: TEMP_AUTH.EMPLOYEE_ID,
    employeeName: "Employee",
    isAdmin: false,

    setEmployeeId: (id) => set({ employeeId: id }),
    setEmployeeName: (name) => set({ employeeName: name }),
    setIsAdmin: (isAdmin) => set({ isAdmin }),
}));
