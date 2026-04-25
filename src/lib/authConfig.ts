/**
 * AUTH CONFIGURATION (TEMPORARY)
 * 
 * This file centralizes hardcoded User/Employee IDs for testing the Leave Workflow.
 * These will be replaced by a dynamic Auth Provider (JWT/Session) once the 
 * User Management module is integrated by the assigned team.
 */

export const TEMP_AUTH = {
    // Current Logged-in Employee ID (for testing dashboard and submissions)
    EMPLOYEE_ID: 1,
    
    // Current Approver/Admin ID (for testing approval workflows)
    ADMIN_ID: 1,
    
    // Flag to indicate if we are in mock auth mode
    IS_MOCK_AUTH: true,
    
    // Helper to get headers for future JWT integration
    getAuthHeaders: () => ({
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${localStorage.getItem('token')}` // Future implementation
    })
};
